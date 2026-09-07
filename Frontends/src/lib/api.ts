/**
 * Thin typed client for the real Backends/ NestJS API.
 *
 * Every function here mirrors an endpoint documented in
 * ../../Docs/API-LIST-V0.md exactly - method, path, and payload shape. Keep
 * both in sync when either side changes.
 */

const API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (body && (Array.isArray(body.message) ? body.message.join(', ') : body.message)) ||
      res.statusText ||
      'Request failed';
    throw new ApiError(res.status, message);
  }

  return body as T;
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ---------------------------------------------------------------------------
// Backend wire types (raw shapes, before frontend adaptation)
// ---------------------------------------------------------------------------

export type BackendStaffRole =
  | 'UNDERWRITER_MANAGER'
  | 'SENIOR_UNDERWRITER'
  | 'UNDERWRITER'
  | 'TELE_CONSULTANT'
  | 'ADMIN'
  | 'AUDITOR';

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: BackendStaffRole;
  department: string | null;
  managerId: string | null;
  isActive: boolean;
}

export type BackendApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type BackendProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BackendProductCategory =
  | 'LIFE'
  | 'FAMILY'
  | 'CRITICAL_ILLNESS'
  | 'EDUCATION'
  | 'SAVINGS'
  | 'INVESTMENT';
export type BackendPaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
export type BackendContactTime = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type BackendDocumentType = 'BROCHURE' | 'RIPLAY' | 'TERMS' | 'OTHER';

export interface BackendProductBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  sortOrder: number;
}

export interface BackendProductCoverageDetail {
  id: string;
  category: string;
  benefit: string;
  maximumPayout: string;
  notes: string | null;
  sortOrder: number;
}

export interface BackendProductEligibilityCondition {
  id: string;
  text: string;
  sortOrder: number;
}

export interface BackendProductDocument {
  id: string;
  name: string;
  documentType: BackendDocumentType;
  sizeLabel: string | null;
  url: string;
}

export interface BackendProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: BackendProductCategory;
  categoryLabel: string;
  summary: string;
  targetAudience: string[];
  minAge: number;
  maxAge: number;
  minSumAssured: string | number;
  maxSumAssured: string | number;
  allowedPaymentTerms: number[];
  coverageDurationYears: number;
  baseAnnualRatePerMillion: string | number;
  status: BackendProductStatus;
  badge: string | null;
  colorTone: string | null;
  publishedAt: string | null;
  benefits: BackendProductBenefit[];
  coverageDetails: BackendProductCoverageDetail[];
  eligibilityConditions: BackendProductEligibilityCondition[];
  documents: BackendProductDocument[];
}

export interface BackendSimulationResult {
  simulationRunId: string;
  ruleVersionId: string;
  isValid: boolean;
  validationError: string | null;
  monthlyPremium: number | null;
  quarterlyPremium: number | null;
  semiAnnualPremium: number | null;
  annualPremium: number | null;
  totalEstimatedPayment: number | null;
  disclaimer: string;
}

export interface BackendInboxRow {
  id: string;
  referenceNo: string;
  status: BackendApplicationStatus;
  applicantFullName: string;
  // Nullable: a DRAFT lead (see leads.controller.ts) may not have all of
  // these yet - only applicantFullName + at least one of email/phone are
  // guaranteed. Every SUBMITTED application still always has all of them.
  applicantEmail: string | null;
  applicantPhone: string | null;
  applicantAge: number | null;
  applicantCity: string | null;
  submittedAt: string;
  product: { id: string; name: string };
  assignedTo: { id: string; fullName: string } | null;
  sumAssured: number | null;
  paymentTermYears: number | null;
  estimatedMonthlyPremium: number | null;
}

export interface BackendApplicationDetail {
  id: string;
  referenceNo: string;
  status: BackendApplicationStatus;
  applicantFullName: string;
  // Nullable: a DRAFT lead (see leads.controller.ts) may not have all of
  // these yet - only applicantFullName + at least one of email/phone are
  // guaranteed. Every SUBMITTED application still always has all of them.
  applicantEmail: string | null;
  applicantPhone: string | null;
  applicantAge: number | null;
  applicantCity: string | null;
  preferredContactTime: BackendContactTime | null;
  applicantNotes: string | null;
  productSnapshot: { id: string; slug: string; name: string; categoryLabel: string };
  // Null for a lead with no simulation run attached.
  simulationSnapshot: {
    sumAssured: number | null;
    paymentTermYears: number | null;
    paymentFrequency: BackendPaymentFrequency | null;
    monthlyPremium: number | null;
    quarterlyPremium: number | null;
    semiAnnualPremium: number | null;
    annualPremium: number | null;
    totalEstimatedPayment: number | null;
    disclaimer: string;
  } | null;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
  product: { id: string; slug: string; name: string };
  notes: {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; fullName: string; role: BackendStaffRole } | null;
  }[];
  statusHistory: {
    id: string;
    fromStatus: BackendApplicationStatus | null;
    toStatus: BackendApplicationStatus;
    comment: string | null;
    createdAt: string;
    changedBy: { id: string; fullName: string; role: BackendStaffRole } | null;
  }[];
  assignedTo: { id: string; fullName: string; role: BackendStaffRole } | null;
}

