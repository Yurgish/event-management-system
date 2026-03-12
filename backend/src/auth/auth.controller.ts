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
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import ms, { StringValue } from 'ms';

import { AuthService } from '@/auth/auth.service';
import {
  AuthResponseDto,
  LoginDto,
  LogoutResponseDto,
  RegisterDto,
} from '@/auth/dto/auth.dto';
import { JwtRefreshGuard } from '@/auth/guards';
import { JwtRefreshUser } from '@/common/jwt.types';

type RefreshRequest = Request & { user: JwtRefreshUser };

@Controller('auth')
@ApiTags('Auth')
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
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    type: AuthResponseDto,
    description:
      'User is registered and receives access token in response body and refresh token in httpOnly cookie.',
  })
  @ApiConflictResponse({ description: 'Email is already registered' })
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
  @ApiOperation({ summary: 'Login existing user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: AuthResponseDto,
    description:
      'Login succeeds and returns access token. Refresh token is set as httpOnly cookie.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
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
  @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
  @ApiCookieAuth('refreshToken')
  @ApiOkResponse({
    type: AuthResponseDto,
    description:
      'Returns new access token and rotates refresh token in httpOnly cookie.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
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
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiCookieAuth('refreshToken')
  @ApiOkResponse({
    type: LogoutResponseDto,
    description: 'Refresh token is revoked in DB and cleared from cookie.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
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
