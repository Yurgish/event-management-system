import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload, JwtRefreshUser } from 'src/common/jwt.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly cookieName: string;

  constructor(private readonly configService: ConfigService) {
    const cookieName = configService.getOrThrow<string>('REFRESH_COOKIE_NAME');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[cookieName] as string | null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REF_SECRET'),
      passReqToCallback: true,
    });

    this.cookieName = cookieName;
  }

  validate(req: Request, payload: JwtPayload): JwtRefreshUser {
    const refreshToken = req?.cookies?.[this.cookieName] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException();
    return { id: payload.sub, refreshToken };
  }
}
