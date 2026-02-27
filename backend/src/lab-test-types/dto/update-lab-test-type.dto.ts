import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateLabTestTypeDto {
  @ApiPropertyOptional({ example: 'Complete Blood Count', description: 'Name of the lab test type' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Measures various blood components', description: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}
