import { Module } from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {UsersModule} from 'src/users/users.module';
import { AuthService } from './auth.service';
import {LocalStrategy} from './local.strategy';
import { AuthController } from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_LIFETIME || '15m' } // use JWT_LIFETIME and fallback to 15 minutes if not set
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
