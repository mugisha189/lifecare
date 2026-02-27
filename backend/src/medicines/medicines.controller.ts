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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicinesDto } from './dto/query-medicines.dto';
import { MedicinesService } from './medicines.service';

@ApiTags('Medicines')
@Controller('medicines')
@UseInterceptors(CacheInterceptor)
@ApiBearerAuth('JWT-auth')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new medicine (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Medicine created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Medicine with this name already exists' })
  async create(@Body() createMedicineDto: CreateMedicineDto) {
    return await this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get all medicines (catalog)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Medicines retrieved successfully' })
  async findAll(@Query() queryDto: QueryMedicinesDto) {
    return await this.medicinesService.findAll(queryDto);
  }

  @Get(':id')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Medicine UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Medicine retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Medicine not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update medicine (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Medicine UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Medicine updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Medicine not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return await this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete medicine (soft delete, Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Medicine UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Medicine not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Cannot delete medicine used in pending prescriptions' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.medicinesService.remove(id);
  }
}
