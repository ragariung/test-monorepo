import React, { useEffect, useState } from 'react';
import {
  Plus,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StaffUser } from '../../types';
import { STAFF_ROLE_OPTIONS } from '../../lib/adapters';
import { BackendStaffRole } from '../../lib/api';

// Fixed, logical row order for the capability matrix - only permission
// strings actually present in the live GET /admin/users/permissions
// response are rendered, so a future unlabeled permission still shows (as
// its raw string) rather than silently disappearing.
const PERMISSION_ORDER: string[] = [
  'applications:read',
  'applications:review',
  'applications:approve',
  'applications:reject',
  'applications:assign',
  'applications:note',
  'applications:manage_lead',
  'products:read',
  'products:write',
  'products:publish',
  'simulation_rules:read',
  'simulation_rules:write',
  'users:manage',
  'organization:manage',
  'audit:read',
];

const PERMISSION_LABELS: Record<string, string> = {
  'applications:read': 'Lihat Aplikasi & Prospek',
  'applications:review': 'Mulai Peninjauan (Under Review)',
  'applications:approve': 'Persetujuan Aplikasi (Approve)',
  'applications:reject': 'Penolakan Aplikasi (Reject)',
  'applications:assign': 'Penugasan Aplikasi ke Staff',
  'applications:note': 'Tambah Catatan Internal',
  'applications:manage_lead': 'Kelola Prospek (Edit / Konversi / Tolak)',
  'products:read': 'Lihat Produk',
  'products:write': 'Edit Konten Produk (CMS)',
  'products:publish': 'Publikasi / Arsip Produk',
  'simulation_rules:read': 'Lihat Aturan Simulasi',
  'simulation_rules:write': 'Ubah Aturan Tarif & Rumus Aktuaria',
  'users:manage': 'Kelola Akun & Hak Akses Tim',
  'organization:manage': 'Ubah Struktur Hierarki Organisasi',
  'audit:read': 'Akses Audit Trail Lengkap',
};

interface TreeNode {
  staff: StaffUser;
  children: TreeNode[];
}

function buildStaffTree(staffList: StaffUser[]): TreeNode[] {
  const byId = new Set(staffList.map((s) => s.id));
  const childrenByManagerId = new Map<string, StaffUser[]>();
  const roots: StaffUser[] = [];

  for (const s of staffList) {
    if (s.managerId && byId.has(s.managerId)) {
      const list = childrenByManagerId.get(s.managerId) ?? [];
      list.push(s);
      childrenByManagerId.set(s.managerId, list);
    } else {
      roots.push(s);
    }
  }

  const build = (s: StaffUser): TreeNode => ({
    staff: s,
    children: (childrenByManagerId.get(s.id) ?? []).map(build),
  });

  return roots.map(build);
}

