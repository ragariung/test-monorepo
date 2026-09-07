import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException({ status: 'not-ready' });
    }
  }
}
