import { Injectable } from '@nestjs/common';
import { MemberService } from '../../../core/data/member/services/member.service';
import { UserService } from '../../../core/data/user/services/user.service';
import { TokenEngineService } from '../../../core/token/token.engine.service';
import { ConfigService } from '@nestjs/config';
import { MailsService } from '../../../core/mails/mails.service';
import { UserEntity } from '../../../core/data/user/entities/user.entity';
import { MemberEntity } from '../../../core/data/member/entities/member.entity';
import { AddressEntity } from '../../../core/data/member/entities/address.entity';
import { MembersRelationsEntity } from '../../../core/data/member/entities/member-relation.entity';
import { SocialNetworkEntity } from '../../../core/data/member/entities/social-network.entity';
import { ImportResultDto } from '../../../core/dto/import-result.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { MemberListItemDto } from '../dto/member-list-item.dto';
import { ERelationType } from '../../../core/data/member/entities/enum-relation-type';
import { ERole } from '../../../core/data/user/entities/enum-role';
import { ESocialNetworkType } from '../../../core/data/member/entities/enum-social-network-type';

/**
 * Service pour gérer la logique métier liée aux membres
 *
 * Ce services contient les fonctionnalités suivantes :
 * - Création et mise à jour des membres
 * - Gestion des relations entre membres (parenté, partenariats)
 * - Création automatique d'utilisateurs pour les membres éligibles
 * - Vérification des préconditions pour l'importation de données
 * - Lister les membres de façon paginée, filtrée et triée.
 */
@Injectable()
export class MembersEngineService {
  constructor(
    private readonly memberService: MemberService,
    private readonly userService: UserService,
    private readonly tokensEngine: TokenEngineService,
    private readonly configService: ConfigService,
    private readonly mailsService: MailsService,
  ) {}

  /**
   * Crée ou met à jour un membre à partir des données d'une ligne CSV
   *
   * Cette méthode:
   * - Vérifie les données obligatoires (code, prénom)
   * - Cherche si le membre existe déjà par son code
   * - Met à jour le membre existant ou en crée un nouveau
   * - Crée un utilisateur et envoie un email si le membre a plus de 15 ans
   * - Met à jour les compteurs de résultats
   *
   * @param index - L'index de la ligne dans le fichier CSV (pour les messages d'erreur)
   * @param row - Les données de la ligne CSV
   * @param result - L'objet de résultat à mettre à jour
   */
  async createOrUpdateMember(
    index: number,
    row: any,
    result: ImportResultDto,
  ): Promise<void> {
    try {
      this.verifyPreconditions(row);
      let resultCreateOrUpdate: MemberEntity | null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      const existMember = await this.memberService.readByCodeIfExist(row.code);
      if (existMember) {
        resultCreateOrUpdate = await this.updateExistingMember(
          existMember,
          row,
        );
        result.membersUpdated++;
      } else {
        resultCreateOrUpdate = await this.createAndRetrieveMember(row);
        result.membersCreated++;
      }
      await this.createOrUpdateUserAndSendMailIfMemberIsOlderThan15(
        resultCreateOrUpdate,
        result,
      );
    } catch (error) {
      result.errors.push({
        line: index + 2, // +2 car l'index commence à 0 et il y a une ligne d'en-tête
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        message: error.message,
      });
    }
  }

  /**
   * Ajoute ou met à jour les relations d'un membre en fonction de son code
   *
   * @param index - L'index de la ligne dans le fichier CSV (pour les messages d'erreur)
   * @param memberCode Code du membre pour lequel établir les relations
   * @param result - L'objet de résultat à mettre à jour
   */
  async addOrUpdateRelation(
    index: number,
    memberCode: string,
    result: ImportResultDto,
  ): Promise<void> {
    try {
      // Récupérer le membre concerné
      const member = await this.memberService.readByCodeIfExist(memberCode);
      if (!member) {
        throw new Error(`Membre avec le code ${memberCode} non trouvé`);
      }

      // Si le code est "0", c'est l'ancêtre commun, pas de relations à créer
      if (memberCode === '0') {
        return;
      }

      // Analyser si c'est un conjoint
      const { isPartner, baseCode, partnerRank } =
        this.analyzePartnerCode(memberCode);

      if (isPartner) {
        // C'est un conjoint, trouver le membre correspondant au baseCode
        const baseMember = await this.memberService.readByCodeIfExist(baseCode);
        if (!baseMember) {
          throw new Error(
            `Membre principal avec le code ${baseCode} non trouvé pour le conjoint ${memberCode}`,
          );
        }

        // Créer la relation de type partenaire (une seule relation)
        await this.createOrUpdatePartnerRelation(
          baseMember,
          member,
          partnerRank,
        );
      }

      // Traiter la relation parent-enfant si le code a au moins un point
      if (memberCode.includes('.')) {
        await this.processParentChildRelation(member, memberCode);
      }
    } catch (error) {
      result.errors.push({
        line: index + 2, // +2 car l'index commence à 0 et il y a une ligne d'en-tête
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        message: error.message,
      });
    }
  }

