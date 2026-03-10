import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private readonly JWT_ACC_SECRET: string;
  private readonly JWT_REF_SECRET: string;
  private readonly JWT_ACC_TOKEN_TTL: StringValue;
  private readonly JWT_REF_TOKEN_TTL: StringValue;

  constructor(
    private readonly prismaService: PrismaService,
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

    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return this.signTokens(user.id);
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });

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
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        refreshToken: true,
      },
    });

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
