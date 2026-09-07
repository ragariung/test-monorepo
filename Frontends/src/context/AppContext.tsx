import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  ApplicationRecord,
  StaffUser,
  AuditLogEntry,
  SimulationRuleVersion,
  SimulationResult,
  ApplicationStatus,
  ApplicantData
} from '../types';
import {
  INITIAL_SIMULATION_RULES
} from '../data/mockData';
import { authApi, adminApplicationsApi, adminUsersApi, adminAuditApi, publicApi, ApiError } from '../lib/api';
import {
  adaptApplicationDetail,
  adaptAuditLog,
  adaptInboxRow,
  adaptProduct,
  adaptUser,
  CONTACT_TIME_TO_BACKEND,
} from '../lib/adapters';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentPath: string;
  navigate: (path: string) => void;
  products: Product[];
  applications: ApplicationRecord[];
  staffList: StaffUser[];
  simulationRules: SimulationRuleVersion[];
  auditLogs: AuditLogEntry[];
  activeSimulation: SimulationResult | null;
  setActiveSimulation: (sim: SimulationResult | null) => void;
  /** Set by submitApplication on success; SuccessView reads it to personalize the confirmation page and generate the receipt PDF (in-memory only - lost on a hard refresh, which is an accepted MVP limitation). */
  lastSubmission: {
    reference: string;
    submittedAt: string;
    applicant: ApplicantData;
    simulation: SimulationResult;
    productName: string;
  } | null;
  authLoading: boolean;
  isAdminLoggedIn: boolean;
  currentUser: StaffUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  submitApplication: (applicant: ApplicantData, simulation: SimulationResult) => Promise<string>;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, reason?: string) => void;
  assignApplication: (appId: string, staffName: string | null) => void;
  addApplicationNote: (appId: string, noteText: string) => void;
  updateProduct: (productIdOrUpdated: string | Product, partial?: Partial<Product>) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize route from window.location or default to '/'
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') {
      return window.location.pathname;
    }
    return '/';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [simulationRules] = useState<SimulationRuleVersion[]>(INITIAL_SIMULATION_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [activeSimulation, setActiveSimulation] = useState<SimulationResult | null>(null);
  const [lastSubmission, setLastSubmission] = useState<AppContextType['lastSubmission']>(null);

  // Admin auth state - real, backed by the httpOnly session cookie + GET /me
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Public products - fetched unauthenticated on mount, feeds both the
  // public catalogue/detail/simulator pages AND the admin inbox's product
  // filter dropdown. Only PUBLISHED products come back (see
  // Docs/API-LIST-V0.md), which is correct for the public surface; the admin
  // filter dropdown therefore can't filter by a draft/archived product, an
  // accepted v0 gap (see Docs/DATA-STRUCTURE.md).
  useEffect(() => {
    publicApi
      .listProducts()
      .then((rows) => setProducts(rows.map(adaptProduct)))
      .catch(() => {
        // Public browsing degrades to an empty catalogue rather than
        // crashing the app if the backend is unreachable.
      });
  }, []);

  /**
   * Returns the freshly-adapted staff list so callers can use it immediately
   * (e.g. to resolve the just-logged-in user's managerName) - reading
   * `staffList` state right after calling setStaffList here would see the
   * stale pre-update value, since React state updates aren't synchronous.
   */
  const loadStaffAndAuditForAuthedSession = async (): Promise<StaffUser[]> => {
    try {
      const [users, audit] = await Promise.all([
        adminUsersApi.list(),
        adminAuditApi.list(),
      ]);
      const managerNameById = new Map(users.map((u) => [u.id, u.fullName]));
      const adaptedStaff = users.map((u) => adaptUser(u, managerNameById));
      setStaffList(adaptedStaff);

      const roleByActorId = new Map(adaptedStaff.map((s) => [s.id, s.role]));
      setAuditLogs(audit.map((row) => adaptAuditLog(row, roleByActorId)));

      return adaptedStaff;
    } catch {
      // Non-fatal: dashboard/inbox will just render with empty staff/audit
      // lists until the next successful fetch (e.g. permission changes).
      return [];
    }
  };

  const loadApplications = async () => {
    try {
      const result = await adminApplicationsApi.list({ pageSize: 100 });
      setApplications(result.data.map(adaptInboxRow));
    } catch {
      // Non-fatal - see loadStaffAndAuditForAuthedSession comment above.
    }
  };

  // Session restore on load: is there already a valid praxis_session cookie?
  useEffect(() => {
    authApi
      .me()
      .then(async (user) => {
        setIsAdminLoggedIn(true);
        const [staff] = await Promise.all([loadStaffAndAuditForAuthedSession(), loadApplications()]);
        const managerNameById = new Map(staff.map((s) => [s.id, s.name]));
        setCurrentUser(adaptUser(user, managerNameById));
      })
      .catch(() => {
        setIsAdminLoggedIn(false);
        setCurrentUser(null);
      })
      .finally(() => setAuthLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever the route points at a specific application's detail page,
  // fetch its full detail (notes, status history) and upsert it into local
  // state - the inbox list endpoint doesn't include that, only the detail
  // endpoint does. Keeps ApplicationDetailView's `applications.find(...)`
  // pattern working unchanged.
  useEffect(() => {
    const match = currentPath.match(/^\/admin\/applications\/([^/]+)$/);
    if (!match || !isAdminLoggedIn) return;
    const id = match[1];
    adminApplicationsApi
      .detail(id)
      .then((detail) => upsertApplication(adaptApplicationDetail(detail)))
      .catch(() => {
        // Leave whatever's already in state (e.g. the inbox row) as-is.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, isAdminLoggedIn]);

  const upsertApplication = (record: ApplicationRecord) => {
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.id === record.id);
      if (idx === -1) return [record, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], ...record };
      return next;
    });
  };

  const login = async (email: string, password: string): Promise<void> => {
    const user = await authApi.login(email, password);
    setIsAdminLoggedIn(true);
    const [staff] = await Promise.all([loadStaffAndAuditForAuthedSession(), loadApplications()]);
    const managerNameById = new Map(staff.map((s) => [s.id, s.name]));
    setCurrentUser(adaptUser(user, managerNameById));
    showToast('Login Berhasil', `Selamat datang kembali, ${user.fullName}`, 'info');
    navigate('/admin/dashboard');
  };

  const logout = () => {
    authApi.logout().catch(() => {
      /* best-effort - the cookie is httpOnly and expires on its own regardless */
    });
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setStaffList([]);
    setApplications([]);
    setAuditLogs([]);
    showToast('Sesi Berakhir', 'Anda telah keluar dari Portal Internal.', 'info');
    navigate('/admin/login');
  };

  // ---------------------------------------------------------------------
  // Public application submission - real, wired to POST /applications.
  // Requires `simulation` to have come from the real POST /simulations call
  // (i.e. carry a simulationRunId) - see SimulatorView.
  // ---------------------------------------------------------------------

  const submitApplication = async (applicant: ApplicantData, simulation: SimulationResult): Promise<string> => {
    if (!simulation.simulationRunId) {
      throw new Error('Simulasi belum dijalankan melalui server - tidak dapat mengirim pengajuan.');
    }

    const prod = products.find((p) => p.id === simulation.params.productId) || products[0];

    const result = await publicApi.submitApplication({
      productId: simulation.params.productId,
      simulationRunId: simulation.simulationRunId,
      applicant: {
        fullName: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        age: applicant.age,
        city: applicant.city,
        preferredContactTime: CONTACT_TIME_TO_BACKEND[applicant.preferredContactTime],
        notes: applicant.notes,
      },
      consent: applicant.dataConsent,
    });

    setLastSubmission({
      reference: result.referenceNo,
      submittedAt: new Date().toISOString(),
      applicant,
      simulation,
      productName: prod?.name ?? '',
    });
    showToast('Pengajuan Terkirim', `Nomor referensi: ${result.referenceNo}`, 'success');
    return result.referenceNo;
  };

  // ---------------------------------------------------------------------
  // Admin: application workflow - real, wired to Backends/
  // ---------------------------------------------------------------------

  const refreshApplicationDetail = async (appId: string) => {
    const detail = await adminApplicationsApi.detail(appId);
    upsertApplication(adaptApplicationDetail(detail));
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus, reason?: string) => {
    const action =
      status === 'Under Review'
        ? adminApplicationsApi.startReview(appId)
        : status === 'Approved'
        ? adminApplicationsApi.approve(appId)
        : adminApplicationsApi.reject(appId, reason ?? '');

    action
      .then(() => refreshApplicationDetail(appId))
      .then(() => showToast('Status Diperbarui', `Status aplikasi berhasil diubah menjadi ${status}`, 'success'))
      .catch((err: unknown) => {
        const message = err instanceof ApiError ? err.message : 'Gagal memperbarui status aplikasi.';
        showToast('Gagal Memperbarui Status', message, 'error');
      });
  };

  const assignApplication = (appId: string, staffName: string | null) => {
    const userId = staffName ? staffList.find((s) => s.name === staffName)?.id ?? null : null;

    adminApplicationsApi
      .assign(appId, userId)
      .then((detail) => upsertApplication(adaptApplicationDetail(detail)))
      .then(() =>
        showToast(
          'Penugasan Berhasil',
          staffName ? `Aplikasi ditugaskan ke ${staffName}` : 'Penugasan aplikasi dihapus',
          'info',
        ),
      )
      .catch((err: unknown) => {
        const message = err instanceof ApiError ? err.message : 'Gagal memperbarui penugasan.';
        showToast('Gagal Menugaskan', message, 'error');
      });
  };

  const addApplicationNote = (appId: string, noteText: string) => {
    if (!noteText.trim()) return;

    adminApplicationsApi
      .addNote(appId, noteText.trim())
      .then(() => refreshApplicationDetail(appId))
      .then(() => showToast('Catatan Ditambahkan', 'Catatan internal berhasil disimpan.', 'success'))
      .catch((err: unknown) => {
        const message = err instanceof ApiError ? err.message : 'Gagal menyimpan catatan.';
        showToast('Gagal Menyimpan Catatan', message, 'error');
      });
  };

  // ---------------------------------------------------------------------
  // Product CMS - still mock/local (Phase 2 wiring item): ProductCmsView's
  // edits are not yet persisted to PATCH /admin/products/:id.
  // ---------------------------------------------------------------------

  const updateProduct = (productIdOrUpdated: string | Product, partial?: Partial<Product>) => {
    let targetName = '';
    setProducts((prev) =>
      prev.map((p) => {
        if (typeof productIdOrUpdated === 'string') {
          if (p.id === productIdOrUpdated && partial) {
            targetName = partial.name || p.name;
            return { ...p, ...partial };
          }
          return p;
        } else {
          if (p.id === productIdOrUpdated.id) {
            targetName = productIdOrUpdated.name;
            return productIdOrUpdated;
          }
          return p;
        }
      })
    );
    showToast('Produk Disimpan', `Perubahan katalog untuk ${targetName || 'produk'} berhasil disimpan.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigate,
        products,
        applications,
        staffList,
        simulationRules,
        auditLogs,
        activeSimulation,
        setActiveSimulation,
        authLoading,
        isAdminLoggedIn,
        currentUser,
        login,
        logout,
        submitApplication,
        updateApplicationStatus,
        assignApplication,
        addApplicationNote,
        updateProduct,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
