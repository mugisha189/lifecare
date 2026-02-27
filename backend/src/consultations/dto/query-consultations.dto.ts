import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryConsultationsDto {
  @ApiPropertyOptional({ example: 'patient-uuid', description: 'Filter by patient ID' })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ example: 'doctor-uuid', description: 'Filter by doctor ID' })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({ example: '2025-10-29', description: 'Filter by consultation date' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'SCHEDULED', description: 'Filter by consultation status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'cardiology', description: 'Search by doctor name or patient name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Exclude this consultation ID when listing patient history' })
  @IsOptional()
  @IsUUID('4')
  excludeConsultationId?: string;
}
