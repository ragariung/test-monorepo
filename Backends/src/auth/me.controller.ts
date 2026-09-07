import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { toPublicUser } from '../users/public-user';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getProfile(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(user);
  }
}
