import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SESSION_COOKIE_NAME } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.validateAndLogin(
      dto.email,
      dto.password,
    );

    // No explicit maxAge: the cookie's actual validity is governed by the
    // JWT's own expiry (JWT_EXPIRES_IN), which JwtAuthGuard enforces on
    // verification. Keeping the cookie itself a session cookie avoids
    // duplicating/hard-coding that expiry in two places.
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return { success: true };
  }
}
