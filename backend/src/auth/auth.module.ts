import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtRefreshStrategy, JwtStrategy } from '@/auth/strategies';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [JwtModule.register({ global: true }), UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
