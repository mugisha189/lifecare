import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { ConsultationNotesService } from './consultation-notes.service';
import { ConsultationNotesController } from './consultation-notes.controller';
import { PrismaModule } from '../prisma/prisma.module';

const uploadDir = join(process.cwd(), 'uploads', 'consultation-notes');

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = (file.originalname && file.originalname.includes('.')) ? file.originalname.slice(file.originalname.lastIndexOf('.')) : '';
          const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [ConsultationNotesController],
  providers: [ConsultationNotesService],
  exports: [ConsultationNotesService],
})
export class ConsultationNotesModule {}
