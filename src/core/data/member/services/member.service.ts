import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '../entities/member.entity';
import { MembersRelationsEntity } from '../entities/member-relation.entity';
import { PaginationParamsDto } from '../../../dto/pagination-params.dto';
import { ERelationType } from '../entities/enum-relation-type';
import { NotFoundException } from '../../../exceptions';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberEntityRepository: Repository<MemberEntity>,
    @InjectRepository(MembersRelationsEntity)
    private readonly membersRelationsEntityRepository: Repository<MembersRelationsEntity>,
  ) {}

  async create(entity: MemberEntity): Promise<number> {
    return await this.memberEntityRepository.save(entity).then((res) => res.id);
  }

  async read(id: number): Promise<MemberEntity | null> {
    return await this.memberEntityRepository.findOneBy({ id });
  }

  async readAll(): Promise<MemberEntity[]> {
    return await this.memberEntityRepository.find({
      relations: ['address', 'socialsNetworks'],
    });
  }

  async readByCode(code: string): Promise<MemberEntity> {
    const member = await this.memberEntityRepository.findOne({
      where: { code },
      relations: ['address', 'socialsNetworks'],
    });

    if (!member) {
      throw new NotFoundException(`Membre avec le code ${code} non trouvé`);
    }

    return member;
  }

  async readByCodeIfExist(code: string): Promise<MemberEntity | null> {
    const member = await this.memberEntityRepository.findOne({
      where: { code },
      relations: ['address', 'socialsNetworks'],
    });
    if (!member) return null;
    return member;
  }

  async update(entity: MemberEntity): Promise<void> {
    return await this.memberEntityRepository.save(entity).then(() => undefined);
  }

  async delete(id: number): Promise<void> {
    return await this.memberEntityRepository.delete(id).then(() => undefined);
  }

  /**
   * Recherche une relation existante entre deux membres
   */
  async findExistingRelation(
    member1Id: number,
    member2Id: number,
    relationType: ERelationType,
  ): Promise<MembersRelationsEntity | null> {
    return await this.membersRelationsEntityRepository.findOne({
      where: {
        member1: { id: member1Id },
        member2: { id: member2Id },
        relationType,
      },
      relations: ['member1', 'member2'],
    });
  }

  async saveRelation(entity: MembersRelationsEntity): Promise<number> {
    return await this.membersRelationsEntityRepository
      .save(entity)
      .then((res) => res.id);
  }

  /**
   * Récupère une liste paginée de membres
   *
   * @param paginationParams Les paramètres de pagination
   * @returns Un objet contenant les membres et les métadonnées de pagination
   */
  async findPaginated(
    paginationParams: PaginationParamsDto,
  ): Promise<{ items: MemberEntity[]; total: number }> {
    const { page, limit, sortBy, sortDirection, search } = paginationParams;

    // Calculer le décalage (offset) en fonction de la page et de la limite
    const skip = ((page ?? 1) - 1) * (limit ?? 0);

    // Créer l'objet de tri
    if (sortBy) {
      const order = {};
      order[sortBy] = sortDirection;
    }

    // Préparer la requête de base
    let query = this.memberEntityRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.address', 'address')
      .leftJoinAndSelect('member.socialsNetworks', 'socialsNetworks');

    // Ajouter la condition de recherche pour les champs non chiffrés si un terme de recherche est fourni
    if (search) {
      query = query.where(
        '(member.firstName LIKE :search OR ' +
          'member.lastName LIKE :search OR ' +
          'member.nickName LIKE :search OR ' +
          'member.birthDate LIKE :search OR ' +
          'member.deathDate LIKE :search OR ' +
          'member.email LIKE :search OR ' +
          'member.phoneNumber LIKE :search OR ' +
          'address.street LIKE :search OR ' +
          'address.complement LIKE :search OR ' +
          'address.city LIKE :search OR ' +
          'address.country LIKE :search OR ' +
          'socialsNetworks.value LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ajouter l'ordre, le décalage et la limite
    query = query
      .orderBy(`member.${sortBy}`, sortDirection)
      .skip(skip)
      .take(limit);

    // Exécuter la requête
    const [items, total] = await query.getManyAndCount();
    return { items: items, total };
  }
}
