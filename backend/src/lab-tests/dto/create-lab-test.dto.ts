import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateLabTestDto {
  @ApiPropertyOptional({ description: 'Consultation ID when recommending from a consultation' })
  @IsUUID()
  @IsOptional()
  consultationId?: string;

  @ApiProperty({ example: 'patient-uuid', description: 'Patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid', description: 'Lab test type ID (created by admin)' })
  @IsUUID()
  @IsNotEmpty()
  labTestTypeId: string;

  @ApiPropertyOptional({ example: 'Fasting required', description: 'Notes for the lab' })
  @IsString()
  @IsOptional()
  notes?: string;
}
