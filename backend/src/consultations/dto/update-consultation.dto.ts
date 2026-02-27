import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateConsultationDto {
  @ApiPropertyOptional({ example: '2025-10-29T10:00:00Z', description: 'Consultation date and time' })
  @IsDateString()
  @IsOptional()
  date?: string;

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

  @ApiPropertyOptional({ example: 'Common cold', description: 'Diagnosis' })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Prescribed rest and medication', description: 'Clinical notes' })
  @IsString()
  @IsOptional()
  clinicalNotes?: string;

  @ApiPropertyOptional({ example: '2025-11-12T10:00:00Z', description: 'Follow-up date' })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether follow-up is required' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;
}
