import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ description: 'Hospital name', example: 'City General Hospital' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hospital address', example: '123 Main Street' })
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

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@hospital.com' })
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
