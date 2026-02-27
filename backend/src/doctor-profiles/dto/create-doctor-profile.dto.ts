import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DoctorStatus } from '@prisma/client';

export class DocumentUploadDto {
  @ApiProperty({
    description: 'Document type (e.g., LICENSE, QUALIFICATION, NATIONAL_ID)',
    example: 'LICENSE',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    description: 'URL to the uploaded document',
    example: 'https://storage.example.com/documents/medical-license.pdf',
  })
  @IsString()
  @IsNotEmpty()
  documentURL: string;

  @ApiProperty({
    description: 'Document expiry date (optional)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class CreateDoctorProfileDto {
  @ApiProperty({
    description: 'User ID to create doctor profile for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

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
    description: 'Medical license expiry date',
    example: '2026-12-31T23:59:59Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  licenseExpiryDate: string;

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
    description: 'Years of medical experience',
    example: 10,
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsOfExperience?: number;

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

  @ApiProperty({
    description: 'Emergency contact name',
    example: 'John Doe',
    required: true,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  emergencyContactName: string;

  @ApiProperty({
    description: 'Emergency contact phone number',
    example: '+250788123456',
    required: true,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  emergencyContactPhone: string;

  @ApiProperty({
    description: 'Doctor status',
    enum: DoctorStatus,
    example: DoctorStatus.ACTIVE,
    required: false,
  })
  @IsEnum(DoctorStatus)
  @IsOptional()
  doctorStatus?: DoctorStatus;

  @ApiProperty({
    description: 'Doctor documents (minimum 2 required: medical license + one more)',
    type: [DocumentUploadDto],
    example: [
      {
        documentType: 'LICENSE',
        documentURL: 'https://storage.example.com/license.pdf',
        expiryDate: '2026-12-31T23:59:59Z',
      },
      {
        documentType: 'NATIONAL_ID',
        documentURL: 'https://storage.example.com/id.pdf',
        expiryDate: '2030-12-31T23:59:59Z',
      },
    ],
    required: true,
    minItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 documents are required (medical license + one more)' })
  @ValidateNested({ each: true })
  @Type(() => DocumentUploadDto)
  documents: DocumentUploadDto[];
}
