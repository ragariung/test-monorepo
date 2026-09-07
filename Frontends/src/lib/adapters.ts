/**
 * Converts real backend response shapes (Backends/, see api.ts) into the
 * frontend's pre-existing mock-era types (src/types.ts), so view components
 * never had to change to consume real data. See Docs/DATA-STRUCTURE.md §3 for
 * the full list of naming/enum differences this bridges.
 */
import {
  BackendApplicationDetail,
  BackendApplicationStatus,
  BackendAuditLogRow,
  BackendContactTime,
  BackendInboxRow,
  BackendPaymentFrequency,
  BackendProduct,
  BackendProductCategory,
  BackendProductDocument,
  BackendSimulationResult,
  BackendStaffRole,
} from './api';
import {
  ApplicantData,
  ApplicationRecord,
  ApplicationStatus,
  PaymentFrequency,
  SimulationParams,
  SimulationResult,
  AuditLogEntry,
  Product,
  ProductDocument,
  StaffUser,
} from '../types';

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : parseFloat(value);
}

const ROLE_LABELS: Record<BackendStaffRole, StaffUser['role']> = {
  UNDERWRITER_MANAGER: 'Underwriter Manager',
  SENIOR_UNDERWRITER: 'Senior Underwriter',
  UNDERWRITER: 'Underwriter',
  TELE_CONSULTANT: 'Tele-Consultant',
  ADMIN: 'System Admin',
  AUDITOR: 'Auditor',
};

export function roleLabel(role: BackendStaffRole): StaffUser['role'] {
  return ROLE_LABELS[role] ?? (role as StaffUser['role']);
}

// [backend enum value, frontend label] pairs, in the same fixed display
// order as ROLE_LABELS - used to build the role <select> in OrganizationView's
// "invite employee" form and the capability matrix's column order.
export const STAFF_ROLE_OPTIONS: [BackendStaffRole, StaffUser['role']][] = (
  Object.entries(ROLE_LABELS) as [BackendStaffRole, StaffUser['role']][]
);

/** managerId->fullName lookup must be built from the full users list first (see AppContext). */
export function adaptUser(
  user: {
    id: string;
    email: string;
    fullName: string;
    role: BackendStaffRole;
    department: string | null;
    managerId: string | null;
    isActive: boolean;
  },
  managerNameById: Map<string, string>,
): StaffUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: roleLabel(user.role),
    department: user.department ?? '',
    assignedCount: 0, // not tracked by the backend in v0
    managerId: user.managerId ?? undefined,
    managerName: user.managerId ? managerNameById.get(user.managerId) : undefined,
    isActive: user.isActive,
  };
}

const CATEGORY_LABELS: Record<BackendProductCategory, Product['category']> = {
  LIFE: 'life',
  FAMILY: 'family',
  CRITICAL_ILLNESS: 'critical-illness',
  EDUCATION: 'education',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
};

const DOCUMENT_TYPE_LABELS: Record<BackendProductDocument['documentType'], ProductDocument['type']> = {
  RIPLAY: 'RIPLAY',
  BROCHURE: 'Brosur',
  TERMS: 'Ketentuan Umum',
  OTHER: 'Polis Contoh',
};

const PRODUCT_STATUS_LABELS: Record<BackendProduct['status'], Product['status']> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function adaptProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: CATEGORY_LABELS[p.category],
    categoryLabel: p.categoryLabel,
    summary: p.summary,
    targetAudience: p.targetAudience,
    minAge: p.minAge,
    maxAge: p.maxAge,
    minSumAssured: toNumber(p.minSumAssured),
    maxSumAssured: toNumber(p.maxSumAssured),
    allowedPaymentTerms: p.allowedPaymentTerms,
    coverageDurationYears: p.coverageDurationYears,
    baseAnnualRatePerMillion: toNumber(p.baseAnnualRatePerMillion),
    status: PRODUCT_STATUS_LABELS[p.status],
    badge: p.badge ?? undefined,
    colorTone: p.colorTone ?? '#0F4C5C',
    keyBenefits: p.benefits.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      iconName: b.iconName ?? 'ShieldCheck',
    })),
    coverageDetails: p.coverageDetails.map((c) => ({
      category: c.category,
      benefit: c.benefit,
      maximumPayout: c.maximumPayout,
      notes: c.notes ?? '',
    })),
    eligibilityConditions: p.eligibilityConditions.map((e) => e.text),
    documents: p.documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: DOCUMENT_TYPE_LABELS[d.documentType],
      size: d.sizeLabel ?? '',
      url: d.url,
    })),
  };
}

