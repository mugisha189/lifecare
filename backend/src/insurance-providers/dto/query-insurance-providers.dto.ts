import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryInsuranceProvidersDto {
  @ApiProperty({
    description: 'Search by provider name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;
}
