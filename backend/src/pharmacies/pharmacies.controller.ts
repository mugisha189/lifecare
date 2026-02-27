import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PharmaciesService } from './pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { AddPharmacyMedicineDto } from './dto/add-pharmacy-medicine.dto';
import { UpdatePharmacyMedicineDto } from './dto/update-pharmacy-medicine.dto';

@ApiTags('Pharmacies')
@Controller('pharmacies')
@ApiBearerAuth('JWT-auth')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Get('my')
  @Roles('PHARMACIST')
  @ApiOperation({ summary: 'Get pharmacies assigned to current pharmacist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Assigned pharmacies' })
  async findMyPharmacies(@CurrentUser('sub') userId: string) {
    return await this.pharmaciesService.findMyPharmacies(userId);
  }

  @Get('my-inventory')
  @Roles('PHARMACIST')
  @ApiOperation({ summary: 'Get current pharmacist pharmacy inventory' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Inventory list' })
  async getMyInventory(@CurrentUser('sub') userId: string) {
    return await this.pharmaciesService.getMyInventory(userId);
  }

  @Post('my-inventory')
  @Roles('PHARMACIST')
  @ApiOperation({ summary: 'Add medicine to current pharmacist pharmacy' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Medicine added to inventory' })
  async addToMyInventory(@CurrentUser('sub') userId: string, @Body() dto: AddPharmacyMedicineDto) {
    return await this.pharmaciesService.addMedicineToMyPharmacy(userId, dto);
  }

  @Patch('my-inventory/:id')
  @Roles('PHARMACIST')
  @ApiOperation({ summary: 'Update pharmacy medicine quantity' })
  @ApiParam({ name: 'id', type: String, description: 'PharmacyMedicine UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Inventory updated' })
  async updateMyInventoryItem(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePharmacyMedicineDto,
  ) {
    return await this.pharmaciesService.updateMyPharmacyMedicine(userId, id, dto);
  }

  @Delete('my-inventory/:id')
  @Roles('PHARMACIST')
  @ApiOperation({ summary: 'Remove medicine from current pharmacist pharmacy' })
  @ApiParam({ name: 'id', type: String, description: 'PharmacyMedicine UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Medicine removed from inventory' })
  async removeMyInventoryItem(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmaciesService.removeMyPharmacyMedicine(userId, id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new pharmacy (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pharmacy created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Pharmacy already exists',
  })
  async create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return await this.pharmaciesService.create(createPharmacyDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all pharmacies (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacies retrieved successfully',
  })
  async findAll() {
    return await this.pharmaciesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pharmacy by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacy retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacy not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmaciesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update pharmacy (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacy updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacy not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    return await this.pharmaciesService.update(id, updatePharmacyDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete pharmacy (soft delete) (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacy deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pharmacy not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmaciesService.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Toggle pharmacy active status (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacy status updated successfully',
  })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { active: boolean },
  ) {
    return await this.pharmaciesService.toggleActive(id, body.active);
  }

  @Get(':id/pharmacists')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all pharmacists assigned to pharmacy (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacy pharmacists retrieved successfully',
  })
  async getPharmacyPharmacists(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pharmaciesService.getPharmacyPharmacists(id);
  }

  @Post(':id/assign-pharmacist')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign pharmacist to pharmacy by user ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist assigned to pharmacy successfully',
  })
  async assignPharmacistByUserId(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userId: string },
  ) {
    return await this.pharmaciesService.assignPharmacist(id, body.userId);
  }

  @Patch(':id/assign-pharmacist/:pharmacistId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign pharmacist to pharmacy (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiParam({ name: 'pharmacistId', type: String, description: 'Pharmacist Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist assigned to pharmacy successfully',
  })
  async assignPharmacist(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pharmacistId', ParseUUIDPipe) pharmacistId: string,
  ) {
    return await this.pharmaciesService.assignPharmacist(id, pharmacistId);
  }

  @Delete(':id/remove-pharmacist/:pharmacistId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove pharmacist from pharmacy (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Pharmacy UUID' })
  @ApiParam({ name: 'pharmacistId', type: String, description: 'Pharmacist Profile UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pharmacist removed from pharmacy successfully',
  })
  async removePharmacist(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pharmacistId', ParseUUIDPipe) pharmacistId: string,
  ) {
    return await this.pharmaciesService.removePharmacist(id, pharmacistId);
  }
}
