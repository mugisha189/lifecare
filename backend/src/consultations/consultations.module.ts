import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LabTestsModule } from '../lab-tests/lab-tests.module';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

@Module({
  imports: [
    PrismaModule,
    LabTestsModule,
    CacheModule.register({
      ttl: 60,
      max: 100,
    }),
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
