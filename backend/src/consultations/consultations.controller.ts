import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { CancelConsultationDto } from './dto/cancel-consultation.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { QueryConsultationsDto } from './dto/query-consultations.dto';
import { RecommendLabTestDto } from './dto/recommend-lab-test.dto';
import { UpdateConsultationStatusDto } from './dto/update-consultation-status.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationsService } from './consultations.service';
import { LabTestsService } from '../lab-tests/lab-tests.service';

@ApiTags('Consultations')
@Controller('consultations')
@UseInterceptors(CacheInterceptor)
@ApiBearerAuth('JWT-auth')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly labTestsService: LabTestsService,
  ) {}

  @Post()
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Create a new consultation (Doctor only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consultation created successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Doctor or patient not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Overlapping consultation exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Doctor profile not active',
  })
  async create(@Body() createConsultationDto: CreateConsultationDto, @CurrentUser('sub') userId: string) {
    return await this.consultationsService.create(createConsultationDto, userId);
  }

  @Post('book')
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Book a consultation (Patient only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consultation booked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Doctor or patient profile not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Time slot no longer available',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Doctor not available for booking',
  })
  async book(
    @Body() bookConsultationDto: BookConsultationDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.consultationsService.bookByPatient(userId, bookConsultationDto);
  }

  @Get()
  @CacheTTL(60)
  @ApiOperation({ summary: 'Get all consultations with filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultations retrieved successfully',
  })
  async findAll(@Query() queryConsultationsDto: QueryConsultationsDto) {
    return await this.consultationsService.findAll(queryConsultationsDto);
  }

  @Get('my-consultations')
  @Roles('DOCTOR')
  @ApiOperation({ summary: "Get doctor's own consultations (Doctor only)" })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by consultation status' })
  @ApiQuery({ name: 'hospitalId', required: false, description: 'Filter by doctor hospital (active workspace)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor consultations retrieved successfully',
  })
  async findDoctorConsultations(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return await this.consultationsService.findDoctorConsultations(userId, status, hospitalId);
  }

  @Get('patient-consultations')
  @Roles('PATIENT')
  @ApiOperation({ summary: "Get patient's consultations (Patient only)" })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by consultation status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient consultations retrieved successfully',
  })
  async findPatientConsultations(@CurrentUser('sub') userId: string, @Query('status') status?: string) {
    return await this.consultationsService.findPatientConsultations(userId, status);
  }

  @Get('by-code/:code')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get consultation by code (Pharmacist: for recording prescription)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation with prescriptions retrieved',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found for this code',
  })
  async findByCode(@Param('code') code: string) {
    return await this.consultationsService.findByCode(code);
  }

  @Post(':id/lab-tests')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Recommend a lab test for this consultation (Doctor only)' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lab test recommended successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Consultation not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async recommendLabTest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecommendLabTestDto,
    @CurrentUser('sub') userId: string,
  ) {
    const consultation = (await this.consultationsService.findOne(id)).data;
    return await this.labTestsService.create(userId, {
      consultationId: id,
      patientId: consultation.patientId,
      labTestTypeId: dto.labTestTypeId,
      notes: dto.notes,
    });
  }

  @Get(':id')
  @CacheTTL(60)
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.consultationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Update consultation (Doctor only)' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this consultation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot update completed or cancelled consultation',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @CurrentUser('sub') userId: string
  ) {
    return await this.consultationsService.update(id, updateConsultationDto, userId);
  }

  @Patch(':id/status')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Update consultation status (Doctor only)' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this consultation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Invalid status transition',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateConsultationStatusDto: UpdateConsultationStatusDto,
    @CurrentUser('sub') userId: string
  ) {
    return await this.consultationsService.updateStatus(id, updateConsultationStatusDto, userId);
  }

  @Post(':id/cancel')
  @Roles('DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Cancel consultation (Doctor or Patient)' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to cancel this consultation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot cancel completed or already cancelled consultation',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelConsultationDto: CancelConsultationDto,
    @CurrentUser('sub') userId: string
  ) {
    return await this.consultationsService.cancel(id, cancelConsultationDto, userId);
  }

  @Delete(':id')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Delete consultation (soft delete, Doctor only)' })
  @ApiParam({ name: 'id', type: String, description: 'Consultation UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this consultation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete ongoing consultation',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return await this.consultationsService.remove(id, userId);
  }
}
