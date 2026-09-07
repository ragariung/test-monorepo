import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RuleVersionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationEngine } from './simulation.engine';
import { FormulaConfig } from './interfaces/formula-config.interface';
import { CreateSimulationDto } from './dto/create-simulation.dto';

export const SIMULATION_DISCLAIMER =
  'Angka ini adalah ilustrasi awal, bukan penawaran mengikat. Premi final ditentukan melalui proses underwriting resmi.';

@Injectable()
export class SimulatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: SimulationEngine,
  ) {}

  async runSimulation(dto: CreateSimulationDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const activeRuleVersion = await this.prisma.simulationRuleVersion.findFirst({
      where: { productId: product.id, status: RuleVersionStatus.ACTIVE },
    });

    if (!activeRuleVersion) {
      throw new BadRequestException(
        'This product has no active simulation rule version configured.',
      );
    }

    const formulaConfig = activeRuleVersion.formulaConfig as unknown as FormulaConfig;

    const result = this.engine.calculate(product, formulaConfig, {
      age: dto.age,
      sumAssured: dto.sumAssured,
      paymentTermYears: dto.paymentTermYears,
      paymentFrequency: dto.paymentFrequency,
    });

    const run = await this.prisma.simulationRun.create({
      data: {
        productId: product.id,
        ruleVersionId: activeRuleVersion.id,
        age: dto.age,
        sumAssured: dto.sumAssured,
        paymentTermYears: dto.paymentTermYears,
        paymentFrequency: dto.paymentFrequency,
        isValid: result.isValid,
        validationError: result.validationError,
        monthlyPremium: result.monthlyPremium,
        quarterlyPremium: result.quarterlyPremium,
        semiAnnualPremium: result.semiAnnualPremium,
        annualPremium: result.annualPremium,
        totalEstimatedPayment: result.totalEstimatedPayment,
      },
    });

    return {
      simulationRunId: run.id,
      ruleVersionId: activeRuleVersion.id,
      isValid: result.isValid,
      validationError: result.validationError,
      monthlyPremium: result.monthlyPremium,
      quarterlyPremium: result.quarterlyPremium,
      semiAnnualPremium: result.semiAnnualPremium,
      annualPremium: result.annualPremium,
      totalEstimatedPayment: result.totalEstimatedPayment,
      disclaimer: SIMULATION_DISCLAIMER,
    };
  }
}
