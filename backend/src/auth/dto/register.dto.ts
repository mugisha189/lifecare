import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+250788123456',
    description: 'Phone number in any format (international accepted)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ example: 'role-uuid', description: 'Role ID for the user (defaults to PATIENT if not provided)' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the user',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ example: 'Rwanda', description: 'Country' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Kigali', description: 'City' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

}