  /**
   * Analyse un code pour déterminer s'il s'agit d'un conjoint
   *
   * Cette méthode identifie si un code représente un conjoint en vérifiant s'il se termine par '+'
   * suivi éventuellement d'un numéro. Le numéro indique le rang du conjoint (1er, 2ème, etc.).
   *
   * Exemples:
   * - '0.1.3+' ou '0.1.3+1' : Premier conjoint du membre '0.1.3'
   * - '0.1.3+2' : Deuxième conjoint du membre '0.1.3'
   *
   * @param code Code à analyser
   * @returns Objet contenant les informations sur le code de conjoint:
   *          - isPartner: true si c'est un conjoint, false sinon
   *          - baseCode: le code de base sans le '+' et le rang
   *          - partnerRank: le rang du conjoint (1, 2, etc.) ou null si ce n'est pas un conjoint
   */
  private analyzePartnerCode(code: string): {
    isPartner: boolean;
    baseCode: string;
    partnerRank: number | null;
  } {
    // Vérifier si le code se termine par un +
    const partnerMatch = code.match(/^(.+)\+(\d*)$/);

    if (!partnerMatch) {
      return { isPartner: false, baseCode: code, partnerRank: null };
    }

    const baseCode = partnerMatch[1];
    const rankStr = partnerMatch[2];
    const partnerRank = rankStr ? parseInt(rankStr, 10) : 1; // Par défaut, le rang est 1

    return { isPartner: true, baseCode, partnerRank };
  }

  /**
   * Analyse un code pour déterminer s'il contient une information sur le parent conjoint
   *
   * Cette méthode identifie si un code contient une information sur le parent conjoint
   * en vérifiant s'il contient un '*' suivi d'un numéro. Ce numéro indique de quel conjoint
   * l'enfant est issu.
   *
   * Exemples:
   * - '0.1.3.1*1' : Premier enfant du membre '0.1.3' avec son premier conjoint
   * - '0.1.3.2*2' : Deuxième enfant du membre '0.1.3' avec son deuxième conjoint
   * - '0.1.3.1*1.1' : Premier enfant du premier enfant du membre '0.1.3' avec son premier conjoint
   *
   * @param code Code à analyser
   * @returns Objet contenant les informations sur le parent conjoint:
   *          - hasPartnerInfo: true si le code contient une information sur le parent conjoint, false sinon
   *          - baseCode: le code de base sans l'information du conjoint
   *          - partnerRank: le rang du conjoint (1, 2, etc.) ou null si pas d'information de conjoint
   */
  private analyzeChildFromPartnerCode(code: string): {
    hasPartnerInfo: boolean;
    baseCode: string;
    partnerRank: number | null;
  } {
    // Vérifier si le code contient une information sur le parent conjoint (format: xxx*y ou xxx*y.z)
    const partnerInfoMatch = code.match(/^(.+)\*(\d+)/);

    if (!partnerInfoMatch) {
      return { hasPartnerInfo: false, baseCode: code, partnerRank: null };
    }

    const baseCode = partnerInfoMatch[1];
    const partnerRank = parseInt(partnerInfoMatch[2], 10);

    // Si le code contient des parties supplémentaires après l'information du conjoint,
    // nous devons les extraire pour obtenir le code de base correct
    //const fullMatch = partnerInfoMatch[0];
    //const remainingCode = code.substring(fullMatch.length);

    return { hasPartnerInfo: true, baseCode, partnerRank };
  }

