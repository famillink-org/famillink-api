import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  constructor(private readonly userEngineService: UsersEngineService) {}

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
    return await this.userEngineService.createUser(user);
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
    return await this.userEngineService.getPaginatedUsers(paginationParams);
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
    return await this.userEngineService.getUserById(id);
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
    return await this.userEngineService.getUserByUsername(username);
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
    return await this.userEngineService.updateUser(id, user);
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
    return await this.userEngineService.deactivateUser(id, cause);
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
    return await this.userEngineService.reactivateUser(id);
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
    return await this.userEngineService.deleteUser(id);
  }
}
