import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export const SESSION_COOKIE_NAME = 'praxis_session';

/**
 * Reads the httpOnly `praxis_session` cookie (populated by cookie-parser,
 * applied globally in main.ts), verifies the JWT, and attaches
 * `req.user = { id, role }` for downstream guards/handlers.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (request as any).user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
