import { PartialType } from '@nestjs/swagger';
import { CreateInsuranceProviderDto } from './create-insurance-provider.dto';

export class UpdateInsuranceProviderDto extends PartialType(
  CreateInsuranceProviderDto,
) {}
