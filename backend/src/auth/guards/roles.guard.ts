import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request - authentication may have failed');
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some(role => {
      return user.roleName === role || user.roleId === role;
    });

    if (!hasRole) {
      this.logger.warn(`User ${user.email} does not have required role(s): ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
