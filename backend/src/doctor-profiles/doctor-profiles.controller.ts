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
import { DoctorProfilesService } from './doctor-profiles.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { QueryDoctorProfilesDto } from './dto/query-doctor-profiles.dto';
import { CreateDoctorProfileSelfDto } from './dto/create-doctor-profile-self.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Doctor Profiles')
@Controller('doctor-profiles')
@UseInterceptors(CacheInterceptor)
export class DoctorProfilesController {
  constructor(private readonly doctorProfilesService: DoctorProfilesService) {}

  // ======================
  // DOCTOR SELF-SERVICE ENDPOINTS
  // ======================

  @Post('create-my-profile')
  @Roles('DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create own doctor profile (Doctor)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Doctor profile created successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile created successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Doctor profile already exists or license number in use',
  })
  async createMyProfile(@CurrentUser('sub') userId: string, @Body() createDto: CreateDoctorProfileSelfDto) {
    return await this.doctorProfilesService.createSelf(userId, createDto);
  }

  // ======================
  // ADMIN ENDPOINTS
  // ======================

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a doctor profile (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Doctor profile created successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile created successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Doctor profile already exists or license number in use',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Driver profile already exists for this user',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async create(@Body() createDoctorProfileDto: CreateDoctorProfileDto) {
    return await this.doctorProfilesService.create(createDoctorProfileDto.userId, createDoctorProfileDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get all doctor profiles (Admin only)' })
  @ApiQuery({
    name: 'areDocumentsVerified',
    required: false,
    type: Boolean,
    description: 'Filter by document verification status',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Filter by minimum average rating (0-5)',
  })
  @ApiQuery({
    name: 'doctorStatus',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'],
    description: 'Filter by doctor status',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    type: Boolean,
    description: 'Filter by availability',
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
    description: 'Doctor profiles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            doctorProfiles: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 50 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 5 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async findAll(@Query() queryDto: QueryDoctorProfilesDto) {
    return await this.doctorProfilesService.findAll(queryDto);
  }

  @Get('my-doctor-profile')
  @Roles('DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({
    summary: "Get current logged-in doctor's profile (Doctor only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile retrieved successfully',
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
    description: 'Driver profile not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Doctor profile not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Doctor role required',
  })
  async getMyDoctorProfile(@CurrentUser('sub') userId: string) {
    return await this.doctorProfilesService.findByUserId(userId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get a doctor profile by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Doctor profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile retrieved successfully',
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
    description: 'Driver profile not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Doctor profile not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.doctorProfilesService.findOne(id);
  }

  @Patch('my-profile')
  @Roles('DOCTOR', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own doctor profile (Doctor or Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile updated successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Driver profile not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'License number already in use',
  })
  async updateMyProfile(@Body() updateDoctorProfileDto: UpdateDoctorProfileDto, @CurrentUser('sub') userId: string) {
    return await this.doctorProfilesService.updateByUserId(userId, updateDoctorProfileDto);
  }

  @Patch('user/:userId')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update doctor profile by user ID (Admin only)' })
  @ApiParam({ name: 'userId', type: String, description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile updated successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Driver profile not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'License number already in use',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async updateByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto
  ) {
    return await this.doctorProfilesService.updateByUserId(userId, updateDoctorProfileDto);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify/Unverify doctor profile and documents (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Doctor profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile verification updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile verified successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Driver profile not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async verifyProfile(@Param('id', ParseUUIDPipe) id: string) {
    return await this.doctorProfilesService.verifyProfile(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a doctor profile - soft delete (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Doctor profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor profile deleted successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Doctor profile deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Driver profile not found',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Doctor profile not found' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.doctorProfilesService.remove(id);
  }
}
