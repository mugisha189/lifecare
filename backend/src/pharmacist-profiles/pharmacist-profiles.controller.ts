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
import { PharmacistProfilesService } from './pharmacist-profiles.service';
import { CreatePharmacistProfileDto } from './dto/create-pharmacist-profile.dto';
import { UpdatePharmacistProfileDto } from './dto/update-pharmacist-profile.dto';
import { QueryPharmacistProfilesDto } from './dto/query-pharmacist-profiles.dto';
import { CreatePharmacistProfileSelfDto } from './dto/create-pharmacist-profile-self.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pharmacist Profiles')
@Controller('pharmacist-profiles')
@UseInterceptors(CacheInterceptor)
export class PharmacistProfilesController {
  constructor(private readonly pharmacistProfilesService: PharmacistProfilesService) {}

  // ======================
  // PHARMACIST SELF-SERVICE ENDPOINTS
  // ======================

  @Post('create-my-profile')
  @Roles('PHARMACIST')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create own pharmacist profile (Pharmacist)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pharmacist profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Pharmacist profile already exists or license number in use',
  })
  async createMyProfile(@CurrentUser('sub') userId: string, @Body() createDto: CreatePharmacistProfileSelfDto) {
    return await this.pharmacistProfilesService.createSelf(userId, createDto);
  }

  @Get('my-pharmacist-profile')
  @Roles('PHARMACIST')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({
    summary: "Get current logged-in pharmacist's profile (Pharmacist only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async getMyPharmacistProfile(@CurrentUser('sub') userId: string) {
    return await this.pharmacistProfilesService.findByUserId(userId);
  }

  @Patch('my-profile')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own pharmacist profile (Pharmacist or Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async updateMyProfile(@Body() updatePharmacistProfileDto: UpdatePharmacistProfileDto, @CurrentUser('sub') userId: string) {
    return await this.pharmacistProfilesService.updateByUserId(userId, updatePharmacistProfileDto);
  }

  // ======================
  // ADMIN ENDPOINTS
  // ======================

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a pharmacist profile (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pharmacist profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Pharmacist profile already exists or license number in use',
  })
  async create(@Body() createPharmacistProfileDto: CreatePharmacistProfileDto) {
    return await this.pharmacistProfilesService.create(createPharmacistProfileDto.userId, createPharmacistProfileDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get all pharmacist profiles (Admin only)' })
  @ApiQuery({
    name: 'pharmacistStatus',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    description: 'Filter by pharmacist status',
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
    description: 'Pharmacist profiles retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryPharmacistProfilesDto) {
    return await this.pharmacistProfilesService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get a pharmacist profile by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacist profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmacistProfilesService.findOne(id);
  }

  @Patch('user/:userId')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update pharmacist profile by user ID (Admin only)' })
  @ApiParam({ name: 'userId', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async updateByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updatePharmacistProfileDto: UpdatePharmacistProfileDto
  ) {
    return await this.pharmacistProfilesService.updateByUserId(userId, updatePharmacistProfileDto);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify/Unverify pharmacist profile (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacist profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile verification updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async verifyProfile(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmacistProfilesService.verifyProfile(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a pharmacist profile - soft delete (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacist profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacist profile not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmacistProfilesService.remove(id);
  }
}
