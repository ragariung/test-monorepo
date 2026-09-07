export interface AgeBandConfig {
  min: number;
  max: number;
  factor: number;
}

export interface TermMultiplierConfig {
  term: number;
  multiplier: number;
}

export interface FrequencyFactorsConfig {
  MONTHLY: number;
  QUARTERLY: number;
  SEMI_ANNUAL: number;
  ANNUAL: number;
}

/**
 * Shape of SimulationRuleVersion.formulaConfig (stored as Json in Postgres).
 * This is the single source of truth the calculation engine reads from -
 * nothing about the premium formula is hardcoded per-product in code.
 */
export interface FormulaConfig {
  maxAgePlusTerm: number;
  ageBands: AgeBandConfig[];
  termMultipliers: TermMultiplierConfig[];
  frequencyFactors: FrequencyFactorsConfig;
}

export interface SimulationCalculationResult {
  isValid: boolean;
  validationError: string | null;
  monthlyPremium: number | null;
  quarterlyPremium: number | null;
  semiAnnualPremium: number | null;
  annualPremium: number | null;
  totalEstimatedPayment: number | null;
}
