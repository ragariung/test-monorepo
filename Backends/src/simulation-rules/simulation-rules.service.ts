import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RuleVersionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleVersionDto } from './dto/create-rule-version.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SimulationRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProduct(productId: string) {
    await this.assertProductExists(productId);
    return this.prisma.simulationRuleVersion.findMany({
      where: { productId },
      orderBy: { version: 'desc' },
    });
  }

  async createDraft(
    productId: string,
    dto: CreateRuleVersionDto,
    actingUser: AuthenticatedUser,
  ) {
    await this.assertProductExists(productId);

    const latest = await this.prisma.simulationRuleVersion.findFirst({
      where: { productId },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return this.prisma.simulationRuleVersion.create({
      data: {
        productId,
        version: nextVersion,
        status: RuleVersionStatus.DRAFT,
        formulaConfig: dto.formulaConfig as unknown as Prisma.InputJsonValue,
        createdById: actingUser.id,
      },
    });
  }

  async activate(ruleVersionId: string) {
    const target = await this.prisma.simulationRuleVersion.findUnique({
      where: { id: ruleVersionId },
    });
    if (!target) {
      throw new NotFoundException('Simulation rule version not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const currentlyActive = await tx.simulationRuleVersion.findFirst({
        where: { productId: target.productId, status: RuleVersionStatus.ACTIVE },
      });

      if (currentlyActive && currentlyActive.id !== target.id) {
        await tx.simulationRuleVersion.update({
          where: { id: currentlyActive.id },
          data: { status: RuleVersionStatus.RETIRED, effectiveTo: new Date() },
        });
      }

      return tx.simulationRuleVersion.update({
        where: { id: target.id },
        data: { status: RuleVersionStatus.ACTIVE, effectiveFrom: new Date() },
      });
    });
  }

  private async assertProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
