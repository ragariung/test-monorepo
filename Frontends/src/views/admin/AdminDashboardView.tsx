import React from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  UserX, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusChip } from '../../components/common/StatusChip';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';

export const AdminDashboardView: React.FC = () => {
  const { applications, currentUser, auditLogs, navigate } = useApp();

  // Calculate summary counts
  const submittedCount = applications.filter((a) => a.status === 'Submitted').length;
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const assignedToMeCount = applications.filter(
    (a) => currentUser && a.assignedTo === currentUser.name
  ).length;

  const unassignedCount = applications.filter((a) => !a.assignedTo).length;

  const recentApplications = applications.slice(0, 5);
  const recentAudit = auditLogs.slice(0, 6);

  return (
    <AdminLayout
      activeNav="dashboard"
      title="Ringkasan Operasional & Pengajuan"
      subtitle="Pantau volume aplikasi masuk, antrean underwriting, dan performa penugasan tim."
      action={
        <Button
          id="dashboard-goto-inbox"
          variant="primary"
          size="sm"
          icon={<Inbox className="w-4 h-4" />}
          onClick={() => navigate('/admin/applications')}
        >
          Buka Kotak Masuk Aplikasi ({applications.length})
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 6 SUMMARY COUNT WIDGETS (EXPLICIT PROMPT REQUIREMENT) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Submitted */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">Baru Masuk</span>
              <Inbox className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-3 font-mono">{submittedCount}</div>
            <div className="text-[11px] text-blue-700 font-bold mt-1">Submitted</div>
          </div>

          {/* 2. Under Review */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">Sedang Ditinjau</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-3 font-mono">{underReviewCount}</div>
            <div className="text-[11px] text-amber-700 font-bold mt-1">Under Review</div>
          </div>

          {/* 3. Approved */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">Disetujui</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-3 font-mono">{approvedCount}</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">Approved</div>
          </div>

          {/* 4. Rejected */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">Ditolak</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-3 font-mono">{rejectedCount}</div>
            <div className="text-[11px] text-rose-700 font-bold mt-1">Rejected</div>
          </div>

          {/* 5. Assigned to me */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-[#E6F0F1] p-5 rounded-[24px] border border-[#0F4C5C]/20 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-[#0F4C5C]">
              <span className="font-bold">Tugas Saya</span>
              <UserCheck className="w-4 h-4 text-[#0F4C5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0F4C5C] mt-3 font-mono">{assignedToMeCount}</div>
            <div className="text-[11px] text-[#0F4C5C] font-bold mt-1">
              {currentUser?.name.split(' ')[0] || 'Saya'}
            </div>
          </div>

          {/* 6. Unassigned */}
          <div 
            onClick={() => navigate('/admin/applications')}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold">Belum Ditugaskan</span>
              <UserX className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-3 font-mono">{unassignedCount}</div>
            <div className="text-[11px] text-gray-500 font-bold mt-1">Unassigned Leads</div>
          </div>
        </div>

        {/* 2-Column Section: Recent Applications Table & Status Transition Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Applications */}
          <div className="lg:col-span-8 bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Aplikasi Masuk Terbaru</h3>
                <p className="text-xs text-gray-500 mt-0.5">Pengajuan calon nasabah via website publik</p>
              </div>
              <button
                onClick={() => navigate('/admin/applications')}
                className="text-xs font-bold text-[#0F4C5C] hover:text-[#0A333E] flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Seluruh Tabel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                    <th className="py-3.5 px-5">Ref ID</th>
                    <th className="py-3.5 px-5">Pemohon</th>
                    <th className="py-3.5 px-5">Produk</th>
                    <th className="py-3.5 px-5">Uang Pertanggungan</th>
                    <th className="py-3.5 px-5">Estimasi Premi</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                  {recentApplications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/admin/applications/${app.id}`)}
                      className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-[#0F4C5C]">
                        {app.reference}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#111827]">{app.applicant.fullName}</div>
                        <div className="text-[11px] text-gray-400">{app.applicant.city}</div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#111827] truncate max-w-[150px]">
                        {app.productSnapshot.name}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-[#111827]">
                        {formatIDR(app.simulation.params.sumAssured)}
                      </td>
                      <td className="py-4 px-5 font-mono font-extrabold text-[#0F4C5C]">
                        {formatIDR(app.simulation.monthlyPremium)}
                        <span className="text-[10px] text-gray-400 font-sans ml-1">/bln</span>
                      </td>
                      <td className="py-4 px-5">
                        <StatusChip status={app.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recent Status Transitions Audit Log */}
          <div className="lg:col-span-4 bg-white rounded-[28px] border border-gray-100 shadow-soft p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Aktivitas & Transisi Status</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Audit trail real-time operasional</p>
              </div>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4">
              {recentAudit.map((log) => (
                <div key={log.id} className="text-xs space-y-1.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-gray-400 text-[10px]">
                    <span className="font-mono text-gray-500 font-medium">{log.timestamp}</span>
                    <span className="bg-[#F8FAFB] px-2 py-0.5 rounded-full font-mono text-[#0F4C5C] font-bold border border-gray-100">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-[#111827] font-semibold leading-snug">
                    {log.description}
                  </p>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <span>Oleh: <strong className="text-gray-700">{log.actor}</strong></span>
                    <span>•</span>
                    <span>{log.actorRole}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/admin/audit')}
              className="w-full text-center text-xs font-bold text-[#0F4C5C] hover:underline pt-2 border-t border-gray-100 cursor-pointer block"
            >
              Lihat Seluruh Log Audit Trail →
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
