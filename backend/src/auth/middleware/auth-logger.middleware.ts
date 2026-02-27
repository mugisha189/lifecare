import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    this.logger.log(`[${method}] ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`);

    // Log when response is finished
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      this.logger.log(`[${method}] ${originalUrl} - Status: ${statusCode} - Content Length: ${contentLength || 0}`);
    });

    next();
  }
}
