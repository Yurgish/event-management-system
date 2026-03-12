import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
