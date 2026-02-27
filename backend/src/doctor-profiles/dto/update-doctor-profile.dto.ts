import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDoctorProfileDto } from './create-doctor-profile.dto';

export class UpdateDoctorProfileDto extends PartialType(OmitType(CreateDoctorProfileDto, ['userId'] as const)) {}
