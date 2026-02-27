import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionMedicineDto {
  @ApiProperty({ example: 'medicine-uuid', description: 'Medicine ID' })
  @IsNotEmpty()
  @IsString()
  medicineId: string;

  @ApiProperty({ example: '500mg', description: 'Dosage' })
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'Twice daily', description: 'Frequency' })
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 days', description: 'Duration' })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({ example: 1, description: 'Quantity' })
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ example: 'Take with food', description: 'Special instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'patient-uuid', description: 'Patient ID' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiPropertyOptional({ example: 'consultation-uuid', description: 'Consultation ID (if linked to a consultation)' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiPropertyOptional({ example: 'Take as prescribed', description: 'Prescription notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [PrescriptionMedicineDto],
    description: 'List of medicines in the prescription',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines: PrescriptionMedicineDto[];
}
