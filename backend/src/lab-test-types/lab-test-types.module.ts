import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LabTestTypesController } from './lab-test-types.controller';
import { LabTestTypesService } from './lab-test-types.service';

@Module({
  imports: [PrismaModule],
  controllers: [LabTestTypesController],
  providers: [LabTestTypesService],
  exports: [LabTestTypesService],
})
export class LabTestTypesModule {}
