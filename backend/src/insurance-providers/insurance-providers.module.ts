import { Module } from '@nestjs/common';
import { InsuranceProvidersService } from './insurance-providers.service';
import { InsuranceProvidersController } from './insurance-providers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsuranceProvidersController],
  providers: [InsuranceProvidersService],
  exports: [InsuranceProvidersService],
})
export class InsuranceProvidersModule {}
