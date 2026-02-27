import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AuthLoggerMiddleware } from './auth/middleware/auth-logger.middleware';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { UsersModule } from './users/users.module';
import { MedicinesModule } from './medicines/medicines.module';
import { DoctorProfilesModule } from './doctor-profiles/doctor-profiles.module';
import { PatientProfilesModule } from './patient-profiles/patient-profiles.module';
import { PharmacistProfilesModule } from './pharmacist-profiles/pharmacist-profiles.module';
import { LabStaffProfilesModule } from './lab-staff-profiles/lab-staff-profiles.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { CommonModule } from './common/common.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { ConsultationNotesModule } from './consultation-notes/consultation-notes.module';
import { InsuranceProvidersModule } from './insurance-providers/insurance-providers.module';
import { LabTestsModule } from './lab-tests/lab-tests.module';
import { LabTestTypesModule } from './lab-test-types/lab-test-types.module';

@Module({
  imports: [
    CommonModule,
    AnalyticsModule,
    HospitalsModule,
    PharmaciesModule,
    ConsultationNotesModule,
    InsuranceProvidersModule,
    LabTestTypesModule,
    LabTestsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    MedicinesModule,
    ConsultationsModule,
    DoctorProfilesModule,
    PatientProfilesModule,
    PharmacistProfilesModule,
    LabStaffProfilesModule,
    PrescriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT authentication guard - applies to all routes unless @Public() is used
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard - checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth logger middleware to all auth routes
    consumer.apply(AuthLoggerMiddleware).forRoutes({ path: 'auth/*', method: RequestMethod.ALL });
  }
}
