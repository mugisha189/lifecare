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
import { LabStaffStatus } from '@prisma/client';

export class CreateLabStaffProfileDto {
  @ApiProperty({
    description: 'User ID to create lab staff profile for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Lab license/certification number (optional)',
    example: 'LL123456789',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  licenseNumber?: string;

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
    example: ['Medical Laboratory Technician', 'Certified Lab Tech'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({
    description: 'Lab staff status',
    enum: LabStaffStatus,
    example: LabStaffStatus.ACTIVE,
    required: false,
  })
  @IsEnum(LabStaffStatus)
  @IsOptional()
  labStaffStatus?: LabStaffStatus;
}
