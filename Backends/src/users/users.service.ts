import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { toPublicUser } from './public-user';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { fullName: 'asc' },
    });
    return users.map(toPublicUser);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    if (dto.managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: dto.managerId },
      });
      if (!manager) {
        throw new BadRequestException('managerId does not reference an existing user');
      }
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        department: dto.department,
        managerId: dto.managerId ?? null,
        passwordHash,
      },
    });

    return toPublicUser(user);
  }

  async updateManager(userId: string, managerId: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (managerId) {
      if (managerId === userId) {
        throw new BadRequestException(
          'Manager relationship would create a cycle',
        );
      }

      const proposedManager = await this.prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!proposedManager) {
        throw new BadRequestException(
          'managerId does not reference an existing user',
        );
      }

      // Walk upward from the proposed manager, following manager -> manager
      // -> ... . If we ever reach the target user's own id, assigning this
      // manager would create a cycle in the reporting hierarchy.
      let cursor: string | null = proposedManager.managerId;
      const visited = new Set<string>([proposedManager.id]);
      while (cursor) {
        if (cursor === userId) {
          throw new BadRequestException(
            'Manager relationship would create a cycle',
          );
        }
        if (visited.has(cursor)) {
          // Defensive: an existing cycle upstream that doesn't involve
          // userId. Stop walking rather than loop forever.
          break;
        }
        visited.add(cursor);
        const next: { managerId: string | null } | null =
          await this.prisma.user.findUnique({
            where: { id: cursor },
            select: { managerId: true },
          });
        cursor = next?.managerId ?? null;
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { managerId },
    });

    return toPublicUser(updated);
  }
}
