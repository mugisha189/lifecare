import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateLabTestTypeDto {
  @ApiProperty({ example: 'Complete Blood Count', description: 'Name of the lab test type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Measures various blood components', description: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}
