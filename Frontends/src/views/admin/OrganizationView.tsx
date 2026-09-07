import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  GitFork, 
  Check, 
  X, 
  Plus, 
  Mail, 
  Briefcase, 
  Building2,
  Lock,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/common/Button';
import { StaffUser } from '../../types';

export const OrganizationView: React.FC = () => {
  const { staffList, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'hierarchy' | 'matrix'>('users');

  // Permission capabilities matrix definition
  const roleCapabilities = [
    { capability: 'Lihat Seluruh Aplikasi Masuk', underwriter: true, senior: true, manager: true, tele: true, admin: true },
    { capability: 'Mulai Peninjauan (Under Review)', underwriter: true, senior: true, manager: true, tele: false, admin: true },
    { capability: 'Persetujuan Aplikasi (Approve)', underwriter: false, senior: true, manager: true, tele: false, admin: true },
    { capability: 'Penolakan Aplikasi (Reject)', underwriter: false, senior: true, manager: true, tele: false, admin: true },
    { capability: 'Edit Konten Produk (CMS)', underwriter: false, senior: false, manager: true, tele: false, admin: true },
    { capability: 'Ubah Aturan Tarif & Rumus Aktuaria', underwriter: false, senior: false, manager: true, tele: false, admin: true },
    { capability: 'Kelola Akun & Hak Akses Tim', underwriter: false, senior: false, manager: false, tele: false, admin: true },
    { capability: 'Akses Audit Trail Lengkap', underwriter: true, senior: true, manager: true, tele: false, admin: true },
  ];

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
          onClick={() => {
            showToast('Tambah Karyawan', 'Formulir integrasi HRIS Active Directory internal.', 'info');
          }}
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
                    <td className="py-4 px-5 text-gray-500">{staff.department}</td>
                    <td className="py-4 px-5 font-medium text-[#111827]">
                      {staff.managerName || (
                        <span className="text-gray-400 italic">Kepala Divisi (Top-Level)</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Aktif
                      </span>
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
                Pengalihan dan eskalasi aplikasi asuransi mengikuti hierarki terstruktur berikut.
              </p>
            </div>

            {/* Tree visualization */}
            <div className="space-y-4 max-w-xl pl-2">
              {/* Root Level: Head / Manager */}
              <div className="p-5 rounded-[24px] bg-[#0A2B33] text-white space-y-1.5 shadow-soft border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span>Head of Underwriting & Operations</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px]">Tier 1</span>
                </div>
                <div className="text-base font-extrabold text-white">Bambang Soedirman</div>
                <div className="text-xs text-slate-300">bambang.soedirman@praxis.co.id • Underwriting Manager</div>
              </div>

              {/* Connector line */}
              <div className="w-px h-6 bg-gray-200 ml-6"></div>

              {/* Subordinates Grid */}
              <div className="ml-6 space-y-3.5 border-l-2 border-gray-200 pl-6">
                {/* Senior Underwriter */}
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-soft space-y-1.5 hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase">
                    <span>Senior Level Underwriter</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">Limit Rp 5 Miliar</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">Sarah Wijaya</div>
                  <div className="text-xs text-gray-500">sarah.wijaya@praxis.co.id • Review & Approval Mandate</div>
                </div>

                {/* Junior Underwriter */}
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-soft space-y-1.5 hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase">
                    <span>Staff Underwriter</span>
                    <span className="text-[10px] text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200 font-bold">Limit Rp 1 Miliar</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">Bobby Pratama</div>
                  <div className="text-xs text-gray-500">bobby.pratama@praxis.co.id • Triage & Medical Verification</div>
                </div>

                {/* Tele-Consultant */}
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-soft space-y-1.5 hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase">
                    <span>Customer Relationship & Tele-Advisor</span>
                    <span className="text-[10px] text-[#0F4C5C] bg-[#E6F0F1] px-2.5 py-0.5 rounded-full border border-[#0F4C5C]/20 font-bold">Customer Contact</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">Dewi Anggraeni</div>
                  <div className="text-xs text-gray-500">dewi.anggraeni@praxis.co.id • Tele-Consultant (Outreach)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERMISSION MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#111827]">Matriks Hak Akses Berdasarkan Peran (RBAC)</h3>
              <p className="text-xs text-gray-400 mt-1">
                Pemisahan tugas (Separation of Duties) sesuai standar kepatuhan tata kelola asuransi OJK.
              </p>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                  <th className="py-4 px-5">Kapabilitas Sistem</th>
                  <th className="py-4 px-5 text-center">Underwriter</th>
                  <th className="py-4 px-5 text-center">Senior Underwriter</th>
                  <th className="py-4 px-5 text-center">Manager</th>
                  <th className="py-4 px-5 text-center">Tele-Consultant</th>
                  <th className="py-4 px-5 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {roleCapabilities.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#111827]">{item.capability}</td>
                    <td className="py-3.5 px-5 text-center">
                      {item.underwriter ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {item.senior ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {item.manager ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {item.tele ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {item.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
