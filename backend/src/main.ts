import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Show minimal NestJS logs
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // CORS configuration - allow all origins
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global request timeout (25 seconds)
  app.use((req, res, next) => {
    req.setTimeout(25000, () => {
      logger.warn(`Request timeout: ${req.method} ${req.url}`);
      if (!res.headersSent) {
        res.status(408).json({
          ok: false,
          message: 'Request timeout - operation took too long. Please try again.',
        });
      }
    });
    next();
  });

  // HTTP request logging (only in development)
  const nodeEnv = configService.get<string>('nodeEnv', 'development');
  if (nodeEnv !== 'production') {
    app.use(morgan('dev'));
  }

  // Static files
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  // Configuration
  const port = configService.get<number>('port', 8000);
  const host = configService.get<string>('host', 'localhost');
  const protocol = nodeEnv === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}:${port}`;

  // Swagger setup (development only)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LifeCare API')
      .setDescription('API Documentation for LifeCare - A comprehensive digital healthcare management system')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'JWT-auth'
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    });

    // Define tag order for logical flow
    if (document.tags) {
      document.tags = [
        { name: 'Health', description: 'System health and status endpoints' },
        { name: 'Authentication', description: 'User authentication and authorization' },
        { name: 'Analytics', description: 'Platform analytics and statistics' },
        { name: 'Users', description: 'User management and profiles' },
        { name: 'Doctor Profiles', description: 'Doctor profile management and verification' },
        { name: 'Patient Profiles', description: 'Patient profile management' },
        { name: 'Pharmacist Profiles', description: 'Pharmacist profile management' },
        { name: 'Lab Staff Profiles', description: 'Laboratory staff profile management' },
        { name: 'Hospitals', description: 'Hospital management and doctor assignments' },
        { name: 'Pharmacies', description: 'Pharmacy management and pharmacist assignments' },
        { name: 'Consultations', description: 'Create and manage medical consultations' },
        { name: 'Consultation Notes', description: 'Consultation notes with threading and attachments' },
        { name: 'Prescriptions', description: 'Prescription creation and management' },
        { name: 'Medicines', description: 'Medicine inventory and management' },
      ];
    }

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        operationsSorter: 'alpha',
      },
    });
  }

  // Start server
  await app.listen(port);

  logger.log('LifeCare API Server Started');
  logger.log(`Environment:     ${nodeEnv}`);
  logger.log(`Server URL:      ${baseUrl}`);

  if (nodeEnv !== 'production') {
    logger.log(`Documentation:   ${baseUrl}/api/docs`);
    logger.log(`Static Files:    ${baseUrl}/uploads`);
  }
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start');

  if (error instanceof Error) {
    logger.error(error.stack || error.message);
  } else {
    logger.error(String(error));
  }

  process.exit(1);
});
