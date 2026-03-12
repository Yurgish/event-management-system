import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, JwtOptionalAuthGuard } from '@/auth/guards';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

export function OptionalAuth() {
  return applyDecorators(UseGuards(JwtOptionalAuthGuard));
}
