import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelConsultationDto {
  @ApiProperty({ example: 'Patient requested cancellation', description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  cancellationReason: string;
}
