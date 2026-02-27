import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LabTestTypesService } from './lab-test-types.service';
import { CreateLabTestTypeDto } from './dto/create-lab-test-type.dto';
import { UpdateLabTestTypeDto } from './dto/update-lab-test-type.dto';
import { CreateLabTestTypeQuestionDto } from './dto/create-lab-test-type-question.dto';
import { UpdateLabTestTypeQuestionDto } from './dto/update-lab-test-type-question.dto';

@ApiTags('Lab Test Types')
@Controller('lab-test-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LabTestTypesController {
  constructor(private readonly labTestTypesService: LabTestTypesService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a lab test type (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lab test type created' })
  async create(@Body() dto: CreateLabTestTypeDto) {
    return await this.labTestTypesService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'LABORATORY_STAFF')
  @ApiOperation({ summary: 'List all lab test types (with questions)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test types retrieved' })
  async findAll() {
    return await this.labTestTypesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'LABORATORY_STAFF')
  @ApiOperation({ summary: 'Get a lab test type by ID (with questions)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test type retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lab test type not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.labTestTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a lab test type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test type updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLabTestTypeDto) {
    return await this.labTestTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a lab test type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test type deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.labTestTypesService.remove(id);
  }

  @Post(':id/questions')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a question to a lab test type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Question added' })
  async addQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLabTestTypeQuestionDto,
  ) {
    return await this.labTestTypesService.addQuestion(id, dto);
  }

  @Patch(':id/questions/:questionId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a question (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Question updated' })
  async updateQuestion(
    @Param('id') id: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateLabTestTypeQuestionDto,
  ) {
    return await this.labTestTypesService.updateQuestion(id, questionId, dto);
  }

  @Delete(':id/questions/:questionId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a question (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lab test type UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Question deleted' })
  async removeQuestion(
    @Param('id') id: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return await this.labTestTypesService.removeQuestion(id, questionId);
  }
}
