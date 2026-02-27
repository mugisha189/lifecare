import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

// Type definitions for Prisma log events
interface QueryEvent {
  query: string;
  params: string;
  duration: number;
  timestamp: Date;
}

interface LogEvent {
  message: string;
  timestamp: Date;
}

// Type for extended model methods
type ExtendedModel = {
  update: (args: { where: unknown; data: { deletedAt: Date | null } }) => Promise<unknown>;
  findMany: (args: unknown) => Promise<unknown[]>;
};

// Models that support soft delete (have deletedAt field)
const SOFT_DELETE_MODELS = ['User'];

// Soft delete extension - automatically filters out deleted records
const softDeleteExtension = Prisma.defineExtension(client => {
  return client.$extends({
    query: {
      $allModels: {
        async findMany({ args, query, model }) {
          if (model && SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findUnique({ args, query, model }) {
          if (model && SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ args, query, model }) {
          if (model && SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async count({ args, query, model }) {
          if (model && SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async aggregate({ args, query, model }) {
          if (model && SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
      },
    },
    model: {
      $allModels: {
        // Helper method for soft delete
        async softDelete<T>(this: T, where: unknown): Promise<unknown> {
          const context = Prisma.getExtensionContext(this) as unknown as ExtendedModel;
          return context.update({
            where,
            data: {
              deletedAt: new Date(),
            },
          });
        },
        // Helper method to restore soft-deleted records
        async restore<T>(this: T, where: unknown): Promise<unknown> {
          const context = Prisma.getExtensionContext(this) as unknown as ExtendedModel;
          return context.update({
            where,
            data: {
              deletedAt: null,
            },
          });
        },
        // Helper method to find including deleted records
        async findManyWithDeleted<T>(this: T, args: unknown): Promise<unknown[]> {
          const context = Prisma.getExtensionContext(this) as unknown as ExtendedModel;
          return context.findMany(args);
        },
      },
    },
  });
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private static instance: PrismaService;

  constructor() {
    // Only create instance once (Singleton pattern)
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    super({
      // Log queries only in development
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'info' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [{ emit: 'event', level: 'error' }],
      errorFormat: 'colorless',
    });

    // Setup query logging in development
    if (process.env.NODE_ENV === 'development') {
      this.$on(
        'query' as never,
        ((e: QueryEvent) => {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Params: ${e.params}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        }) as never
      );
    }

    this.$on(
      'info' as never,
      ((e: LogEvent) => {
        this.logger.log(e.message);
      }) as never
    );

    this.$on(
      'warn' as never,
      ((e: LogEvent) => {
        this.logger.warn(e.message);
      }) as never
    );

    this.$on(
      'error' as never,
      ((e: LogEvent) => {
        this.logger.error(e.message);
      }) as never
    );

    // Apply soft delete extension
    const extended = this.$extends(softDeleteExtension);
    PrismaService.instance = extended as unknown as PrismaService;

    return PrismaService.instance;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to database successfully');

      // Enable shutdown hooks
      this.enableShutdownHooks();
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  private enableShutdownHooks() {
    process.on('beforeExit', () => {
      this.logger.log('🔄 Application shutting down...');
      void this.$disconnect();
    });

    process.on('SIGINT', () => {
      this.logger.log('SIGINT received, closing database connection...');
      void this.$disconnect().then(() => process.exit(0));
    });

    process.on('SIGTERM', () => {
      this.logger.log('SIGTERM received, closing database connection...');
      void this.$disconnect().then(() => process.exit(0));
    });
  }

  // Helper method to perform operations without soft delete filtering
  withoutSoftDelete() {
    return new PrismaClient();
  }

  // Helper method to clean up database (useful for testing)
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Prisma.dmmf.datamodel.models;
    const modelNames = models.map(model => model.name);

    await Promise.all(
      modelNames.map(modelName => {
        const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
        const model = this[modelKey as keyof this];

        // Type-safe check if the model has deleteMany method
        if (model && typeof model === 'object' && 'deleteMany' in model && typeof model.deleteMany === 'function') {
          return (model.deleteMany as () => Promise<unknown>)().catch(() => {
            // Ignore errors if model doesn't exist
          });
        }
        return Promise.resolve();
      })
    );
  }
}
