import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LabStaffProfilesService } from './lab-staff-profiles.service';
import { CreateLabStaffProfileDto } from './dto/create-lab-staff-profile.dto';
import { UpdateLabStaffProfileDto } from './dto/update-lab-staff-profile.dto';
import { QueryLabStaffProfilesDto } from './dto/query-lab-staff-profiles.dto';
import { CreateLabStaffProfileSelfDto } from './dto/create-lab-staff-profile-self.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Lab Staff Profiles')
@Controller('lab-staff-profiles')
@UseInterceptors(CacheInterceptor)
export class LabStaffProfilesController {
  constructor(private readonly labStaffProfilesService: LabStaffProfilesService) {}

  // ======================
  // LAB STAFF SELF-SERVICE ENDPOINTS
  // ======================

  @Post('create-my-profile')
  @Roles('LABORATORY_STAFF')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create own lab staff profile (Lab Staff)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lab staff profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lab staff profile already exists or license number in use',
  })
  async createMyProfile(@CurrentUser('sub') userId: string, @Body() createDto: CreateLabStaffProfileSelfDto) {
    return await this.labStaffProfilesService.createSelf(userId, createDto);
  }

  @Get('my-lab-staff-profile')
  @Roles('LABORATORY_STAFF')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({
    summary: "Get current logged-in lab staff's profile (Lab Staff only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async getMyLabStaffProfile(@CurrentUser('sub') userId: string) {
    return await this.labStaffProfilesService.findByUserId(userId);
  }

  @Patch('my-profile')
  @Roles('LABORATORY_STAFF', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own lab staff profile (Lab Staff or Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async updateMyProfile(@Body() updateLabStaffProfileDto: UpdateLabStaffProfileDto, @CurrentUser('sub') userId: string) {
    return await this.labStaffProfilesService.updateByUserId(userId, updateLabStaffProfileDto);
  }

  // ======================
  // ADMIN ENDPOINTS
  // ======================

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a lab staff profile (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lab staff profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lab staff profile already exists or license number in use',
  })
  async create(@Body() createLabStaffProfileDto: CreateLabStaffProfileDto) {
    return await this.labStaffProfilesService.create(createLabStaffProfileDto.userId, createLabStaffProfileDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get all lab staff profiles (Admin only)' })
  @ApiQuery({
    name: 'labStaffStatus',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    description: 'Filter by lab staff status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profiles retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryLabStaffProfilesDto) {
    return await this.labStaffProfilesService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get a lab staff profile by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Lab staff profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.labStaffProfilesService.findOne(id);
  }

  @Patch('user/:userId')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lab staff profile by user ID (Admin only)' })
  @ApiParam({ name: 'userId', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async updateByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateLabStaffProfileDto: UpdateLabStaffProfileDto
  ) {
    return await this.labStaffProfilesService.updateByUserId(userId, updateLabStaffProfileDto);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify/Unverify lab staff profile (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Lab staff profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile verification updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async verifyProfile(@Param('id', ParseUUIDPipe) id: string) {
    return await this.labStaffProfilesService.verifyProfile(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a lab staff profile - soft delete (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Lab staff profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lab staff profile not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.labStaffProfilesService.remove(id);
  }
}
