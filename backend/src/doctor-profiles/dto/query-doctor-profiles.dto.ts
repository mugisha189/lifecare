import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DoctorStatus } from '@prisma/client';

export class QueryDoctorProfilesDto {
  @ApiProperty({
    description: 'Filter by document verification status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  areDocumentsVerified?: boolean;

  @ApiProperty({
    description: 'Filter by minimum average rating',
    example: 4.0,
    minimum: 0,
    maximum: 5,
    required: false,
  })
  @Type(() => Number)
  @Min(0)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @ApiProperty({
    description: 'Filter by doctor status',
    enum: DoctorStatus,
    example: DoctorStatus.ACTIVE,
    required: false,
  })
  @IsEnum(DoctorStatus)
  @IsOptional()
  doctorStatus?: DoctorStatus;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
