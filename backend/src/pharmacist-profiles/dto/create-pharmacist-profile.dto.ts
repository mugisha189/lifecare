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
} from 'class-validator';
import { PharmacistStatus } from '@prisma/client';

export class CreatePharmacistProfileDto {
  @ApiProperty({
    description: 'User ID to create pharmacist profile for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Pharmacy license number',
    example: 'PL123456789',
    required: true,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  licenseNumber: string;

  @ApiProperty({
    description: 'License expiry date',
    example: '2026-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  @ApiProperty({
    description: 'Hospital ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  hospitalId?: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
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
    description: 'Qualifications (array of strings)',
    example: ['B.Pharm', 'Pharmacy Board Certified'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({
    description: 'Pharmacist status',
    enum: PharmacistStatus,
    example: PharmacistStatus.ACTIVE,
    required: false,
  })
  @IsEnum(PharmacistStatus)
  @IsOptional()
  pharmacistStatus?: PharmacistStatus;
}
