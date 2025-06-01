import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../../../core/data/user/services/user.service';
import { UserListItemDto } from '../dto/user-list-item.dto';
import { UserEntity } from '../../../core/data/user/entities/user.entity';
import { UserDto } from '../dto/user.dto';
import { InactivatedCauseDto } from '../dto/inactivated-cause.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../../core/exceptions';

/**
 * Service pour gérer la logique métier liée aux utilisateurs
 *
 * Ce services contient les fonctionnalités suivantes :
 * - Lister les utilisateurs de façon paginée, filtrée et triée.
 * - Création, mise à jour et suppression des utilisateurs.
 * - Validation de la création des utilisateurs.
 * - Gestion des utilisateurs inactifs.
 */
@Injectable()
export class UsersEngineService {
  private readonly logger = new Logger(UsersEngineService.name);

  constructor(private readonly userRepository: UserService) {}

  /**
   * Crée un nouvel utilisateur
   *
   * @param user L'entité utilisateur à créer
   * @returns L'ID de l'utilisateur créé
   */
  async createUser(user: UserEntity): Promise<{ id: number }> {
    const id = await this.userRepository.create(user);
    return { id };
  }

  /**
   * Récupère un utilisateur par son ID
   *
   * @param id L'ID de l'utilisateur à récupérer
   * @returns L'utilisateur trouvé
   * @throws BadRequestException si l'utilisateur n'est pas trouvé
   */
  async getUserById(id: number): Promise<UserDto> {
    const user = await this.userRepository.read(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return UserDto.fromEntity(user);
  }

  /**
   * Récupère un utilisateur par son nom d'utilisateur
   *
   * @param username Le nom d'utilisateur de l'utilisateur à récupérer
   * @returns L'utilisateur trouvé
   * @throws BadRequestException si l'utilisateur n'est pas trouvé
   */
  async getUserByUsername(username: string): Promise<UserDto> {
    const user = await this.userRepository.findByUserName(username);
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return UserDto.fromEntity(user);
  }

  /**
   * Met à jour un utilisateur
   *
   * @param id L'ID de l'utilisateur à mettre à jour
   * @param user Les données de l'utilisateur à mettre à jour
   */
  async updateUser(id: number, user: UserEntity): Promise<void> {
    user.id = +id;
    return await this.userRepository.update(user);
  }

  /**
   * Désactive un utilisateur
   *
   * @param id L'ID de l'utilisateur à désactiver
   * @param cause La cause de la désactivation
   * @throws BadRequestException si l'utilisateur n'est pas trouvé
   */
  async deactivateUser(id: number, cause: InactivatedCauseDto): Promise<void> {
    const user = await this.userRepository.read(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    user.causeOfInactivation = cause.cause;
    user.inactivatedDate = new Date();
    user.inactivated = true;
    return await this.userRepository.update(user);
  }

  /**
   * Réactive un utilisateur
   *
   * @param id L'ID de l'utilisateur à réactiver
   * @throws BadRequestException si l'utilisateur n'est pas trouvé
   */
  async reactivateUser(id: number): Promise<void> {
    const user = await this.userRepository.read(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    user.causeOfInactivation = undefined;
    user.inactivatedDate = undefined;
    user.inactivated = false;
    return await this.userRepository.update(user);
  }

  /**
   * Supprime un utilisateur
   *
   * @param id L'ID de l'utilisateur à supprimer
   */
  async deleteUser(id: number): Promise<void> {
    return await this.userRepository.delete(id);
  }

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
    try {
      // Apply default values if not provided
      const params: PaginationParamsDto = {
        page: paginationParams.page || 1,
        limit: paginationParams.limit || 10,
        sortBy: paginationParams.sortBy || 'id',
        sortDirection: paginationParams.sortDirection || 'ASC',
        search: paginationParams.search,
      };

      // Récupérer les membres paginés depuis le service des données
      const { items, total } = await this.userRepository.findPaginated(params);

      // Convertir les entités en DTOs
      const usersDtos = items.map((user) => UserListItemDto.fromEntity(user));

      // Créer et retourner la réponse paginée
      return new PaginatedResponseDto<UserListItemDto>(
        usersDtos,
        total,
        params.page,
        params.limit,
      );
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error retrieving users: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(`Error retrieving users: ${error.message}`);
    }
  }
}
