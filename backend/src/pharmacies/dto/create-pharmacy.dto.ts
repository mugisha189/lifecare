import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePharmacyDto {
  @ApiProperty({ description: 'Pharmacy name', example: 'City Pharmacy' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Pharmacy address', example: '456 Health Street' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City', example: 'Kigali' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Country', example: 'Rwanda', default: 'Rwanda' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+250788123456' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@pharmacy.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: -1.9536 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: 30.0606 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Active status', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
