import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PharmacistProfilesService } from './pharmacist-profiles.service';
import { PharmacistProfilesController } from './pharmacist-profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [PharmacistProfilesController],
  providers: [PharmacistProfilesService],
  exports: [PharmacistProfilesService],
})
export class PharmacistProfilesModule {}
