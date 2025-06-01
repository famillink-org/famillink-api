import { Injectable } from '@nestjs/common';
import { MemberService } from '../../../core/data/member/services/member.service';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { MemberListItemDto } from '../dto/member-list-item.dto';

/**
 * Service pour gérer la logique métier liée aux membres
 *
 * Ce service contient les fonctionnalités suivantes :
 * - Lister les membres de façon paginée, filtrée et triée.
 */
@Injectable()
export class MembersEngineService {
  constructor(private readonly memberService: MemberService) {}

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