export interface BackendAuditLogRow {
  id: string;
  actorId: string | null;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    request<BackendUser>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => request<BackendUser>('/me'),
};

// ---------------------------------------------------------------------------
// Public: products, simulator, applications
// ---------------------------------------------------------------------------

export const publicApi = {
  listProducts: () => request<BackendProduct[]>('/products'),
  getProduct: (slug: string) => request<BackendProduct>(`/products/${encodeURIComponent(slug)}`),
  simulate: (input: {
    productId: string;
    age: number;
    sumAssured: number;
    paymentTermYears: number;
    paymentFrequency: BackendPaymentFrequency;
  }) => request<BackendSimulationResult>('/simulations', { method: 'POST', body: JSON.stringify(input) }),
  submitApplication: (input: {
    productId: string;
    simulationRunId: string;
    applicant: {
      fullName: string;
      email: string;
      phone: string;
      age: number;
      city: string;
      preferredContactTime: BackendContactTime;
      notes?: string;
    };
    consent: boolean;
  }) =>
    request<{ id: string; referenceNo: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

// ---------------------------------------------------------------------------
// Admin: applications
// ---------------------------------------------------------------------------

export interface AdminApplicationsQuery {
  status?: BackendApplicationStatus;
  productId?: string;
  assignedTo?: string; // a user id, or the literal string 'unassigned'
  search?: string;
  page?: number;
  pageSize?: number;
}

export const adminApplicationsApi = {
  list: (query: AdminApplicationsQuery = {}) =>
    request<{ data: BackendInboxRow[]; total: number; page: number; pageSize: number }>(
      `/admin/applications${qs(query as Record<string, string | number | undefined>)}`,
    ),
  detail: (id: string) => request<BackendApplicationDetail>(`/admin/applications/${id}`),
  startReview: (id: string) => request<{ status: BackendApplicationStatus }>(`/admin/applications/${id}/start-review`, { method: 'POST' }),
  approve: (id: string) => request<{ status: BackendApplicationStatus }>(`/admin/applications/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string) =>
    request<{ status: BackendApplicationStatus }>(`/admin/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  assign: (id: string, userId: string | null) =>
    request<BackendApplicationDetail>(`/admin/applications/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  addNote: (id: string, content: string) =>
    request<{ id: string; content: string; createdAt: string; author: { id: string; fullName: string; role: BackendStaffRole } }>(
      `/admin/applications/${id}/notes`,
      { method: 'POST', body: JSON.stringify({ content }) },
    ),
};

export const adminDashboardApi = {
  summary: () =>
    request<{
      submittedCount: number;
      underReviewCount: number;
      approvedCount: number;
      rejectedCount: number;
      assignedToMeCount: number;
      unassignedCount: number;
      recentApplications: BackendInboxRow[];
      recentAuditLogs: BackendAuditLogRow[];
    }>('/admin/dashboard/summary'),
};

// ---------------------------------------------------------------------------
// Admin: products & simulation rules
// ---------------------------------------------------------------------------

export const adminProductsApi = {
  list: () => request<BackendProduct[]>('/admin/products'),
  create: (dto: Record<string, unknown>) =>
    request<BackendProduct>('/admin/products', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: string, dto: Record<string, unknown>) =>
    request<BackendProduct>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  publish: (id: string) => request<BackendProduct>(`/admin/products/${id}/publish`, { method: 'POST' }),
  archive: (id: string) => request<BackendProduct>(`/admin/products/${id}/archive`, { method: 'POST' }),
};

export const adminSimulationRulesApi = {
  listForProduct: (productId: string) => request<any[]>(`/admin/products/${productId}/simulation-rules`),
  createDraft: (productId: string, formulaConfig: Record<string, unknown>) =>
    request<any>(`/admin/products/${productId}/simulation-rules`, {
      method: 'POST',
      body: JSON.stringify({ formulaConfig }),
    }),
  activate: (ruleVersionId: string) =>
    request<any>(`/admin/simulation-rules/${ruleVersionId}/activate`, { method: 'PATCH' }),
};

// ---------------------------------------------------------------------------
// Admin: users & organization
// ---------------------------------------------------------------------------

export const adminUsersApi = {
  list: () => request<BackendUser[]>('/admin/users'),
  create: (dto: {
    email: string;
    fullName: string;
    role: BackendStaffRole;
    department?: string;
    managerId?: string | null;
    password: string;
  }) => request<BackendUser>('/admin/users', { method: 'POST', body: JSON.stringify(dto) }),
  updateManager: (id: string, managerId: string | null) =>
    request<BackendUser>(`/admin/users/${id}/manager`, { method: 'PATCH', body: JSON.stringify({ managerId }) }),
};

// ---------------------------------------------------------------------------
// Admin: audit log
// ---------------------------------------------------------------------------

export const adminAuditApi = {
  list: (query: { search?: string; action?: string } = {}) =>
    request<BackendAuditLogRow[]>(`/admin/audit${qs(query)}`),
};

// ---------------------------------------------------------------------------
// Operational
// ---------------------------------------------------------------------------

export const healthApi = {
  health: () => request<{ status: string }>('/health'),
  ready: () => request<{ status: string }>('/ready'),
};
