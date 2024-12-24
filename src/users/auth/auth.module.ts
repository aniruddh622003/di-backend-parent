import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  AccessTokenStrategy,
  AuthUtilsService,
  RefreshTokenStrategy,
} from '@di/auth-utils';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthUtilsService,
  ],
})
export class AuthModule {}
