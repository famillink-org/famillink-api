import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../../core/data/user/services/user.service';
import { UserListItemDto } from '../dto/user-list-item.dto';

/**
 * Service pour gérer la logique métier liée aux utilisateurs
 *
 * Ce services contient les fonctionnalités suivantes :
 * - Lister les utilisateurs de façon paginée, filtrée et triée.
 *
 * Il reste à implementer les fonctionnalités suivantes :
 * - Création, mise à jour et suppression des utilisateurs.
 * - Validation de la création des utilisateurs.
 * - Gestion des mots de passes oubliés.
 */
@Injectable()
export class UsersEngineService {
  constructor(private readonly userRepository: UserService) {}

  /**
   * Récupère une liste paginée des utilisateurs
   *
   * Cette méthode:
   * - Récupère les utilisateurs depuis le services de données avec pagination
   * - Convertit les entités en DTOs pour l'affichage
   * - Construit et retourne une réponse paginée.
   *
   * @param paginationParams Les paramètres de pagination (page, limite, tri)
   * @returns Une réponse paginée contenant les utilisateurs
   */
  async getPaginatedUsers(
    paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<UserListItemDto>> {
    // Récupérer les membres paginés depuis le service des données
    const { items, total } =
      await this.userRepository.findPaginated(paginationParams);

    // Convertir les entités en DTOs
    const usersDtos = items.map((user) => UserListItemDto.fromEntity(user));

    // Créer et retourner la réponse paginée
    return new PaginatedResponseDto<UserListItemDto>(
      usersDtos,
      total,
      paginationParams.page,
      paginationParams.limit,
    );
  }
}