  /**
   * Crée ou met à jour une relation de type partenaire entre deux membres
   */
  private async createOrUpdatePartnerRelation(
    baseMember: MemberEntity,
    partnerMember: MemberEntity,
    partnerRank: number | null,
  ): Promise<void> {
    // Vérifier si la relation existe déjà
    const existingRelation = await this.findExistingRelation(
      baseMember.id,
      partnerMember.id,
      ERelationType.Partner,
    );

    // Mettre à jour ou créer la relation du membre principal vers le conjoint
    if (existingRelation) {
      existingRelation.rank = partnerRank;
      await this.memberService.saveRelation(existingRelation);
    } else {
      const relation = new MembersRelationsEntity();
      relation.member1 = baseMember;
      relation.member2 = partnerMember;
      relation.relationType = ERelationType.Partner;
      relation.rank = partnerRank;
      await this.memberService.saveRelation(relation);
    }
  }

  /**
   * Traite les relations parent-enfant en fonction du code
   *
   * Cette méthode gère les différents formats de code:
   * - Codes simples (ex: '0.1.2'): Relation parent-enfant standard
   * - Codes avec information de conjoint (ex: '0.1.3*2'): Enfant issu du 2ème conjoint du membre '0.1.3'
   *
   * Le format complet des codes est:
   * - '0' : Membre racine
   * - '0.1' : Premier enfant de la racine
   * - '0.1.3' : Troisième enfant du premier enfant de la racine
   * - '0.1.3+' ou '0.1.3+1' : Premier conjoint du membre '0.1.3'
   * - '0.1.3+2' : Deuxième conjoint du membre '0.1.3'
   * - '0.1.3.1*1' : Premier enfant du membre '0.1.3' avec son premier conjoint
   * - '0.1.3.2*2' : Deuxième enfant du membre '0.1.3' avec son deuxième conjoint
   */
  private async processParentChildRelation(
    member: MemberEntity,
    code: string,
  ): Promise<void> {
    // Extraire le code de base (sans le + s'il s'agit d'un conjoint)
    const { baseCode: codeWithoutPartner } = this.analyzePartnerCode(code);

    // Vérifier si le code contient une information sur le parent conjoint
    const {
      hasPartnerInfo,
      baseCode: codeWithoutPartnerInfo,
      partnerRank: parentPartnerRank,
    } = this.analyzeChildFromPartnerCode(codeWithoutPartner);

    // Le code à utiliser pour déterminer la hiérarchie est celui sans l'information du conjoint
    const codeForHierarchy = hasPartnerInfo
      ? codeWithoutPartnerInfo
      : codeWithoutPartner;

    // Diviser le code par points pour analyser la hiérarchie
    const codeParts = codeForHierarchy.split('.');

    // Si le code ne contient qu'une partie, c'est l'ancêtre ou un enfant direct de l'ancêtre
    if (codeParts.length <= 1) {
      return; // Pas de parent à traiter
    }

    // Construire le code du parent direct
    const parentCodeParts = codeParts.slice(0, -1);
    const parentCode = parentCodeParts.join('.');

    // Déterminer le rang de l'enfant (dernier nombre du code)
    const childRank = parseInt(codeParts[codeParts.length - 1], 10);

    // Récupérer le parent direct
    let parent = await this.memberService.readByCodeIfExist(parentCode);

    // Si nous avons une information sur le parent conjoint, nous devons trouver le bon parent
    if (hasPartnerInfo) {
      // Si le parent direct n'existe pas, c'est une erreur
      if (!parent) {
        throw new Error(
          `Parent avec le code ${parentCode} non trouvé pour le membre ${code}`,
        );
      }

      // Construire le code du parent conjoint
      const partnerCode = `${parentCode}+${parentPartnerRank}`;

      // Récupérer le parent conjoint
      const partnerParent =
        await this.memberService.readByCodeIfExist(partnerCode);
      if (!partnerParent) {
        throw new Error(
          `Parent conjoint avec le code ${partnerCode} non trouvé pour le membre ${code}`,
        );
      }

      // Utiliser le parent conjoint comme parent pour la relation
      parent = partnerParent;
    } else {
      // Si le parent direct n'existe pas, c'est une erreur
      if (!parent) {
        throw new Error(
          `Parent avec le code ${parentCode} non trouvé pour le membre ${code}`,
        );
      }
    }

    // Créer ou mettre à jour les relations parent-enfant dans les deux sens
    await this.createOrUpdateParentChildRelation(parent, member, childRank);
  }

