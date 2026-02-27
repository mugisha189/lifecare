import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PharmacistStatus } from '@prisma/client';

export class QueryPharmacistProfilesDto {
  @ApiProperty({
    description: 'Filter by pharmacist status',
    enum: PharmacistStatus,
    example: PharmacistStatus.ACTIVE,
    required: false,
  })
  @IsEnum(PharmacistStatus)
  @IsOptional()
  pharmacistStatus?: PharmacistStatus;

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