const APPLICATION_STATUS_LABELS: Record<BackendApplicationStatus, ApplicationStatus> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const CONTACT_TIME_LABELS: Record<BackendApplicationDetail['preferredContactTime'], ApplicantData['preferredContactTime']> = {
  MORNING: 'Pagi (09.00 - 12.00 WIB)',
  AFTERNOON: 'Siang (13.00 - 17.00 WIB)',
  EVENING: 'Malam (19.00 - 21.00 WIB)',
};

function formatWIB(iso: string): string {
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(d);
  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(d);
  return `${datePart}, ${timePart} WIB`;
}

/**
 * Builds the row shape used by ApplicationsInboxView/AdminDashboardView from
 * a lightweight GET /admin/applications row. sumAssured, paymentTerm, and
 * monthlyPremium ARE real (the backend's mapInboxRow reads them out of the
 * application's simulationSnapshot - see Backends/src/applications/
 * applications.service.ts). quarterly/semester/annual premium and the
 * total-investment figure are NOT returned by the list endpoint (it only
 * exposes a single "estimated monthly premium" for the table), so those stay
 * placeholder zero here; they get filled in once the detail endpoint is
 * fetched for that specific application (see AppContext's route-triggered
 * detail fetch, and the CSV export which always re-fetches detail first).
 */
export function adaptInboxRow(row: BackendInboxRow): ApplicationRecord {
  return {
    id: row.id,
    reference: row.referenceNo,
    submittedAt: formatWIB(row.submittedAt),
    lastUpdated: formatWIB(row.submittedAt),
    applicant: {
      // Nullable on the backend for a DRAFT lead (see api.ts's BackendInboxRow
      // doc comment) - coalesced to empty/zero here so the rest of the app can
      // keep assuming ApplicantData's fields are always present, matching the
      // pattern already established for simulation figures below.
      fullName: row.applicantFullName,
      email: row.applicantEmail ?? '',
      phone: row.applicantPhone ?? '',
      age: row.applicantAge ?? 0,
      city: row.applicantCity ?? '',
      preferredContactTime: 'Pagi (09.00 - 12.00 WIB)',
      dataConsent: true,
    },
    productSnapshot: {
      id: row.product.id,
      slug: '',
      name: row.product.name,
      categoryLabel: '',
    },
    simulation: {
      params: {
        productId: row.product.id,
        productSlug: '',
        age: row.applicantAge ?? 0,
        sumAssured: row.sumAssured ?? 0,
        paymentTerm: row.paymentTermYears ?? 0,
        frequency: 'Bulanan',
      },
      monthlyPremium: row.estimatedMonthlyPremium ?? 0,
      quarterlyPremium: 0,
      semesterPremium: 0,
      annualPremium: 0,
      totalEstimatedInvestment: 0,
      isValid: true,
    },
    hasSimulation: row.sumAssured != null,
    status: APPLICATION_STATUS_LABELS[row.status],
    assignedTo: row.assignedTo?.fullName,
    internalNotes: [],
    auditTrail: [],
  };
}

