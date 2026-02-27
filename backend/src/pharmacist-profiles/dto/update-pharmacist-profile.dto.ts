import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePharmacistProfileDto } from './create-pharmacist-profile.dto';

export class UpdatePharmacistProfileDto extends PartialType(OmitType(CreatePharmacistProfileDto, ['userId'] as const)) {}
