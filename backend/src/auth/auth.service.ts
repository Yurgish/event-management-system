import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { StringValue } from 'ms';

import { LoginDto, RegisterDto } from '@/auth/dto/auth.dto';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
  private readonly JWT_ACC_SECRET: string;
  private readonly JWT_REF_SECRET: string;
  private readonly JWT_ACC_TOKEN_TTL: StringValue;
  private readonly JWT_REF_TOKEN_TTL: StringValue;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACC_SECRET =
      this.configService.getOrThrow<string>('JWT_ACC_SECRET');
    this.JWT_REF_SECRET =
      this.configService.getOrThrow<string>('JWT_REF_SECRET');
    this.JWT_ACC_TOKEN_TTL =
      this.configService.getOrThrow<StringValue>('JWT_ACC_TOKEN_TTL');
    this.JWT_REF_TOKEN_TTL =
      this.configService.getOrThrow<StringValue>('JWT_REF_TOKEN_TTL');
  }

  private async signTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.JWT_ACC_SECRET,
        expiresIn: this.JWT_ACC_TOKEN_TTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.JWT_REF_SECRET,
        expiresIn: this.JWT_REF_TOKEN_TTL,
      }),
    ]);

    const hashedRefreshToken = await hash(refreshToken, 10);

    await this.userService.setRefreshTokenHash(userId, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
    });

    return this.signTokens(user.id);
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const existingUser = await this.userService.findByEmailWithPassword(email);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signTokens(existingUser.id);
  }

  async logout(userId: string) {
    await this.userService.clearRefreshToken(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findRefreshHashById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or no refresh token');
    }

    const isRefreshTokenValid = await compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.signTokens(userId);
  }
}
