import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create user by admin (Admin only)',
    description:
      'Admin registration endpoint. Creates a new user account without returning authentication tokens. Sends OTP verification via email and SMS.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User created successfully' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or phone number already exists',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Email or phone number already exists' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Role with ID "..." not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto, {
      sendWelcomeEmail: true,
      sendVerification: true,
    });
  }

  @Get('roles/all')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all roles (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
  })
  async getRoles() {
    return await this.usersService.getRoles();
  }

  @Get('search')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Search users by query and optional role filter (Admin, Doctor)' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query (name, email, phone, identifier, nationalId)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role name (DOCTOR, PHARMACIST, LABORATORY_STAFF, PATIENT, etc.)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results (default: 20)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users found successfully',
  })
  async searchUsers(
    @Query('q') query?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.usersService.searchUsers(query, role, limit ? parseInt(limit) : 20);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User with ID "..." not found' },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User with ID "..." not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or phone number already in use',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Email or phone number already in use' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user (soft delete) (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User with ID "..." not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.remove(id);
  }

  @Post(':id/activate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activate or deactivate user (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User activation status updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async toggleActivation(@Param('id', ParseUUIDPipe) id: string, @Body() body: { active: boolean }) {
    return await this.usersService.toggleActivation(id, body.active);
  }

  @Post(':id/suspend')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Suspend user account (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User suspended successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async suspendUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() suspendUserDto: SuspendUserDto,
    @CurrentUser('sub') adminId: string
  ) {
    return await this.usersService.suspendUser(id, suspendUserDto, adminId);
  }

  @Post(':id/unsuspend')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Unsuspend user account (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User unsuspended successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async unsuspendUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.unsuspendUser(id);
  }

  @Get(':id/activity')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user activity logs (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User activities retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async getUserActivity(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getUserActivity(id);
  }
}
