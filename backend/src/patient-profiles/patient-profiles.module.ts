import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PatientProfilesService } from './patient-profiles.service';
import { PatientProfilesController } from './patient-profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CacheModule.register()],
  controllers: [PatientProfilesController],
  providers: [PatientProfilesService],
  exports: [PatientProfilesService],
})
export class PatientProfilesModule {}
