import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour les métadonnées de pagination
 *
 * Ce DTO contient les informations sur la pagination actuelle,
 * comme le nombre total d'éléments, le nombre de pages, etc.
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: "Nombre total d'éléments",
    type: Number,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Nombre total de pages',
    type: Number,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Page actuelle',
    type: Number,
  })
  currentPage?: number;

  @ApiProperty({
    description: "Nombre d'éléments par page",
    type: Number,
  })
  itemsPerPage?: number;

  @ApiProperty({
    description: 'Y a-t-il une page précédente',
    type: Boolean,
  })
  hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Y a-t-il une page suivante',
    type: Boolean,
  })
  hasNextPage: boolean;
}

/**
 * DTO générique pour une réponse paginée
 *
 * Ce DTO est utilisé pour renvoyer une liste paginée d'éléments
 * avec les métadonnées de pagination.
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Liste des éléments pour la page actuelle',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  /**
   * Crée une nouvelle instance de PaginatedResponseDto
   *
   * @param items Les éléments pour la page actuelle
   * @param totalItems Le nombre total d'éléments
   * @param currentPage La page actuelle
   * @param itemsPerPage Le nombre d'éléments par page
   */
  constructor(
    items: T[],
    totalItems: number,
    currentPage: number | undefined,
    itemsPerPage: number | undefined,
  ) {
    this.items = items;

    const totalPages = Math.ceil(totalItems / (itemsPerPage ?? 1));

    this.meta = {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      hasPreviousPage: (currentPage ?? 0) > 1,
      hasNextPage: (currentPage ?? 0) < totalPages,
    };
  }
}
