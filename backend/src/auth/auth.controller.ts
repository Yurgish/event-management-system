import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtRefreshUser } from 'src/common/jwt.types';

type RefreshRequest = Request & { user: JwtRefreshUser };

@Controller('auth')
export class AuthController {
  private readonly refreshCookieName: string;
  private readonly refreshCookieMaxAge: number;
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.refreshCookieName =
      this.configService.get<string>('REFRESH_COOKIE_NAME') ?? 'refreshToken';

    const refreshTokenTtl =
      this.configService.getOrThrow<StringValue>('JWT_REF_TOKEN_TTL');

    this.refreshCookieMaxAge = ms(refreshTokenTtl);
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  private getRefreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      maxAge: this.refreshCookieMaxAge,
      path: '/auth',
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(
      this.refreshCookieName,
      refreshToken,
      this.getRefreshCookieOptions(),
    );
  }

  private clearRefreshCookie(res: Response) {
    const { httpOnly, secure, sameSite, path } = this.getRefreshCookieOptions();
    res.clearCookie(this.refreshCookieName, {
      httpOnly,
      secure,
      sameSite,
      path,
    });
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.id,
      req.user.refreshToken,
    );

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    this.clearRefreshCookie(res);

    return { success: true };
  }
}
