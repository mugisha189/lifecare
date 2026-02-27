import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLabStaffProfileDto } from './create-lab-staff-profile.dto';

export class UpdateLabStaffProfileDto extends PartialType(OmitType(CreateLabStaffProfileDto, ['userId'] as const)) {}
