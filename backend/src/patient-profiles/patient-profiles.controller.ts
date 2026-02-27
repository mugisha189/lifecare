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
import { PatientProfilesService } from './patient-profiles.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { QueryPatientProfilesDto } from './dto/query-patient-profiles.dto';
import { CreatePatientProfileSelfDto } from './dto/create-patient-profile-self.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Patient Profiles')
@Controller('patient-profiles')
@UseInterceptors(CacheInterceptor)
export class PatientProfilesController {
  constructor(private readonly patientProfilesService: PatientProfilesService) {}

  // ======================
  // PATIENT SELF-SERVICE ENDPOINTS
  // ======================

  @Post('create-my-profile')
  @Roles('PATIENT')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create own patient profile (Patient)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Patient profile already exists',
  })
  async createMyProfile(@CurrentUser('sub') userId: string, @Body() createDto: CreatePatientProfileSelfDto) {
    return await this.patientProfilesService.createSelf(userId, createDto);
  }

  @Get('my-patient-profile')
  @Roles('PATIENT')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({
    summary: "Get current logged-in patient's profile (Patient only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async getMyPatientProfile(@CurrentUser('sub') userId: string) {
    return await this.patientProfilesService.findByUserId(userId);
  }

  @Patch('my-profile')
  @Roles('PATIENT')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own patient profile (Patient only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async updateMyProfile(
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
    @CurrentUser('sub') userId: string
  ) {
    return await this.patientProfilesService.updateByUserId(userId, updatePatientProfileDto);
  }

  // ======================
  // ADMIN ENDPOINTS
  // ======================

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a patient profile (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient profile created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Patient profile already exists',
  })
  async create(@Body() createPatientProfileDto: CreatePatientProfileDto) {
    return await this.patientProfilesService.create(createPatientProfileDto.userId, createPatientProfileDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get all patient profiles (Admin only)' })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    enum: ['VERIFIED', 'UNVERIFIED', 'PENDING'],
    description: 'Filter by verification status',
  })
  @ApiQuery({
    name: 'minLoyaltyPoints',
    required: false,
    type: Number,
    description: 'Filter by minimum loyalty points',
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
    description: 'Patient profiles retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryPatientProfilesDto) {
    return await this.patientProfilesService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get a patient profile by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Patient profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientProfilesService.findOne(id);
  }

  @Patch('user/:userId')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update patient profile by user ID (Admin only)' })
  @ApiParam({ name: 'userId', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async updateByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updatePatientProfileDto: UpdatePatientProfileDto
  ) {
    return await this.patientProfilesService.updateByUserId(userId, updatePatientProfileDto);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify patient profile (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Patient profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async verifyProfile(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientProfilesService.verifyProfile(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a patient profile - soft delete (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Patient profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient profile not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientProfilesService.remove(id);
  }
}
