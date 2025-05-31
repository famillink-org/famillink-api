import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../../core/data/user/services/user.service';
import { UserEntity } from '../../../core/data/user/entities/user.entity';
import { Roles } from '../../../core/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { UserListItemDto } from '../dto/user-list-item.dto';
import { UsersEngineService } from '../services/users.engine.service';
import { ERole } from '../../../core/data/user/entities/enum-role';
import { UserDto } from '../dto/user.dto';
import { InactivatedCauseDto } from '../dto/inactivated-cause.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly userService: UserService,
    private readonly userEngineService: UsersEngineService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async create(@Body() user: UserEntity): Promise<{ id: number }> {
    const id = await this.userService.create(user);
    return { id };
  }

  @Get()
  @ApiOperation({ summary: "Récupérer une liste paginée d'utilisateurs" })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async getAllFilteredAnsSortedByPage(
    @Query() paginationParams: PaginationParamsDto,
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

      return await this.userEngineService.getPaginatedUsers(params);
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des utilisateurs: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des utilisateurs: ${error.message}`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserDto> {
    return await this.userService.read(id).then((user) => {
      if (!user) {
        throw new BadRequestException(`Utilisateur ${id} introuvable`);
      }
      return UserDto.fromEntity(user);
    });
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<UserDto> {
    return await this.userService.findByUserName(username).then((user) => {
      if (!user) {
        throw new BadRequestException(`Utilisateur ${username} introuvable`);
      }
      return UserDto.fromEntity(user);
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async update(
    @Param('id') id: number,
    @Body() user: UserEntity,
  ): Promise<void> {
    user.id = +id;
    return await this.userService.update(user);
  }

  @Put('deactivate/:id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async deactivate(
    @Param('id') id: number,
    @Body() cause: InactivatedCauseDto,
  ): Promise<void> {
    const user = await this.userService.read(id);
    if (!user) {
      throw new BadRequestException(`Utilisateur ${id} introuvable`);
    }
    user.causeOfInactivation = cause.cause;
    user.inactivatedDate = new Date();
    user.inactivated = true;
    return await this.userService.update(user);
  }

  @Put('reactivate/:id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async reactivate(@Param('id') id: number): Promise<void> {
    const user = await this.userService.read(id);
    if (!user) {
      throw new BadRequestException(`Utilisateur ${id} introuvable`);
    }
    user.causeOfInactivation = undefined;
    user.inactivatedDate = undefined;
    user.inactivated = false;
    return await this.userService.update(user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  async delete(@Param('id') id: number): Promise<void> {
    return await this.userService.delete(id);
  }
}
