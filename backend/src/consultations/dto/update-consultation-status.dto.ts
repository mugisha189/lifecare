import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ConsultationStatus } from '@prisma/client';

export enum ConsultationStatusEnum {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateConsultationStatusDto {
  @ApiProperty({ enum: ConsultationStatusEnum, example: ConsultationStatusEnum.IN_PROGRESS })
  @IsEnum(ConsultationStatusEnum)
  @IsNotEmpty()
  status: ConsultationStatusEnum;
}
