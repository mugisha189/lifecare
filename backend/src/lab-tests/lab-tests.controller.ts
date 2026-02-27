import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LabTestsService } from './lab-tests.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { CompleteLabTestDto } from './dto/complete-lab-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Lab Tests')
@Controller('lab-tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LabTestsController {
  constructor(private readonly labTestsService: LabTestsService) {}

  @Post()
  @Roles('DOCTOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Recommend a lab test (Doctor only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lab test recommended successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Consultation or patient not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateLabTestDto) {
    return await this.labTestsService.create(userId, dto);
  }

  @Get('my')
  @Roles('LABORATORY_STAFF')
  @ApiOperation({ summary: "Get lab tests for lab staff's hospital (Lab staff only)" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab tests retrieved successfully' })
  async findMyLabTests(
    @CurrentUser('sub') userId: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return await this.labTestsService.findMyLabTests(userId, hospitalId);
  }

  @Get('consultation/:consultationId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Get lab tests for a consultation' })
  @ApiParam({ name: 'consultationId', description: 'Consultation UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab tests retrieved successfully' })
  async findByConsultation(@Param('consultationId', ParseUUIDPipe) consultationId: string) {
    return await this.labTestsService.findByConsultation(consultationId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'LABORATORY_STAFF')
  @ApiOperation({ summary: 'Get a lab test by ID (with type and questions for completion)' })
  @ApiParam({ name: 'id', description: 'Lab test UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lab test not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId?: string) {
    return await this.labTestsService.findOne(id, userId);
  }

  @Post(':id/complete')
  @Roles('LABORATORY_STAFF')
  @ApiOperation({ summary: 'Complete a lab test with results (Lab staff only)' })
  @ApiParam({ name: 'id', description: 'Lab test UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lab test completed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lab test not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Already completed or invalid' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CompleteLabTestDto,
  ) {
    return await this.labTestsService.complete(id, userId, dto);
  }
}
