import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { InsuranceProvidersService } from './insurance-providers.service';
import { CreateInsuranceProviderDto } from './dto/create-insurance-provider.dto';
import { UpdateInsuranceProviderDto } from './dto/update-insurance-provider.dto';
import { QueryInsuranceProvidersDto } from './dto/query-insurance-providers.dto';

@ApiTags('Insurance Providers')
@Controller('insurance-providers')
@ApiBearerAuth('JWT-auth')
export class InsuranceProvidersController {
  constructor(
    private readonly insuranceProvidersService: InsuranceProvidersService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new insurance provider (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Insurance provider created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Insurance provider already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid dividend percentages',
  })
  async create(@Body() createInsuranceProviderDto: CreateInsuranceProviderDto) {
    return await this.insuranceProvidersService.create(
      createInsuranceProviderDto,
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all insurance providers (Public)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance providers retrieved successfully',
  })
  async findAll(@Query() query: QueryInsuranceProvidersDto) {
    return await this.insuranceProvidersService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get insurance provider by ID (Public)' })
  @ApiParam({ name: 'id', type: String, description: 'Insurance Provider UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance provider retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Insurance provider not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.insuranceProvidersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update insurance provider (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Insurance Provider UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance provider updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Insurance provider not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid dividend percentages',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInsuranceProviderDto: UpdateInsuranceProviderDto,
  ) {
    return await this.insuranceProvidersService.update(
      id,
      updateInsuranceProviderDto,
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Delete insurance provider (soft delete) (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Insurance Provider UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance provider deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Insurance provider not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.insuranceProvidersService.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Toggle insurance provider active status (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Insurance Provider UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance provider status updated successfully',
  })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { active: boolean },
  ) {
    return await this.insuranceProvidersService.toggleActive(id, body.active);
  }

  @Get(':id/patients')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all patients with this insurance provider (Admin only)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Insurance Provider UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Insurance provider patients retrieved successfully',
  })
  async getPatients(@Param('id', ParseUUIDPipe) id: string) {
    return await this.insuranceProvidersService.getPatients(id);
  }
}
