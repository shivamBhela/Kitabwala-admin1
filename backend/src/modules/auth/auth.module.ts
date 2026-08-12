import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { TwoFactorService } from './two-factor.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({}), AuditModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, TwoFactorService, JwtStrategy],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
