import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePatientProfileDto } from './create-patient-profile.dto';

export class UpdatePatientProfileDto extends PartialType(OmitType(CreatePatientProfileDto, ['userId'] as const)) {}
