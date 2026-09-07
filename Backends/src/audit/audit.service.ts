import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface LogAuditEntryInput {
  actorId?: string | null;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  beforeData?: Prisma.InputJsonValue | null;
  afterData?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

/**
 * Thin injectable wrapper around AuditLog writes, reused by every module
 * that needs to record an admin/system action (applications, products,
 * simulation rules, users, ...).
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(input: LogAuditEntryInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorLabel: input.actorLabel,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        description: input.description,
        beforeData: input.beforeData ?? Prisma.JsonNull,
        afterData: input.afterData ?? Prisma.JsonNull,
        ipAddress: input.ipAddress ?? null,
      },
    });
  }

  /**
   * v0 limitation: capped at the 200 most recent rows, no full pagination
   * yet. Fine for the MVP's audit log admin view; revisit if/when the table
   * grows large enough that this stops being representative.
   */
  async list(params: { search?: string; action?: string }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (params.action) {
      where.action = params.action;
    }

    if (params.search) {
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { actorLabel: { contains: params.search, mode: 'insensitive' } },
        { entityId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
