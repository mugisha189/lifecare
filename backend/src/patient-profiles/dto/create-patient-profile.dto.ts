import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNotEmpty, IsArray, IsInt, Min, MaxLength, IsDateString } from 'class-validator';

export class CreatePatientProfileDto {
  @ApiProperty({
    description: 'User ID to create patient profile for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Insurance provider ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  insuranceProviderId?: string;

  @ApiProperty({
    description: 'Insurance number',
    example: 'INS123456789',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  insuranceNumber?: string;

  @ApiProperty({
    description: 'Medical history',
    example: 'Previous surgeries, chronic conditions, etc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty({
    description: 'List of allergies',
    example: ['Penicillin', 'Peanuts'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiProperty({
    description: 'List of chronic conditions',
    example: ['Diabetes', 'Hypertension'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicConditions?: string[];

  @ApiProperty({
    description: 'Saved addresses (JSON)',
    example: [{ name: 'Home', address: '123 Main St', lat: 1.234, lng: 5.678 }],
    required: false,
  })
  @IsOptional()
  savedAddresses?: any;

  @ApiProperty({
    description: 'Special requirements or notes',
    example: 'Wheelchair accessible, requires interpreter',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  specialRequirements?: string;

  @ApiProperty({
    description: 'Initial loyalty points',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  loyaltyPoints?: number;
}