const TreeNodeView: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
  const { staff, children } = node;
  const initials = staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2);
  const isRoot = depth === 0;

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-6' : ''}>
      <div
        className={
          isRoot
            ? 'p-5 rounded-[24px] bg-[#0A2B33] text-white space-y-1.5 shadow-soft border border-white/10'
            : 'p-4 rounded-2xl bg-white border border-gray-100 shadow-soft space-y-1.5 hover:border-gray-200 transition-all'
        }
      >
        <div
          className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
            isRoot ? 'text-emerald-400' : 'text-gray-400'
          }`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                isRoot ? 'bg-white/15 text-white' : 'bg-[#E6F0F1] text-[#0F4C5C]'
              }`}
            >
              {initials}
            </span>
            {staff.role}
          </span>
          {!staff.isActive && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono text-[10px]">Nonaktif</span>
          )}
        </div>
        <div className={isRoot ? 'text-base font-extrabold text-white' : 'text-sm font-bold text-[#111827]'}>
          {staff.name}
        </div>
        <div className={isRoot ? 'text-xs text-slate-300' : 'text-xs text-gray-500'}>
          {staff.email} • {staff.department || 'Tanpa departemen'}
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-3.5 space-y-3.5">
          {children.map((child) => (
            <TreeNodeView key={child.staff.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationView: React.FC = () => {
  const { staffList, showToast, createStaffUser, updateStaffManager, fetchRolePermissions } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'hierarchy' | 'matrix'>('users');

  // Invite Employee modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: STAFF_ROLE_OPTIONS[0][0] as BackendStaffRole,
    department: '',
    managerId: '',
    password: '',
  });

  // Permission matrix state (fetched lazily, once, when that tab is opened)
  const [matrix, setMatrix] = useState<Record<string, string[]> | null>(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);

  useEffect(() => {
    if (activeTab === 'matrix' && !matrix && !isLoadingMatrix) {
      setIsLoadingMatrix(true);
      fetchRolePermissions()
        .then(setMatrix)
        .catch(() => showToast('Gagal Memuat Matriks', 'Tidak dapat memuat matriks hak akses dari server.', 'error'))
        .finally(() => setIsLoadingMatrix(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleInvite = () => {
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim() || inviteForm.password.length < 8) return;
    setIsInviting(true);
    createStaffUser({
      email: inviteForm.email.trim(),
      fullName: inviteForm.fullName.trim(),
      role: inviteForm.role,
      department: inviteForm.department.trim() || undefined,
      managerId: inviteForm.managerId || null,
      password: inviteForm.password,
    })
      .then(() => {
        setIsInviteModalOpen(false);
        setInviteForm({ fullName: '', email: '', role: STAFF_ROLE_OPTIONS[0][0], department: '', managerId: '', password: '' });
      })
      .catch(() => {})
      .finally(() => setIsInviting(false));
  };

  const handleManagerChange = (staffId: string, managerId: string) => {
    updateStaffManager(staffId, managerId || null).catch(() => {});
  };

  const roots = buildStaffTree(staffList);
  const presentPermissions = matrix
    ? PERMISSION_ORDER.filter((p) => Object.values(matrix).some((granted: string[]) => granted.includes(p)))
    : [];

  return (
    <AdminLayout
      activeNav="organization"
      title="Organisasi, Peran & Hierarki Tim"
      subtitle="Kelola akun internal, struktur manajerial underwriting, dan matriks wewenang persetujuan."
      action={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Undang Karyawan Baru
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Navigation Sub-Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === 'users'
                  ? 'border-[#0F4C5C] text-[#0F4C5C]'
                  : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              Daftar Karyawan ({staffList.length})
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`pb-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === 'hierarchy'
                  ? 'border-[#0F4C5C] text-[#0F4C5C]'
                  : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              Pohon Hierarki Manajerial
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`pb-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === 'matrix'
                  ? 'border-[#0F4C5C] text-[#0F4C5C]'
                  : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              Matriks Hak Akses & Wewenang
            </button>
          </div>
        </div>

        {/* TAB 1: USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                  <th className="py-4 px-5">Nama Karyawan</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Peran (Role)</th>
                  <th className="py-4 px-5">Departemen</th>
                  <th className="py-4 px-5">Atasan Langsung (Manager)</th>
                  <th className="py-4 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#111827] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E6F0F1] text-[#0F4C5C] font-extrabold text-xs flex items-center justify-center border border-[#0F4C5C]/20">
                        {staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 font-mono text-[11px]">
                      {staff.email}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F8FAFB] text-[#111827] border border-gray-200">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500">{staff.department || '-'}</td>
                    <td className="py-4 px-5 font-medium text-[#111827]">
                      <select
                        value={staff.managerId ?? ''}
                        onChange={(e) => handleManagerChange(staff.id, e.target.value)}
                        className="text-xs font-medium bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer -ml-2"
                      >
                        <option value="">Kepala Divisi (Top-Level)</option>
                        {staffList
                          .filter((s) => s.id !== staff.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                      </select>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 font-bold bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Nonaktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: HIERARCHY TREE */}
        {activeTab === 'hierarchy' && (
          <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-soft space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Struktur Komando Underwriting & Tele-Sales</h3>
              <p className="text-xs text-gray-400 mt-1">
                Dibangun langsung dari hubungan atasan-bawahan setiap karyawan - ubah di tab "Daftar Karyawan" untuk memperbarui pohon ini.
              </p>
            </div>

            {roots.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada data karyawan.</p>
            ) : (
              <div className="space-y-6 max-w-xl pl-2">
                {roots.map((root) => (
                  <TreeNodeView key={root.staff.id} node={root} depth={0} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERMISSION MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#111827]">Matriks Hak Akses Berdasarkan Peran (RBAC)</h3>
              <p className="text-xs text-gray-400 mt-1">
                Dibaca langsung dari role-permissions.ts di server (GET /admin/users/permissions) - bukan salinan statis.
              </p>
            </div>

            {isLoadingMatrix ? (
              <div className="p-10 flex items-center justify-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !matrix ? (
              <p className="p-5 text-xs text-gray-400">Gagal memuat data matriks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                      <th className="py-4 px-5">Kapabilitas Sistem</th>
                      {STAFF_ROLE_OPTIONS.map(([backendRole, label]) => (
                        <th key={backendRole} className="py-4 px-5 text-center whitespace-nowrap">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {presentPermissions.map((perm) => (
                      <tr key={perm} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5 font-bold text-[#111827]">{PERMISSION_LABELS[perm] ?? perm}</td>
                        {STAFF_ROLE_OPTIONS.map(([backendRole]) => {
                          const granted = matrix[backendRole] ?? [];
                          const has = granted.includes('*') || granted.includes(perm);
                          return (
                            <td key={backendRole} className="py-3.5 px-5 text-center">
                              {has ? (
                                <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                              ) : (
                                <X className="w-4 h-4 text-gray-300 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INVITE EMPLOYEE MODAL */}
      {isInviteModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsInviteModalOpen(false)}
          title="Undang Karyawan Baru"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Nama Lengkap</label>
              <input
                type="text"
                value={inviteForm.fullName}
                onChange={(e) => setInviteForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Email</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Peran (Role)</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as BackendStaffRole }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
                >
                  {STAFF_ROLE_OPTIONS.map(([backendRole, label]) => (
                    <option key={backendRole} value={backendRole}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Departemen</label>
                <input
                  type="text"
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Atasan Langsung (opsional)</label>
              <select
                value={inviteForm.managerId}
                onChange={(e) => setInviteForm((f) => ({ ...f, managerId: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
              >
                <option value="">Kepala Divisi (Top-Level)</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Password Sementara (min. 8 karakter)</label>
              <input
                type="text"
                value={inviteForm.password}
                onChange={(e) => setInviteForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Karyawan dapat mengganti setelah login pertama"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsInviteModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#0F4C5C]"
                disabled={isInviting || !inviteForm.fullName.trim() || !inviteForm.email.trim() || inviteForm.password.length < 8}
                onClick={handleInvite}
              >
                {isInviting ? 'Menyimpan...' : 'Tambahkan Karyawan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
