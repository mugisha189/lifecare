import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsArray,
  IsUUID,
} from 'class-validator';
import { PharmacistStatus } from '@prisma/client';

export class CreatePharmacistProfileSelfDto {
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

}
