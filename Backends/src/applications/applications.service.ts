import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma, SimulationRun } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { toNumber } from '../simulator/simulation.engine';
import { SIMULATION_DISCLAIMER } from '../simulator/simulator.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { STATUS_LABELS } from './status-labels';

const INBOX_INCLUDE = {
  product: { select: { id: true, name: true } },
  assignments: {
    where: { unassignedAt: null },
    orderBy: { assignedAt: 'desc' as const },
    take: 1,
    include: { assignedTo: { select: { id: true, fullName: true } } },
  },
} satisfies Prisma.ApplicationInclude;

type InboxApplication = Prisma.ApplicationGetPayload<{
  include: typeof INBOX_INCLUDE;
}>;

/** Shape written by createAndSubmit()'s (and prisma/seed.ts's) simulationSnapshot. */
interface SimulationSnapshotShape {
  sumAssured?: number;
  paymentTermYears?: number;
  monthlyPremium?: number | null;
}

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------
  // Public: create + submit
  // ---------------------------------------------------------------------

  /**
   * v0 simplification: this project deliberately skips a separate
   * DRAFT-then-submit two-step flow. The real frontend always goes straight
   * from "run simulation" to "submit application" in one form, so the
   * Application is created directly with status SUBMITTED.
   */
  async createAndSubmit(dto: CreateApplicationDto) {
    if (dto.consent !== true) {
      throw new BadRequestException('Data consent is required to submit an application.');
    }

    const simulationRun = await this.prisma.simulationRun.findUnique({
      where: { id: dto.simulationRunId },
      include: { product: true },
    });

    if (!simulationRun) {
      throw new NotFoundException('Simulation run not found');
    }

    const product = simulationRun.product;
    const simulationSnapshot = this.buildSimulationSnapshot(simulationRun);

    const productSnapshot = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryLabel: product.categoryLabel,
    };

    const referenceNo = await this.generateUniqueReferenceNo();
    const now = new Date();

    const application = await this.prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          referenceNo,
          productId: product.id,
          simulationRunId: simulationRun.id,
          ruleVersionId: simulationRun.ruleVersionId,
          status: ApplicationStatus.SUBMITTED,
          applicantFullName: dto.applicant.fullName,
          applicantEmail: dto.applicant.email,
          applicantPhone: dto.applicant.phone,
          applicantAge: dto.applicant.age,
          applicantCity: dto.applicant.city,
          preferredContactTime: dto.applicant.preferredContactTime,
          applicantNotes: dto.applicant.notes,
          dataConsentAt: now,
          productSnapshot,
          simulationSnapshot,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          fromStatus: null,
          toStatus: ApplicationStatus.SUBMITTED,
          changedById: null,
        },
      });

      return created;
    });

    await this.audit.log({
      actorId: null,
      actorLabel: 'Public Web Guest',
      action: 'APPLICATION_CREATED',
      entityType: 'Application',
      entityId: application.id,
      description: `Pengajuan baru ${application.applicantFullName} berhasil dikirimkan untuk produk ${product.name}.`,
    });

    return { id: application.id, referenceNo: application.referenceNo };
  }

  private buildSimulationSnapshot(simulationRun: SimulationRun) {
    return {
      simulationRunId: simulationRun.id,
      ruleVersionId: simulationRun.ruleVersionId,
      isValid: simulationRun.isValid,
      validationError: simulationRun.validationError,
      sumAssured: toNumber(simulationRun.sumAssured),
      paymentTermYears: simulationRun.paymentTermYears,
      paymentFrequency: simulationRun.paymentFrequency,
      monthlyPremium:
        simulationRun.monthlyPremium != null ? toNumber(simulationRun.monthlyPremium) : null,
      quarterlyPremium:
        simulationRun.quarterlyPremium != null ? toNumber(simulationRun.quarterlyPremium) : null,
      semiAnnualPremium:
        simulationRun.semiAnnualPremium != null
          ? toNumber(simulationRun.semiAnnualPremium)
          : null,
      annualPremium:
        simulationRun.annualPremium != null ? toNumber(simulationRun.annualPremium) : null,
      totalEstimatedPayment:
        simulationRun.totalEstimatedPayment != null
          ? toNumber(simulationRun.totalEstimatedPayment)
          : null,
      disclaimer: SIMULATION_DISCLAIMER,
    };
  }

  /**
   * Lightweight lead capture for the PRAXIS Assistant chat workflow
   * (Automation/) - a DRAFT application, optionally with a simulation
   * attached. Unlike createAndSubmit(), a product is still required (no
   * anonymous leads), but everything else about the applicant is optional
   * except that at least one of email/phone must be present, and consent is
   * still mandatory (PRD.md §9's consent-recording principle applies here
   * too, not just to the formal web funnel).
   */
  async createLead(dto: CreateLeadDto) {
    if (dto.consent !== true) {
      throw new BadRequestException('Data consent is required to capture a lead.');
    }
    if (!dto.applicant.email && !dto.applicant.phone) {
      throw new BadRequestException('At least one of applicant.email or applicant.phone is required.');
    }

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let simulationSnapshot: ReturnType<ApplicationsService['buildSimulationSnapshot']> | undefined;
    let simulationRunId: string | undefined;
    let ruleVersionId: string | undefined;

    if (dto.simulationRunId) {
      // Explicit id: caller knows exactly which simulation they mean, so a
      // bad id is treated as a real error, not silently ignored.
      const simulationRun = await this.prisma.simulationRun.findUnique({
        where: { id: dto.simulationRunId },
      });
      if (!simulationRun) {
        throw new NotFoundException('Simulation run not found');
      }
      if (simulationRun.productId !== product.id) {
        throw new BadRequestException('simulationRunId does not belong to the given productId.');
      }
      simulationSnapshot = this.buildSimulationSnapshot(simulationRun);
      simulationRunId = simulationRun.id;
      ruleVersionId = simulationRun.ruleVersionId;
    } else if (dto.sessionId) {
      // Best-effort auto-attach for the chat workflow (see CreateLeadDto):
      // a chat session with no prior simulation is a normal case, so finding
      // none here is not an error - the lead is just captured without one.
      const simulationRun = await this.prisma.simulationRun.findFirst({
        where: { sessionId: dto.sessionId, productId: product.id, isValid: true },
        orderBy: { createdAt: 'desc' },
      });
      if (simulationRun) {
        simulationSnapshot = this.buildSimulationSnapshot(simulationRun);
        simulationRunId = simulationRun.id;
        ruleVersionId = simulationRun.ruleVersionId;
      }
    }

    const productSnapshot = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryLabel: product.categoryLabel,
    };

    const referenceNo = await this.generateUniqueReferenceNo();
    const now = new Date();

    const application = await this.prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          referenceNo,
          productId: product.id,
          simulationRunId,
          ruleVersionId,
          status: ApplicationStatus.DRAFT,
          applicantFullName: dto.applicant.fullName,
          applicantEmail: dto.applicant.email,
          applicantPhone: dto.applicant.phone,
          applicantAge: dto.applicant.age,
          applicantCity: dto.applicant.city,
          preferredContactTime: dto.applicant.preferredContactTime,
          applicantNotes: dto.applicant.notes,
          dataConsentAt: now,
          productSnapshot,
          simulationSnapshot,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          fromStatus: null,
          toStatus: ApplicationStatus.DRAFT,
          changedById: null,
        },
      });

      return created;
    });

    await this.audit.log({
      actorId: null,
      actorLabel: 'PRAXIS Assistant (n8n)',
      action: 'LEAD_CAPTURED',
      entityType: 'Application',
      entityId: application.id,
      description: `Prospek baru ${application.applicantFullName} tertarik pada produk ${product.name} (ditangkap via asisten chat).`,
    });

    return { id: application.id, referenceNo: application.referenceNo };
  }

  private async generateUniqueReferenceNo(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const candidate = `PRX-${year}-${randomDigits}`;
      const existing = await this.prisma.application.findUnique({
        where: { referenceNo: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }
    throw new Error('Failed to generate a unique application reference number');
  }

  // ---------------------------------------------------------------------
  // Admin: inbox / detail
  // ---------------------------------------------------------------------

  async listInbox(query: QueryApplicationsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.ApplicationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.assignedTo === 'unassigned') {
      where.assignments = { none: { unassignedAt: null } };
    } else if (query.assignedTo) {
      where.assignments = {
        some: { assignedToId: query.assignedTo, unassignedAt: null },
      };
    }
    if (query.search) {
      where.OR = [
        { referenceNo: { contains: query.search, mode: 'insensitive' } },
        { applicantFullName: { contains: query.search, mode: 'insensitive' } },
        { applicantEmail: { contains: query.search, mode: 'insensitive' } },
        { applicantPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        include: INBOX_INCLUDE,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map((row) => this.mapInboxRow(row)),
      total,
      page,
      pageSize,
    };
  }

  private mapInboxRow(app: InboxApplication) {
    const snapshot = (app.simulationSnapshot ?? {}) as SimulationSnapshotShape;

    return {
      id: app.id,
      referenceNo: app.referenceNo,
      status: app.status,
      applicantFullName: app.applicantFullName,
      applicantEmail: app.applicantEmail,
      applicantPhone: app.applicantPhone,
      applicantAge: app.applicantAge,
      applicantCity: app.applicantCity,
      submittedAt: app.submittedAt,
      product: app.product,
      assignedTo: app.assignments[0]?.assignedTo ?? null,
      sumAssured: snapshot.sumAssured ?? null,
      paymentTermYears: snapshot.paymentTermYears ?? null,
      estimatedMonthlyPremium: snapshot.monthlyPremium ?? null,
    };
  }

  async detail(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        product: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, fullName: true, role: true } } },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, fullName: true, role: true } } },
        },
        assignments: {
          where: { unassignedAt: null },
          orderBy: { assignedAt: 'desc' },
          take: 1,
          include: { assignedTo: { select: { id: true, fullName: true, role: true } } },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const { assignments, ...rest } = application;
    return {
      ...rest,
      assignedTo: assignments[0]?.assignedTo ?? null,
    };
  }

  private async getApplicationOrThrow(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  private async actorLabel(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.fullName ?? 'Unknown Staff';
  }

  // ---------------------------------------------------------------------
  // Admin: status transitions
  // ---------------------------------------------------------------------

  async startReview(id: string, actingUser: AuthenticatedUser) {
    const application = await this.getApplicationOrThrow(id);

    if (application.status !== ApplicationStatus.SUBMITTED) {
      throw new ConflictException(
        `Cannot start review from status ${application.status}`,
      );
    }

    return this.transitionStatus(
      application,
      ApplicationStatus.UNDER_REVIEW,
      actingUser,
    );
  }

  async approve(id: string, actingUser: AuthenticatedUser) {
    const application = await this.getApplicationOrThrow(id);

    if (application.status !== ApplicationStatus.UNDER_REVIEW) {
      throw new ConflictException(
        `Cannot approve from status ${application.status}`,
      );
    }

    return this.transitionStatus(
      application,
      ApplicationStatus.APPROVED,
      actingUser,
      { approvedAt: new Date() },
    );
  }

  async reject(id: string, dto: RejectApplicationDto, actingUser: AuthenticatedUser) {
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException('reason is required');
    }

    const application = await this.getApplicationOrThrow(id);

    if (
      application.status !== ApplicationStatus.SUBMITTED &&
      application.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new ConflictException(
        `Cannot reject from status ${application.status}`,
      );
    }

    return this.transitionStatus(
      application,
      ApplicationStatus.REJECTED,
      actingUser,
      { rejectedAt: new Date(), rejectionReason: dto.reason },
      dto.reason,
    );
  }

  private async transitionStatus(
    application: { id: string; status: ApplicationStatus; applicantFullName: string },
    toStatus: ApplicationStatus,
    actingUser: AuthenticatedUser,
    extraData: Prisma.ApplicationUpdateInput = {},
    comment?: string,
  ) {
    const fromStatus = application.status;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.application.update({
        where: { id: application.id },
        data: { status: toStatus, ...extraData },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus,
          toStatus,
          changedById: actingUser.id,
          comment: comment ?? null,
        },
      });

      return result;
    });

    const label = await this.actorLabel(actingUser.id);
    const description =
      toStatus === ApplicationStatus.REJECTED
        ? `Menolak pengajuan ${application.applicantFullName}. Alasan: ${comment}.`
        : `Mengubah status pengajuan ${application.applicantFullName} dari ${STATUS_LABELS[fromStatus]} menjadi ${STATUS_LABELS[toStatus]}.`;

    await this.audit.log({
      actorId: actingUser.id,
      actorLabel: label,
      action: 'STATUS_UPDATE',
      entityType: 'Application',
      entityId: application.id,
      description,
    });

    return updated;
  }

  // ---------------------------------------------------------------------
  // Admin: assignment
  // ---------------------------------------------------------------------

  async assign(id: string, dto: AssignApplicationDto, actingUser: AuthenticatedUser) {
    const application = await this.getApplicationOrThrow(id);

    const currentAssignment = await this.prisma.applicationAssignment.findFirst({
      where: { applicationId: id, unassignedAt: null },
    });

    let newAssigneeName: string | null = null;

    await this.prisma.$transaction(async (tx) => {
      if (currentAssignment) {
        await tx.applicationAssignment.update({
          where: { id: currentAssignment.id },
          data: { unassignedAt: new Date() },
        });
      }

      if (dto.userId) {
        const assignee = await tx.user.findUnique({ where: { id: dto.userId } });
        if (!assignee) {
          throw new BadRequestException('userId does not reference an existing user');
        }
        newAssigneeName = assignee.fullName;

        await tx.applicationAssignment.create({
          data: {
            applicationId: id,
            assignedToId: dto.userId,
            assignedById: actingUser.id,
          },
        });
      }
    });

    const label = await this.actorLabel(actingUser.id);
    const description = newAssigneeName
      ? `Menugaskan pengajuan ${application.applicantFullName} kepada ${newAssigneeName}.`
      : `Menghapus penugasan pengajuan ${application.applicantFullName}.`;

    await this.audit.log({
      actorId: actingUser.id,
      actorLabel: label,
      action: 'ASSIGNMENT',
      entityType: 'Application',
      entityId: application.id,
      description,
    });

    return this.detail(id);
  }

  // ---------------------------------------------------------------------
  // Admin: notes
  // ---------------------------------------------------------------------

  async addNote(id: string, dto: AddNoteDto, actingUser: AuthenticatedUser) {
    await this.getApplicationOrThrow(id);

    return this.prisma.applicationNote.create({
      data: {
        applicationId: id,
        authorId: actingUser.id,
        content: dto.content,
        isInternal: true,
      },
      include: { author: { select: { id: true, fullName: true, role: true } } },
    });
  }

  // ---------------------------------------------------------------------
  // Admin: dashboard summary
  // ---------------------------------------------------------------------

  async dashboardSummary(actingUser: AuthenticatedUser) {
    const [
      submittedCount,
      underReviewCount,
      approvedCount,
      rejectedCount,
      assignedToMeCount,
      unassignedCount,
      recentApplicationsRaw,
      recentAuditLogs,
    ] = await this.prisma.$transaction([
      this.prisma.application.count({ where: { status: ApplicationStatus.SUBMITTED } }),
      this.prisma.application.count({ where: { status: ApplicationStatus.UNDER_REVIEW } }),
      this.prisma.application.count({ where: { status: ApplicationStatus.APPROVED } }),
      this.prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
      this.prisma.application.count({
        where: { assignments: { some: { assignedToId: actingUser.id, unassignedAt: null } } },
      }),
      this.prisma.application.count({
        where: { assignments: { none: { unassignedAt: null } } },
      }),
      this.prisma.application.findMany({
        include: INBOX_INCLUDE,
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return {
      submittedCount,
      underReviewCount,
      approvedCount,
      rejectedCount,
      assignedToMeCount,
      unassignedCount,
      recentApplications: recentApplicationsRaw.map((row) => this.mapInboxRow(row)),
      recentAuditLogs,
    };
  }
}
