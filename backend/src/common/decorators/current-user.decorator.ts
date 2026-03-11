import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import type { JwtUser } from '@/common/jwt.types';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtUser }>();
    return request.user;
  },
);