  /**
   * Crée ou met à jour les relations parent-enfant entre deux membres
   */
  private async createOrUpdateParentChildRelation(
    parent: MemberEntity,
    child: MemberEntity,
    childRank: number,
  ): Promise<void> {
    // Relation parent -> enfant (relationType = Parent, rank = null)
    const existingParentRelation = await this.findExistingRelation(
      parent.id,
      child.id,
      ERelationType.Parent,
    );

    if (existingParentRelation) {
      existingParentRelation.rank = null;
      await this.memberService.saveRelation(existingParentRelation);
    } else {
      const parentRelation = new MembersRelationsEntity();
      parentRelation.member1 = parent;
      parentRelation.member2 = child;
      parentRelation.relationType = ERelationType.Parent;
      parentRelation.rank = null;
      await this.memberService.saveRelation(parentRelation);
    }

    // Relation enfant -> parent (relationType = Children, rank = childRank)
    const existingChildRelation = await this.findExistingRelation(
      child.id,
      parent.id,
      ERelationType.Children,
    );

    if (existingChildRelation) {
      existingChildRelation.rank = childRank;
      await this.memberService.saveRelation(existingChildRelation);
    } else {
      const childRelation = new MembersRelationsEntity();
      childRelation.member1 = child;
      childRelation.member2 = parent;
      childRelation.relationType = ERelationType.Children;
      childRelation.rank = childRank;
      await this.memberService.saveRelation(childRelation);
    }
  }

  /**
   * Recherche une relation existante entre deux membres
   */
  private async findExistingRelation(
    member1Id: number,
    member2Id: number,
    relationType: ERelationType,
  ): Promise<MembersRelationsEntity | null> {
    return await this.memberService.findExistingRelation(
      member1Id,
      member2Id,
      relationType,
    );
  }

