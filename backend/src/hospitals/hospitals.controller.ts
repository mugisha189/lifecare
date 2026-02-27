import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import type { Request } from 'express';

@ApiTags('Hospitals')
@Controller('hospitals')
@ApiBearerAuth('JWT-auth')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get('my')
  @Roles('DOCTOR', 'LABORATORY_STAFF')
  @ApiOperation({ summary: 'Get hospitals assigned to current doctor or lab staff' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Assigned hospitals' })
  async findMyHospitals(
    @CurrentUser('sub') userId: string,
    @Req() req: Request & { user: { roleName?: string } },
  ) {
    return await this.hospitalsService.findMyHospitals(userId, req.user?.roleName || '');
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new hospital (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hospital created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Hospital already exists',
  })
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    return await this.hospitalsService.create(createHospitalDto);
  }

  @Get()
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Get all hospitals (Admin and Patient for booking)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospitals retrieved successfully',
  })
  async findAll() {
    return await this.hospitalsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get hospital by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hospital not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.hospitalsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hospital not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return await this.hospitalsService.update(id, updateHospitalDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete hospital (soft delete) (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hospital not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.hospitalsService.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Toggle hospital active status (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital status updated successfully',
  })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { active: boolean },
  ) {
    return await this.hospitalsService.toggleActive(id, body.active);
  }

  @Get(':id/doctors')
  @Roles('ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Get doctors assigned to hospital (Admin and Patient for booking)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital doctors retrieved successfully',
  })
  async getHospitalDoctors(@Param('id', ParseUUIDPipe) id: string) {
    return await this.hospitalsService.getHospitalDoctors(id);
  }

  @Post(':id/assign-doctor')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign doctor to hospital by user ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor assigned to hospital successfully',
  })
  async assignDoctorByUserId(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userId: string },
  ) {
    return await this.hospitalsService.assignDoctor(id, body.userId);
  }

  @Patch(':id/assign-doctor/:doctorId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign doctor to hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiParam({ name: 'doctorId', type: String, description: 'Doctor Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor assigned to hospital successfully',
  })
  async assignDoctor(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
  ) {
    return await this.hospitalsService.assignDoctor(id, doctorId);
  }

  @Delete(':id/remove-doctor/:doctorId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove doctor from hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiParam({ name: 'doctorId', type: String, description: 'Doctor Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Doctor removed from hospital successfully',
  })
  async removeDoctor(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
  ) {
    return await this.hospitalsService.removeDoctor(id, doctorId);
  }

  @Get(':id/lab-staff')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all lab staff assigned to hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital lab staff retrieved successfully',
  })
  async getHospitalLabStaff(@Param('id', ParseUUIDPipe) id: string) {
    return await this.hospitalsService.getHospitalLabStaff(id);
  }

  @Post(':id/assign-lab-staff')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign lab staff to hospital by user ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff assigned to hospital successfully',
  })
  async assignLabStaffByUserId(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userId: string },
  ) {
    return await this.hospitalsService.assignLabStaff(id, body.userId);
  }

  @Patch(':id/assign-lab-staff/:labStaffId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign lab staff to hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiParam({ name: 'labStaffId', type: String, description: 'Lab Staff Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff assigned to hospital successfully',
  })
  async assignLabStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('labStaffId', ParseUUIDPipe) labStaffId: string,
  ) {
    return await this.hospitalsService.assignLabStaff(id, labStaffId);
  }

  @Delete(':id/remove-lab-staff/:labStaffId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove lab staff from hospital (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Hospital UUID' })
  @ApiParam({ name: 'labStaffId', type: String, description: 'Lab Staff Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lab staff removed from hospital successfully',
  })
  async removeLabStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('labStaffId', ParseUUIDPipe) labStaffId: string,
  ) {
    return await this.hospitalsService.removeLabStaff(id, labStaffId);
  }
}
