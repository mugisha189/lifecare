import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionStatus } from '@prisma/client';

export class UpdatePrescriptionDto {
  @ApiProperty({
    description: 'Prescription status',
    enum: PrescriptionStatus,
    example: PrescriptionStatus.DISPENSED,
  })
  @IsEnum(PrescriptionStatus)
  @IsOptional()
  status?: PrescriptionStatus;
}
