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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { UserListItemDto } from '../dto/user-list-item.dto';
import { UsersEngineService } from '../services/users.engine.service';
import { ERole } from '../../../core/data/user/entities/enum-role';
import { UserDto } from '../dto/user.dto';
import { InactivatedCauseDto } from '../dto/inactivated-cause.dto';

@ApiTags('Users')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user in the system. Requires SuperAdmin role.',
  })
  @ApiBody({ type: UserEntity })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'The ID of the created user',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
  async create(@Body() user: UserEntity): Promise<{ id: number }> {
    const id = await this.userService.create(user);
    return { id };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  @ApiOperation({
    summary: 'Get paginated list of users',
    description:
      'Retrieves a paginated list of users with filtering and sorting options. Requires SuperAdmin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users list successfully retrieved',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
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
        `Error retrieving users: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error retrieving users: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their ID',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: number): Promise<UserDto> {
    return await this.userService.read(id).then((user) => {
      if (!user) {
        throw new BadRequestException(`User ${id} not found`);
      }
      return UserDto.fromEntity(user);
    });
  }

  @Get('username/:username')
  @ApiOperation({
    summary: 'Get user by username',
    description: 'Retrieves a user by their username',
  })
  @ApiParam({ name: 'username', description: 'Username', type: String })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUsername(@Param('username') username: string): Promise<UserDto> {
    return await this.userService.findByUserName(username).then((user) => {
      if (!user) {
        throw new BadRequestException(`User ${username} not found`);
      }
      return UserDto.fromEntity(user);
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user. Requires SuperAdmin role.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: UserEntity })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiOperation({
    summary: 'Deactivate user',
    description:
      'Deactivates a user with a specified cause. Requires SuperAdmin role.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: InactivatedCauseDto })
  @ApiResponse({ status: 200, description: 'User successfully deactivated' })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
  async deactivate(
    @Param('id') id: number,
    @Body() cause: InactivatedCauseDto,
  ): Promise<void> {
    const user = await this.userService.read(id);
    if (!user) {
      throw new BadRequestException(`User ${id} not found`);
    }
    user.causeOfInactivation = cause.cause;
    user.inactivatedDate = new Date();
    user.inactivated = true;
    return await this.userService.update(user);
  }

  @Put('reactivate/:id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  @ApiOperation({
    summary: 'Reactivate user',
    description:
      'Reactivates a previously deactivated user. Requires SuperAdmin role.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'User successfully reactivated' })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
  async reactivate(@Param('id') id: number): Promise<void> {
    const user = await this.userService.read(id);
    if (!user) {
      throw new BadRequestException(`User ${id} not found`);
    }
    user.causeOfInactivation = undefined;
    user.inactivatedDate = undefined;
    user.inactivated = false;
    return await this.userService.update(user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ERole.SuperAdmin)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user from the system. Requires SuperAdmin role.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin role',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: number): Promise<void> {
    return await this.userService.delete(id);
  }
}
