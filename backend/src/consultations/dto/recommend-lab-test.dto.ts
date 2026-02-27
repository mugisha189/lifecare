import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class RecommendLabTestDto {
  @ApiProperty({ example: 'uuid', description: 'Lab test type ID (created by admin)' })
  @IsUUID()
  @IsNotEmpty()
  labTestTypeId: string;

  @ApiPropertyOptional({ example: 'Fasting required', description: 'Notes for the lab' })
  @IsString()
  @IsOptional()
  notes?: string;
}
