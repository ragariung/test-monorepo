import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser } from '../users/public-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAndLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Generic failure message on purpose: never reveal whether the email exists.
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return { token, user: toPublicUser(user) };
  }
}
