import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/common/Button';

export const AuditLogView: React.FC = () => {
  const { auditLogs, showToast, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchAction = selectedAction === 'all' || log.action === selectedAction;

      return matchSearch && matchAction;
    });
  }, [auditLogs, searchQuery, selectedAction]);

  const handleExport = () => {
    showToast('Ekspor Audit Trail', 'Mengunduh log audit kepatuhan OJK (JSON/CSV)', 'info');
  };

  const actionTypes = Array.from(new Set(auditLogs.map((l) => l.action)));

  return (
    <AdminLayout
      activeNav="audit"
      title="Catatan Audit Sistem (Immutable Audit Trail)"
      subtitle="Rekaman jejak aktivitas sistem yang bersifat append-only untuk kepatuhan regulasi OJK & tata kelola internal."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExport}
        >
          Ekspor Log Audit
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Compliance Notice Banner */}
        <div className="bg-[#0A2B33] text-white p-5 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <span className="text-slate-300">
              Seluruh transisi status aplikasi, perubahan penugasan, dan pembaruan aturan aktuaria dicatat secara permanen dengan stempel waktu tersinkronisasi NTP.
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-white/10 px-3 py-1 rounded-full shrink-0 font-bold border border-white/10">
            Kepatuhan POJK No. 69/2016
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari deskripsi, aktor, atau target ID..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] transition-all"
              />
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827] cursor-pointer font-medium"
            >
              <option value="all">Semua Tipe Aksi</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 shrink-0">
            Menampilkan <strong className="text-[#111827] font-bold">{filteredLogs.length}</strong> dari {auditLogs.length} peristiwa
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                  <th className="py-4 px-5">Stempel Waktu</th>
                  <th className="py-4 px-5">Tipe Aksi</th>
                  <th className="py-4 px-5">Aktor Pelaksana</th>
                  <th className="py-4 px-5">Peran</th>
                  <th className="py-4 px-5">Deskripsi Peristiwa</th>
                  <th className="py-4 px-5 text-right">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB] font-mono text-[11px] transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap text-gray-400">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#E6F0F1] text-[#0F4C5C] font-bold border border-[#0F4C5C]/15">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-sans font-bold text-[#111827] whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-4 px-5 font-sans text-gray-500 whitespace-nowrap">
                      {log.actorRole}
                    </td>
                    <td className="py-4 px-5 font-sans text-gray-700 max-w-md font-medium leading-relaxed">
                      {log.description}
                    </td>
                    <td className="py-4 px-5 text-right text-gray-400 whitespace-nowrap">
                      {log.entityId || log.targetId ? (
                        <span className="text-[#0F4C5C] font-bold">{log.entityId || log.targetId}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
