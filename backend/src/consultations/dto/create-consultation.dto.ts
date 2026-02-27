import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({ example: 'patient-uuid', description: 'Patient ID' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: '2025-10-29T10:00:00Z', description: 'Consultation date and time' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsInt()
  @IsOptional()
  @Min(15)
  @Max(240)
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value as string, 10))
  duration?: number;

  @ApiPropertyOptional({ example: 'Patient experiencing headaches and fever', description: 'Patient symptoms' })
  @IsString()
  @IsOptional()
  symptoms?: string;

  @ApiPropertyOptional({ example: 'Initial assessment notes, history, observations...', description: 'Clinical or administrative notes for the consultation' })
  @IsString()
  @IsOptional()
  clinicalNotes?: string;

  @ApiPropertyOptional({ example: 'Follow-up required in 2 weeks', description: 'Follow-up date' })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether follow-up is required' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Hospital ID (context for doctor; validated against doctor profile)' })
  @IsString()
  @IsOptional()
  hospitalId?: string;
}
