import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleContextHelper } from './helpers/role-context.helper';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RoleContextHelper],
  exports: [RoleContextHelper],
})
export class CommonModule {}
