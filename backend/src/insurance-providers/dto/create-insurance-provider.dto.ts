import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateInsuranceProviderDto {
  @ApiProperty({
    description: 'Insurance provider name',
    example: 'RSSB - MMI',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Contact information',
    example: 'info@rssb.rw | +250788000000',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactInfo?: string;

  @ApiProperty({
    description: 'Coverage details',
    example: 'Covers consultations, prescriptions, and lab tests up to 80%',
    required: false,
  })
  @IsString()
  @IsOptional()
  coverageDetails?: string;

  @ApiProperty({
    description: 'Patient dividend percentage (0-100)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  patientDividendPercent: number;

  @ApiProperty({
    description: 'Insurance dividend percentage (0-100)',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  insuranceDividendPercent: number;
}
