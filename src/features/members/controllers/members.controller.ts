import {
  Controller,
  Get,
  BadRequestException,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MembersEngineService } from '../services/members.engine.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { MemberListItemDto } from '../dto/member-list-item.dto';

@ApiTags('Membres')
@Controller('members')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(private readonly memberEngineService: MembersEngineService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer une liste paginée de membres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des membres récupérée avec succès',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getMembers(
    @Query() paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<MemberListItemDto>> {
    try {
      // Apply default values if not provided
      const params: PaginationParamsDto = {
        page: paginationParams.page || 1,
        limit: paginationParams.limit || 10,
        sortBy: paginationParams.sortBy || 'id',
        sortDirection: paginationParams.sortDirection || 'ASC',
        search: paginationParams.search,
      };

      return await this.memberEngineService.getPaginatedMembers(params);
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des membres: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des membres: ${error.message}`,
      );
    }
  }
}