export function adaptApplicationDetail(app: BackendApplicationDetail): ApplicationRecord {
  const sim = app.simulationSnapshot;
  return {
    id: app.id,
    reference: app.referenceNo,
    submittedAt: formatWIB(app.submittedAt),
    lastUpdated: formatWIB(app.updatedAt),
    applicant: {
      // Nullable on the backend for a DRAFT lead (see api.ts's
      // BackendApplicationDetail doc comment) - coalesced to empty/zero here,
      // same reasoning as adaptInboxRow above.
      fullName: app.applicantFullName,
      email: app.applicantEmail ?? '',
      phone: app.applicantPhone ?? '',
      age: app.applicantAge ?? 0,
      city: app.applicantCity ?? '',
      preferredContactTime: app.preferredContactTime
        ? CONTACT_TIME_LABELS[app.preferredContactTime]
        : 'Pagi (09.00 - 12.00 WIB)',
      notes: app.applicantNotes ?? undefined,
      dataConsent: true,
    },
    productSnapshot: {
      id: app.productSnapshot.id,
      slug: app.productSnapshot.slug,
      name: app.productSnapshot.name,
      categoryLabel: app.productSnapshot.categoryLabel,
    },
    simulation: {
      params: {
        productId: app.product.id,
        productSlug: app.product.slug,
        age: app.applicantAge ?? 0,
        sumAssured: sim?.sumAssured ?? 0,
        paymentTerm: sim?.paymentTermYears ?? 0,
        frequency: sim?.paymentFrequency ? FREQUENCY_TO_FRONTEND[sim.paymentFrequency] : 'Bulanan',
      },
      monthlyPremium: sim?.monthlyPremium ?? 0,
      quarterlyPremium: sim?.quarterlyPremium ?? 0,
      semesterPremium: sim?.semiAnnualPremium ?? 0,
      annualPremium: sim?.annualPremium ?? 0,
      totalEstimatedInvestment: sim?.totalEstimatedPayment ?? 0,
      // A lead with no simulation attached isn't an "invalid" simulation - it
      // just doesn't have one. isValid here only ever drove the (unrelated)
      // simulator's inline error banner, which no DRAFT-lead view renders.
      isValid: true,
    },
    hasSimulation: sim != null,
    status: APPLICATION_STATUS_LABELS[app.status],
    assignedTo: app.assignedTo?.fullName,
    rejectionReason: app.rejectionReason ?? undefined,
    internalNotes: app.notes.map((n) => ({
      id: n.id,
      author: n.author?.fullName ?? 'Staff',
      role: n.author ? roleLabel(n.author.role) : '',
      timestamp: formatWIB(n.createdAt),
      content: n.content,
    })),
    auditTrail: [],
  };
}

export function adaptAuditLog(row: BackendAuditLogRow, roleByActorId: Map<string, string>): AuditLogEntry {
  return {
    id: row.id,
    timestamp: formatWIB(row.createdAt),
    actor: row.actorLabel,
    actorRole: (row.actorId && roleByActorId.get(row.actorId)) || (row.actorId ? 'Staff' : 'Visitor'),
    action: row.action,
    entityType: (row.entityType as AuditLogEntry['entityType']) || 'Application',
    entityId: row.entityId,
    description: row.description,
    ipAddress: row.ipAddress ?? '—',
  };
}

// ---------------------------------------------------------------------------
// Frontend -> backend (public simulate/apply funnel)
// ---------------------------------------------------------------------------

export const FREQUENCY_TO_BACKEND: Record<PaymentFrequency, BackendPaymentFrequency> = {
  Bulanan: 'MONTHLY',
  Triwulanan: 'QUARTERLY',
  Semesteran: 'SEMI_ANNUAL',
  Tahunan: 'ANNUAL',
};

export const FREQUENCY_TO_FRONTEND: Record<BackendPaymentFrequency, PaymentFrequency> = {
  MONTHLY: 'Bulanan',
  QUARTERLY: 'Triwulanan',
  SEMI_ANNUAL: 'Semesteran',
  ANNUAL: 'Tahunan',
};

export const CONTACT_TIME_TO_BACKEND: Record<ApplicantData['preferredContactTime'], BackendContactTime> = {
  'Pagi (09.00 - 12.00 WIB)': 'MORNING',
  'Siang (13.00 - 17.00 WIB)': 'AFTERNOON',
  'Malam (19.00 - 21.00 WIB)': 'EVENING',
};

/**
 * Wraps a real POST /simulations response back into the frontend's existing
 * SimulationResult shape (same one calculateSimulation() used to produce),
 * so SimulatorView/ApplyView/SuccessView didn't need to change how they read
 * a simulation - only how one gets produced.
 */
export function adaptSimulationResult(result: BackendSimulationResult, params: SimulationParams): SimulationResult {
  return {
    params,
    monthlyPremium: result.monthlyPremium ?? 0,
    quarterlyPremium: result.quarterlyPremium ?? 0,
    semesterPremium: result.semiAnnualPremium ?? 0,
    annualPremium: result.annualPremium ?? 0,
    totalEstimatedInvestment: result.totalEstimatedPayment ?? 0,
    isValid: result.isValid,
    validationError: result.validationError ?? undefined,
    simulationRunId: result.simulationRunId,
  };
}