  /**
   * Vérifie que les données requises sont présentes dans la ligne CSV
   *
   * @param row - Les données de la ligne CSV
   * @throws Error si le code ou le prénom est manquant
   */
  private verifyPreconditions(row: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!row.id) {
      throw new Error("L'id est requis");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!row.code) {
      throw new Error('Le code est requis');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!row.firstName) {
      throw new Error('Le prénom est requis');
    }
  }

  /**
   * Met à jour un membre existant avec les nouvelles données
   *
   * @param existMember - Le membre existant à mettre à jour
   * @param row - Les nouvelles données du membre
   * @returns Une promesse contenant le membre mis à jour
   */
  private async updateExistingMember(
    existMember: MemberEntity,
    row: any,
  ): Promise<MemberEntity | null> {
    this.updateMemberFromRow(existMember, row);
    await this.memberService.update(existMember);
    return await this.memberService.read(existMember.id);
  }

  /**
   * Met à jour les propriétés d'un membre existant à partir des données d'une ligne CSV
   *
   * @param existMember - Le membre à mettre à jour
   * @param row - Les données de la ligne CSV
   */
  private updateMemberFromRow(existMember: MemberEntity, row: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.code = row.code;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.firstName = row.firstName;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.lastName = row.lastName ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.nickName = row.nickName ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    existMember.birthDate = row.birthDate ? new Date(row.birthDate) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    existMember.deathDate = row.deathDate ? new Date(row.deathDate) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.phoneNumber = row.phoneNumber ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.mobileNumber = row.mobileNumber ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.email = row.email ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.website = row.website ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    existMember.biography = row.biography ?? null;
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.street ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.complement ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.zipCode ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.city ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.country
    ) {
      existMember.address ??= new AddressEntity();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      existMember.address.street = row.street ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      existMember.address.complement = row.complement ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      existMember.address.zipCode = row.zipCode ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      existMember.address.city = row.city ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      existMember.address.country = row.country ?? null;
    } else {
      existMember.address = undefined;
    }

    // Traiter les réseaux sociaux
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (row.socialsNetworks) {
      existMember.socialsNetworks = this.parseSocialNetworks(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        row.socialsNetworks,
        existMember,
      );
    }
  }

  /**
   * Crée un nouveau membre et le récupère avec son ID
   *
   * @param row - Les données du membre à créer
   * @returns Une promesse contenant le membre créé
   */
  private async createAndRetrieveMember(
    row: any,
  ): Promise<MemberEntity | null> {
    const member: MemberEntity = this.createMemberFromRow(row);
    const memberId = await this.memberService.create(member);
    return await this.memberService.read(memberId);
  }

  /**
   * Crée une nouvelle entité membre à partir des données d'une ligne CSV
   *
   * @param row - Les données de la ligne CSV
   * @returns Une nouvelle entité membre
   */
  private createMemberFromRow(row: any) {
    const membre = new MemberEntity();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.code = row.code;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.firstName = row.firstName;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.lastName = row.lastName ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.nickName = row.nickName ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    membre.birthDate = row.birthDate ? new Date(row.birthDate) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    membre.deathDate = row.deathDate ? new Date(row.deathDate) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.phoneNumber = row.phoneNumber ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.mobileNumber = row.mobileNumber ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.email = row.email ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.website = row.website ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    membre.biography = row.biography ?? null;
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.street ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.complement ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.zipCode ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.city ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      row.country
    ) {
      const address = new AddressEntity();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      address.street = row.street ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      address.complement = row.complement ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      address.zipCode = row.zipCode ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      address.city = row.city ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      address.country = row.country ?? null;
      membre.address = address;
    } else {
      membre.address = undefined;
    }

    // Traiter les réseaux sociaux
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (row.socialsNetworks) {
      membre.socialsNetworks = this.parseSocialNetworks(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        row.socialsNetworks,
        membre,
      );
    }

    return membre;
  }

  /**
   * Crée ou met à jour un utilisateur pour un membre et lui envoie un email si nécessaire
   *
   * Cette méthode:
   * - Vérifie si le membre a un email et a plus de 15 ans
   * - Cherche si un utilisateur existe déjà avec ce nom d'utilisateur
   * - Crée un nouvel utilisateur ou met à jour l'utilisateur existant
   * - Envoie un email d'activation pour les nouveaux utilisateurs
   * - Met à jour les compteurs dans l'objet de résultat
   *
   * @param member - Le membre pour lequel créer ou mettre à jour un utilisateur
   * @param result - L'objet de résultat à mettre à jour
   * @throws Error si la création de l'utilisateur échoue
   */
  private async createOrUpdateUserAndSendMailIfMemberIsOlderThan15(
    member: MemberEntity | null,
    result: ImportResultDto,
  ): Promise<void> {
    try {
      if (member?.email && this.isOlderThan15(member.birthDate)) {
        const existeUser = await this.userService.findByUserName(member.email);
        if (existeUser) {
          if (member.email !== existeUser.userName) {
            existeUser.userName = member.email;
            await this.userService.update(existeUser);
            result.usersUpdated++;
          }
        } else {
          const userId = await this.createUserFromMember(member);

          // Créer un token d'activation
          const token = await this.tokensEngine.createTokenForNewUser(
            userId,
            +this.configService.get('NEW_USER_LINK_DURATION'),
          );

          // Envoyer un email de validation
          await this.mailsService.sendTemplatedEmail({
            to: member.email,
            templateName: 'validating_account',
            templateData: {
              first_name: member.firstName,
              last_name: member.lastName || '',
              validation_token: `${this.configService.get(
                'APP_FRONTEND_URL',
              )}/activate/${token}`,
              support_email: this.configService.get(
                'APP_SUPPORT_EMAIL',
              ) as string,
              version: this.configService.get('APP_VERSION') as string,
              copyright: this.configService.get('APP_COPYRIGHT') as string,
            },
          });
          result.usersCreated++;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Impossible de créer un utilisateur pour le membre: ${error.message}`,
      );
    }
  }

  /**
   * Détermine si une personne a plus de 15 ans en fonction de sa date de naissance
   *
   * Cette méthode prend en compte précisément le jour et le mois de naissance
   * pour déterminer si la personne a déjà eu son anniversaire cette année.
   *
   * @param birthDate - La date de naissance à vérifier
   * @returns true si la personne a 15 ans ou plus, false sinon ou si la date est null
   */
  private isOlderThan15(birthDate: Date | undefined): boolean {
    if (!birthDate) {
      return false;
    }

    const birthDateTmp = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateTmp.getFullYear();
    const monthDiff = today.getMonth() - birthDateTmp.getMonth();

    // Si le mois actuel est inférieur au mois de naissance ou
    // si on est dans le même mois mais que le jour actuel est antérieur au jour de naissance,
    // alors on n'a pas encore atteint l'anniversaire cette année
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateTmp.getDate())
    ) {
      return age - 1 >= 15;
    }

    return age >= 15;
  }

  /**
   * Crée un nouvel utilisateur à partir des informations d'un membre
   *
   * @param member - Le membre pour lequel créer un utilisateur
   * @returns Une promesse contenant l'ID de l'utilisateur créé
   */
  private async createUserFromMember(member: MemberEntity) {
    const user = new UserEntity();
    if (member.email) {
      user.userName = member.email;
    }
    user.password = this.generateRandomPassword();
    user.role = ERole.User;
    user.member = { ...member } as MemberEntity;

    return await this.userService.create(user);
  }

  /**
   * Génère un mot de passe aléatoire sécurisé
   *
   * Ce mot de passe n'est jamais divulgué.
   * Il permet de garantir que si le mail d'un utilisateur est compromis,
   * et que le lien de validation n'a jamais eté utilisé, alors un
   * éventuel attaquant ne peut facilement se connecter (en force brute, et
   * avec un mot de passe de 14 caractères, il faudrait plus de 19 billions
   * d'années pour le faire selon une étude de Hive Systems avec un système
   * équipé de 12 GPU RTX 5090).
   *
   * @returns Un mot de passe aléatoire de 14 caractères
   */
  private generateRandomPassword(): string {
    // Génère un mot de passe aléatoire de 14 caractères
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 14; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Parse une chaîne de réseaux sociaux au format "[(type,valeur)]" et crée des entités SocialNetworkEntity
   *
   * Exemple de format: "[(Facebook,https://facebook.com/user1),(LinkedIn,https://linkedin.com/in/user1)]"
   *
   * @param socialsNetworksString - La chaîne de réseaux sociaux à parser
   * @param member - Le membre auquel associer les réseaux sociaux
   * @returns Un tableau d'entités SocialNetworkEntity
   */
  private parseSocialNetworks(
    socialsNetworksString: string,
    member: MemberEntity,
  ): SocialNetworkEntity[] {
    const socialNetworks: SocialNetworkEntity[] = [];

    // Vérifier si la chaîne est vide ou null
    if (!socialsNetworksString || socialsNetworksString.trim() === '') {
      return socialNetworks;
    }

    // Supprimer les crochets extérieurs
    const content = socialsNetworksString.trim().replace(/^\[\s*|\s*\]$/g, '');

    // Extraire chaque tuple (type, valeur), en ignorant les virgules entre les tuples
    const tupleRegex = /\(([^,]+),([^)]+)\)/g;
    let match;

    while ((match = tupleRegex.exec(content)) !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const type = match[1].trim();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const value = match[2].trim();

      // Vérifier si le type est valide
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (this.isValidSocialNetworkType(type)) {
        const socialNetwork = new SocialNetworkEntity();
        socialNetwork.member = member;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        socialNetwork.socialNetworkType = ESocialNetworkType[type];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        socialNetwork.value = value;

        socialNetworks.push(socialNetwork);
      }
    }

    return socialNetworks;
  }

  /**
   * Vérifie si un type de réseau social est valide
   *
   * @param type - Le type de réseau social à vérifier
   * @returns true si le type est valide, false sinon
   */
  private isValidSocialNetworkType(type: string): boolean {
    return Object.keys(ESocialNetworkType).includes(type);
  }

  /**
   * Récupère une liste paginée de membres
   *
   * Cette méthode:
   * - Récupère les membres depuis le services de données avec pagination
   * - Convertit les entités en DTOs pour l'affichage
   * - Construit et retourne une réponse paginée
   *
   * @param paginationParams Les paramètres de pagination (page, limite, tri)
   * @returns Une réponse paginée contenant les membres
   */
  async getPaginatedMembers(
    paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<MemberListItemDto>> {
    // Récupérer les membres paginés depuis le services de données
    const { items, total } =
      await this.memberService.findPaginated(paginationParams);

    // Convertir les entités en DTOs
    const memberDtos = items.map((member) =>
      MemberListItemDto.fromEntity(member),
    );

    // Créer et retourner la réponse paginée
    return new PaginatedResponseDto<MemberListItemDto>(
      memberDtos,
      total,
      paginationParams.page,
      paginationParams.limit,
    );
  }
}
