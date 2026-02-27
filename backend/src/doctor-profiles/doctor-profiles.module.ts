import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { DoctorProfilesService } from './doctor-profiles.service';
import { DoctorProfilesController } from './doctor-profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [DoctorProfilesController],
  providers: [DoctorProfilesService],
  exports: [DoctorProfilesService],
})
export class DoctorProfilesModule {}
