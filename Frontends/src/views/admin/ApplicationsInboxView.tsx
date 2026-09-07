import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Download,
  Calendar,
  Eye,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusChip } from '../../components/common/StatusChip';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';
import { ApplicationRecord, ApplicationStatus } from '../../types';
import { adminApplicationsApi } from '../../lib/api';
import { adaptApplicationDetail } from '../../lib/adapters';
import { downloadCsv } from '../../lib/csv';

export const ApplicationsInboxView: React.FC = () => {
  const { applications, products, staffList, navigate, showToast } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant.phone.includes(searchQuery);

      const matchStatus = selectedStatus === 'all' || app.status === selectedStatus;
      const matchProduct = selectedProduct === 'all' || app.productSnapshot.id === selectedProduct;
      const matchOwner =
        selectedOwner === 'all'
          ? true
          : selectedOwner === 'unassigned'
          ? !app.assignedTo
          : app.assignedTo === selectedOwner;

      return matchSearch && matchStatus && matchProduct && matchOwner;
    });
  }, [applications, searchQuery, selectedStatus, selectedProduct, selectedOwner]);

  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedProduct('all');
    setSelectedOwner('all');
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    if (filteredApplications.length === 0) {
      showToast('Tidak Ada Data', 'Tidak ada aplikasi yang cocok dengan filter saat ini untuk diekspor.', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      // The inbox list doesn't carry sum assured / premium (only the detail
      // endpoint does - see Docs/DATA-STRUCTURE.md §3), so re-fetch full
      // detail per row to make sure the export has real, follow-up-usable
      // figures rather than the placeholder zeros shown in the table.
      const enriched: ApplicationRecord[] = await Promise.all(
        filteredApplications.map((app) =>
          adminApplicationsApi
            .detail(app.id)
            .then(adaptApplicationDetail)
            .catch(() => app),
        ),
      );

      const headers = [
        'Referensi',
        'Tanggal Masuk',
        'Nama Pemohon',
        'Email',
        'Telepon',
        'Kota',
        'Produk Asuransi',
        'Uang Pertanggungan (IDR)',
        'Estimasi Premi Bulanan (IDR)',
        'Estimasi Premi Tahunan (IDR)',
        'Status',
        'Penugasan (Owner)',
        'Update Terakhir',
      ];

      const rows = enriched.map((app) => [
        app.reference,
        app.submittedAt,
        app.applicant.fullName,
        app.applicant.email,
        app.applicant.phone,
        app.applicant.city,
        app.productSnapshot.name,
        app.simulation.params.sumAssured,
        app.simulation.monthlyPremium,
        app.simulation.annualPremium,
        app.status,
        app.assignedTo || 'Belum Ditugaskan',
        app.lastUpdated,
      ]);

      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`praxis-aplikasi-${dateStamp}.csv`, headers, rows);
      showToast('Ekspor Berhasil', `${enriched.length} baris aplikasi berhasil diunduh (CSV).`, 'success');
    } catch {
      showToast('Ekspor Gagal', 'Terjadi kesalahan saat mengambil data untuk ekspor.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout
      activeNav="applications"
      title="Kotak Masuk Aplikasi Asuransi"
      subtitle="Kelola antrean pengajuan calon nasabah, verifikasi awal, dan penugasan underwriting."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportCSV}
        >
          Ekspor Data (CSV)
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-6 shadow-soft space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Ref ID, Nama, No HP..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] cursor-pointer transition-all"
              >
                <option value="all">Semua Status (All)</option>
                <option value="Submitted">Submitted (Baru Masuk)</option>
                <option value="Under Review">Under Review (Sedang Ditinjau)</option>
                <option value="Approved">Approved (Disetujui)</option>
                <option value="Rejected">Rejected (Ditolak)</option>
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] cursor-pointer transition-all"
              >
                <option value="all">Semua Produk Asuransi</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Filter */}
            <div>
              <select
                value={selectedOwner}
                onChange={(e) => {
                  setSelectedOwner(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] cursor-pointer transition-all"
              >
                <option value="all">Semua Penugasan Staff</option>
                <option value="unassigned">Belum Ditugaskan (Unassigned)</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Status summary & Reset */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div>
              Menampilkan <strong className="text-[#111827] font-bold">{filteredApplications.length}</strong> aplikasi ditemukan
            </div>
            {(searchQuery || selectedStatus !== 'all' || selectedProduct !== 'all' || selectedOwner !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                  <th className="py-4 px-5">Ref ID</th>
                  <th className="py-4 px-5">Tgl Masuk</th>
                  <th className="py-4 px-5">Nama Pemohon</th>
                  <th className="py-4 px-5">Produk Asuransi</th>
                  <th className="py-4 px-5">Uang Pertanggungan</th>
                  <th className="py-4 px-5">Estimasi Premi</th>
                  <th className="py-4 px-5">Penugasan (Owner)</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Update Terakhir</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {paginatedApps.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-14 text-center text-gray-400">
                      Tidak ada aplikasi yang cocok dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/admin/applications/${app.id}`)}
                      className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-[#0F4C5C]">
                        {app.reference}
                      </td>
                      <td className="py-4 px-5 text-gray-400 whitespace-nowrap">
                        {app.submittedAt}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#111827]">{app.applicant.fullName}</div>
                        <div className="text-[11px] text-gray-400">{app.applicant.phone}</div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#111827]">
                        {app.productSnapshot.name}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-[#111827]">
                        {formatIDR(app.simulation.params.sumAssured)}
                      </td>
                      <td className="py-4 px-5 font-mono font-extrabold text-[#0F4C5C] whitespace-nowrap">
                        {formatIDR(app.simulation.monthlyPremium)}
                        <span className="text-[10px] text-gray-400 font-sans ml-1">/bln</span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {app.assignedTo ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#111827]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {app.assignedTo}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <StatusChip status={app.status} size="sm" />
                      </td>
                      <td className="py-4 px-5 text-gray-400 text-[11px] whitespace-nowrap">
                        {app.lastUpdated}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 rounded-xl hover:bg-[#E6F0F1] hover:text-[#0F4C5C]"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/applications/${app.id}`);
                          }}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Controls */}
          <div className="p-4 border-t border-gray-100 bg-[#F8FAFB] flex items-center justify-between text-xs text-gray-500">
            <div>
              Halaman <strong className="text-[#111827]">{currentPage}</strong> dari <strong className="text-[#111827]">{totalPages}</strong> (Total {filteredApplications.length} baris)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 rounded-xl"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 rounded-xl"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
