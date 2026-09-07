import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MeController } from './me.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          // JWT_EXPIRES_IN is a free-form env value (e.g. "8h"); @nestjs/jwt's
          // typings want a narrower literal (`ms`-style) type here, so this
          // is cast at the boundary rather than over-constraining the env var.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '8h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard],
  exports: [JwtAuthGuard, PermissionsGuard, JwtModule],
})
export class AuthModule {}
