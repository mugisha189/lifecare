import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentUploadDto } from './create-doctor-profile.dto';
import { DoctorStatus } from '@prisma/client';

export class CreateDoctorProfileSelfDto {
  @ApiProperty({
    description: 'Medical license number',
    example: 'ML123456789',
    required: true,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  licenseNumber: string;

  @ApiProperty({
    description: 'Medical specialization (e.g., Cardiology, Pediatrics, General Medicine)',
    example: 'Cardiology',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialization?: string;

  @ApiProperty({
    description: 'Medical qualifications (array of strings)',
    example: ['MD', 'Board Certified in Cardiology'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({
    description: 'Doctor bio or description',
    example: 'Experienced cardiologist with 10 years of practice',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    description: 'Hospital ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  hospitalId?: string;
}
