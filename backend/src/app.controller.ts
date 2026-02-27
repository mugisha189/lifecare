import { Controller, Get, Res, ServiceUnavailableException } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from './auth/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@Controller()
@ApiTags('Health')
@Public()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  @ApiExcludeEndpoint()
  redirect(@Res() res: Response) {
    return res.redirect('/api/docs');
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'All services are healthy' })
  @ApiResponse({ status: 503, description: 'One or more services are unhealthy' })
  async healthCheck() {
    const checks: Record<string, string> = {
      database: 'unknown',
      redis: 'unknown',
    };

    let databaseHealthy = false;

    // Database health check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'Connected';
      databaseHealthy = true;
    } catch {
      checks.database = 'Disconnected';
    }


    const isHealthy = databaseHealthy;

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}
