export type ProductCategory = 
  | 'life' 
  | 'family' 
  | 'critical-illness' 
  | 'education' 
  | 'savings' 
  | 'investment';

export type ProductStatus = 'Draft' | 'Published' | 'Archived';

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type PaymentFrequency = 'Bulanan' | 'Triwulanan' | 'Semesteran' | 'Tahunan';

export interface ProductDocument {
  id: string;
  name: string;
  type: 'RIPLAY' | 'Brosur' | 'Polis Contoh' | 'Ketentuan Umum';
  size: string;
  url: string;
}

export interface ProductBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface CoverageDetailItem {
  category: string;
  benefit: string;
  maximumPayout: string;
  notes: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  categoryLabel: string;
  summary: string;
  targetAudience: string[];
  minAge: number;
  maxAge: number;
  minSumAssured: number; // e.g. 100_000_000
  maxSumAssured: number; // e.g. 5_000_000_000
  allowedPaymentTerms: number[]; // e.g. [5, 10, 15, 20]
  coverageDurationYears: number; // e.g. 99 (Whole life) or 20
  baseAnnualRatePerMillion: number; // base rate calculation
  status: ProductStatus;
  keyBenefits: ProductBenefit[];
  coverageDetails: CoverageDetailItem[];
  eligibilityConditions: string[];
  documents: ProductDocument[];
  badge?: string;
  colorTone: string;
}

export interface SimulationParams {
  productId: string;
  productSlug: string;
  age: number;
  sumAssured: number;
  paymentTerm: number;
  frequency: PaymentFrequency;
}

export interface SimulationResult {
  params: SimulationParams;
  monthlyPremium: number;
  quarterlyPremium: number;
  semesterPremium: number;
  annualPremium: number;
  totalEstimatedInvestment: number;
  isValid: boolean;
  validationError?: string;
  /** Set once this result comes from the real POST /simulations call; required to submit an application against it. */
  simulationRunId?: string;
}

export interface ApplicantData {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  preferredContactTime: 'Pagi (09.00 - 12.00 WIB)' | 'Siang (13.00 - 17.00 WIB)' | 'Malam (19.00 - 21.00 WIB)';
  notes?: string;
  dataConsent: boolean;
}

export interface ApplicationNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

export interface ApplicationAuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface ApplicationRecord {
  id: string;
  reference: string;
  submittedAt: string;
  lastUpdated: string;
  applicant: ApplicantData;
  productSnapshot: {
    id: string;
    slug: string;
    name: string;
    categoryLabel: string;
  };
  simulation: SimulationResult;
  status: ApplicationStatus;
  assignedTo?: string; // staff user id or name
  rejectionReason?: string;
  internalNotes: ApplicationNote[];
  notes?: ApplicationNote[];
  auditTrail: ApplicationAuditItem[];
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Underwriter Manager' | 'Senior Underwriter' | 'Underwriter' | 'Tele-Consultant' | 'System Admin' | 'Auditor';
  department: string;
  assignedCount: number;
  managerId?: string;
  managerName?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: 'Application' | 'Product' | 'SimulationRule' | 'User';
  entityId: string;
  targetId?: string;
  description: string;
  ipAddress: string;
}

export interface SimulationRuleVersion {
  version: string;
  status: 'Active' | 'Draft' | 'Retired';
  effectiveDate: string;
  author: string;
  baseMortalityMultiplier: number;
  ageBandMultipliers: { range: string; factor: number }[];
  termDiscounts: { term: number; discountPercent: number }[];
  frequencySurcharges: { frequency: PaymentFrequency; factor: number }[];
}
