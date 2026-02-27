import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { LabStaffProfilesService } from './lab-staff-profiles.service';
import { LabStaffProfilesController } from './lab-staff-profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [LabStaffProfilesController],
  providers: [LabStaffProfilesService],
  exports: [LabStaffProfilesService],
})
export class LabStaffProfilesModule {}
