import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class BookConsultationDto {
  @ApiProperty({ description: 'Doctor profile ID (from hospital doctors list)' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: '2025-10-29T10:00:00', description: 'Consultation date and time (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsInt()
  @IsOptional()
  @Min(15)
  @Max(240)
  @Type(() => Number)
  duration?: number;
}
