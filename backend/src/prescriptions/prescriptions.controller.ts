import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionsDto } from './dto/query-prescriptions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new prescription (Doctor only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Prescription created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async create(@CurrentUser('sub') userId: string, @Body() createPrescriptionDto: CreatePrescriptionDto) {
    return await this.prescriptionsService.create(userId, createPrescriptionDto);
  }

  @Get()
  @Roles('PATIENT', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all prescriptions (Admin: all prescriptions, Patient: own prescriptions)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'DISPENSED', 'CANCELLED'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'Prescriptions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findAll(@CurrentUser('sub') userId: string, @Query() queryDto: QueryPrescriptionsDto) {
    return await this.prescriptionsService.findAll(userId, queryDto);
  }

  @Get('doctor/prescriptions')
  @Roles('DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get all prescriptions created by a doctor (Doctor)" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'DISPENSED', 'CANCELLED'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'Doctor prescriptions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findDoctorPrescriptions(@CurrentUser('sub') userId: string, @Query() queryDto: QueryPrescriptionsDto) {
    return await this.prescriptionsService.findDoctorPrescriptions(userId, queryDto);
  }

  @Get('pharmacist/prescriptions')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get prescriptions (Admin: all, Pharmacist: dispensed by them)" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'DISPENSED', 'CANCELLED'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pharmacist prescriptions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findPharmacistPrescriptions(@CurrentUser('sub') userId: string, @Query() queryDto: QueryPrescriptionsDto) {
    return await this.prescriptionsService.findPharmacistPrescriptions(userId, queryDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a single prescription by ID (Patient, Doctor, or Pharmacist)' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Prescription retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Prescription not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return await this.prescriptionsService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles('PHARMACIST', 'DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a prescription status (Pharmacist can dispense, Doctor can cancel)' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Prescription updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Prescription not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto
  ) {
    return await this.prescriptionsService.update(id, userId, updatePrescriptionDto);
  }

  @Delete(':id')
  @Roles('DOCTOR')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a prescription (soft delete, Doctor only)' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Prescription deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Prescription not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return await this.prescriptionsService.remove(id, userId);
  }
}
