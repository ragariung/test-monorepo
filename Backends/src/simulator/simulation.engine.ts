import { Injectable } from '@nestjs/common';
import { PaymentFrequency, Product } from '@prisma/client';
import {
  FormulaConfig,
  SimulationCalculationResult,
} from './interfaces/formula-config.interface';

export type PricingProduct = Pick<
  Product,
  | 'name'
  | 'minAge'
  | 'maxAge'
  | 'minSumAssured'
  | 'maxSumAssured'
  | 'allowedPaymentTerms'
  | 'baseAnnualRatePerMillion'
>;

export interface SimulationInput {
  age: number;
  sumAssured: number;
  paymentTermYears: number;
  paymentFrequency: PaymentFrequency;
}

/** Accepts either a plain number or a Prisma Decimal-like value. */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toNumber?: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

/**
 * The real premium calculation engine, driven entirely by the active
 * SimulationRuleVersion.formulaConfig for the product being priced.
 *
 * This is deliberately different from (and more correct than) the frontend's
 * mock `calculateSimulation` function, which hardcodes its age/term factor
 * formulas inline and never actually reads the ageBandMultipliers /
 * termDiscounts / frequencySurcharges fields that exist on its own
 * SimulationRuleVersion mock records - a real bug in the mock, where the
 * "versioned rule" data and the actual calculation are disconnected. This
 * engine fixes that by making the calculation genuinely driven by the active
 * rule version's stored config ("version financial logic").
 */
@Injectable()
export class SimulationEngine {
  calculate(
    product: PricingProduct,
    formulaConfig: FormulaConfig,
    input: SimulationInput,
  ): SimulationCalculationResult {
    const invalid = (validationError: string): SimulationCalculationResult => ({
      isValid: false,
      validationError,
      monthlyPremium: null,
      quarterlyPremium: null,
      semiAnnualPremium: null,
      annualPremium: null,
      totalEstimatedPayment: null,
    });

    const minAge = product.minAge;
    const maxAge = product.maxAge;
    const minSumAssured = toNumber(product.minSumAssured);
    const maxSumAssured = toNumber(product.maxSumAssured);
    const allowedPaymentTerms = product.allowedPaymentTerms;
    const baseAnnualRatePerMillion = toNumber(product.baseAnnualRatePerMillion);

    const { age, sumAssured, paymentTermYears, paymentFrequency } = input;

    if (age < minAge || age > maxAge) {
      return invalid(
        `Usia tertanggung harus antara ${minAge} sampai ${maxAge} tahun.`,
      );
    }

    if (sumAssured < minSumAssured || sumAssured > maxSumAssured) {
      return invalid(
        `Uang pertanggungan harus antara Rp ${minSumAssured} dan Rp ${maxSumAssured}.`,
      );
    }

    if (!allowedPaymentTerms.includes(paymentTermYears)) {
      return invalid(
        `Masa pembayaran yang tersedia: ${allowedPaymentTerms.join(', ')} tahun.`,
      );
    }

    if (age + paymentTermYears > formulaConfig.maxAgePlusTerm) {
      return invalid(
        `Kombinasi usia dan masa bayar melebihi batas maksimal ${formulaConfig.maxAgePlusTerm} tahun.`,
      );
    }

    const ageBand =
      formulaConfig.ageBands.find(
        (band) => age >= band.min && age <= band.max,
      ) ?? formulaConfig.ageBands[formulaConfig.ageBands.length - 1];

    const termMultiplier =
      formulaConfig.termMultipliers.find((t) => t.term === paymentTermYears)
        ?.multiplier ?? 1.0;

    const millions = sumAssured / 1_000_000;
    const rawAnnual =
      millions *
      baseAnnualRatePerMillion *
      ageBand.factor *
      termMultiplier *
      1000;
    const annualPremium = Math.round(rawAnnual / 1000) * 1000;

    const frequencyFactors = formulaConfig.frequencyFactors;
    const monthlyPremium =
      Math.round((annualPremium * frequencyFactors.MONTHLY) / 1000) * 1000;
    const quarterlyPremium =
      Math.round((annualPremium * frequencyFactors.QUARTERLY) / 1000) * 1000;
    const semiAnnualPremium =
      Math.round((annualPremium * frequencyFactors.SEMI_ANNUAL) / 1000) * 1000;
    const totalEstimatedPayment = annualPremium * paymentTermYears;

    // paymentFrequency itself doesn't change which premium fields are
    // computed (all four are always returned, matching the frontend's
    // simulator UI which lets the user switch frequency after simulating),
    // it is only persisted alongside the SimulationRun for record-keeping.
    void paymentFrequency;

    return {
      isValid: true,
      validationError: null,
      monthlyPremium,
      quarterlyPremium,
      semiAnnualPremium,
      annualPremium,
      totalEstimatedPayment,
    };
  }
}
