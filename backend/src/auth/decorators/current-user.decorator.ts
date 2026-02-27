import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
