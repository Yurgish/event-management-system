import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(_err: unknown, user: T | false): T | null {
    return user || null;
  }
}
