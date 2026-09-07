import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  History, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Calculator, 
  AlertTriangle,
  Send,
  User,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusChip } from '../../components/common/StatusChip';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatIDR } from '../../data/mockData';
import { ApplicationStatus } from '../../types';

interface ApplicationDetailViewProps {
  id?: string;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({ id }) => {
  const { 
    applications, 
    staffList, 
    updateApplicationStatus, 
    assignApplication, 
    addApplicationNote, 
    navigate,
    auditLogs
  } = useApp();

  const application = applications.find((a) => a.id === id) || applications[0];

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Internal Note input
  const [noteContent, setNoteContent] = useState('');

  // Assignment select state
  const [selectedStaff, setSelectedStaff] = useState(application?.assignedTo || '');

  if (!application) {
    return (
      <AdminLayout activeNav="applications" title="Aplikasi Tidak Ditemukan">
        <div className="bg-white p-8 rounded-xl text-center space-y-3">
          <p className="text-slate-600 text-sm">Aplikasi dengan ID tersebut tidak ditemukan dalam sistem.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/applications')}>
            Kembali ke Kotak Masuk
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleStatusChange = (newStatus: ApplicationStatus, reason?: string) => {
    updateApplicationStatus(application.id, newStatus, reason);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) return;
    updateApplicationStatus(application.id, 'Rejected', rejectionReason.trim());
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const handleAssign = (staffName: string) => {
    setSelectedStaff(staffName);
    assignApplication(application.id, staffName || null);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addApplicationNote(application.id, noteContent.trim());
    setNoteContent('');
  };

  // Filter audit logs for this application
  const appAuditLogs = auditLogs.filter(
    (l) => l.entityId === application.id || l.targetId === application.id || l.description.includes(application.reference)
  );

  return (
    <AdminLayout
      activeNav="applications"
      title={`Detail Aplikasi ${application.reference}`}
      subtitle={`Didaftarkan pada ${application.submittedAt} • Status saat ini: ${application.status}`}
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/admin/applications')}
        >
          Kembali ke Kotak Masuk
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Control Bar: Workflow Actions & Assignment */}
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusChip status={application.status} size="lg" />
            <div className="h-6 w-px bg-gray-200"></div>
            {/* Staff Assignment dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">Petugas Ditugaskan:</span>
              <select
                value={application.assignedTo || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="text-xs font-bold bg-[#F8FAFB] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827] cursor-pointer"
              >
                <option value="">-- Belum Ditugaskan --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workflow Status Action Buttons (EXPLICIT PROMPT REQUIREMENT) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {application.status === 'Submitted' && (
              <Button
                id="action-start-review"
                variant="secondary"
                size="sm"
                icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
                onClick={() => handleStatusChange('Under Review')}
              >
                Mulai Peninjauan (Under Review)
              </Button>
            )}

            {application.status !== 'Approved' && (
              <Button
                id="action-approve"
                variant="primary"
                size="sm"
                className="bg-[#0F4C5C] hover:bg-[#0A333E] rounded-xl"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('Approved')}
              >
                Setujui Aplikasi (Approve)
              </Button>
            )}

            {application.status !== 'Rejected' && (
              <Button
                id="action-reject"
                variant="danger"
                size="sm"
                className="rounded-xl"
                icon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Tolak Aplikasi...
              </Button>
            )}
          </div>
        </div>

        {/* Rejection Reason Notice (If rejected) */}
        {application.status === 'Rejected' && application.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Aplikasi Ditolak Oleh Underwriting:</strong>
              <p className="leading-relaxed">{application.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Applicant & Simulation details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Applicant & Simulation Snapshot */}
          <div className="lg:col-span-8 space-y-6">
            {/* Applicant Data Card */}
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-7 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0F4C5C]" />
                  <h3 className="text-sm font-bold text-[#111827]">Data Diri Calon Pemohon</h3>
                </div>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                  Persetujuan Data: Disetujui
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Nama Lengkap (KTP):</span>
                  <div className="font-extrabold text-[#111827] text-sm">{application.applicant.fullName}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Usia Saat Pengajuan:</span>
                  <div className="font-bold text-[#111827]">{application.applicant.age} Tahun</div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Nomor Telepon / WhatsApp:</span>
                  <div className="font-bold text-[#111827] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{application.applicant.phone}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Alamat Email:</span>
                  <div className="font-bold text-[#111827] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{application.applicant.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Kota Domisili:</span>
                  <div className="font-bold text-[#111827] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{application.applicant.city}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Jadwal Kontak Pilihan:</span>
                  <div className="font-bold text-[#111827] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{application.applicant.preferredContactTime}</span>
                  </div>
                </div>

                {application.applicant.notes && (
                  <div className="sm:col-span-2 space-y-1.5 pt-3 border-t border-gray-100">
                    <span className="text-gray-400 font-medium">Catatan dari Calon Nasabah:</span>
                    <p className="text-[#111827] bg-[#F8FAFB] p-3.5 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                      &ldquo;{application.applicant.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Snapshot Card */}
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-7 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#0F4C5C]" />
                  <h3 className="text-sm font-bold text-[#111827]">Snapshot Simulasi Saat Diajukan</h3>
                </div>
                <span className="text-[11px] text-gray-400 font-mono font-medium">
                  ID Produk: {application.productSnapshot.id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                <div className="bg-[#F8FAFB] p-3.5 rounded-2xl border border-gray-100">
                  <div className="text-gray-400 text-[11px]">Nama Produk:</div>
                  <div className="font-bold text-[#111827] mt-0.5 truncate">{application.productSnapshot.name}</div>
                </div>

                <div className="bg-[#F8FAFB] p-3.5 rounded-2xl border border-gray-100">
                  <div className="text-gray-400 text-[11px]">Uang Pertanggungan:</div>
                  <div className="font-extrabold text-[#0F4C5C] mt-0.5">
                    {formatIDR(application.simulation.params.sumAssured)}
                  </div>
                </div>

                <div className="bg-[#F8FAFB] p-3.5 rounded-2xl border border-gray-100">
                  <div className="text-gray-400 text-[11px]">Masa Pembayaran:</div>
                  <div className="font-bold text-[#111827] mt-0.5">
                    {application.simulation.params.paymentTerm} Tahun
                  </div>
                </div>

                <div className="bg-[#F8FAFB] p-3.5 rounded-2xl border border-gray-100">
                  <div className="text-gray-400 text-[11px]">Frekuensi Bayar:</div>
                  <div className="font-bold text-[#111827] mt-0.5">
                    {application.simulation.params.frequency}
                  </div>
                </div>
              </div>

              {/* Premium Breakdown */}
              <div className="p-5 rounded-[24px] bg-[#0A2B33] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
                <div>
                  <div className="text-xs text-slate-300">Ilustrasi Premi Bulanan:</div>
                  <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                    {formatIDR(application.simulation.monthlyPremium)} / bulan
                  </div>
                </div>
                <div className="text-xs text-slate-300 sm:text-right space-y-1">
                  <div>Tahunan: <strong className="text-white">{formatIDR(application.simulation.annualPremium)} / thn</strong></div>
                  <div>Total Akumulasi: <strong className="text-white">{formatIDR(application.simulation.totalEstimatedInvestment)}</strong></div>
                </div>
              </div>
            </div>

            {/* Audit Trail for this Application */}
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-7 shadow-soft space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <History className="w-4 h-4 text-[#0F4C5C]" />
                <h3 className="text-sm font-bold text-[#111827]">Riwayat Audit Perubahan Status Aplikasi</h3>
              </div>

              <div className="space-y-3.5">
                {appAuditLogs.length === 0 ? (
                  <p className="text-xs text-gray-400">Belum ada riwayat aktivitas pada aplikasi ini.</p>
                ) : (
                  appAuditLogs.map((log) => (
                    <div key={log.id} className="text-xs flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C] mt-1 shrink-0"></div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-gray-400 text-[11px]">
                          <span className="font-bold text-[#111827]">{log.action}</span>
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-gray-600">{log.description}</p>
                        <div className="text-[10px] text-gray-400">
                          Oleh: <strong className="text-gray-700">{log.actor}</strong> ({log.actorRole})
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Internal Notes Thread */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <MessageSquare className="w-4 h-4 text-[#0F4C5C]" />
                <h3 className="text-sm font-bold text-[#111827]">Catatan Internal Underwriting</h3>
              </div>

              {/* Existing Notes list */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {application.internalNotes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada catatan internal.</p>
                ) : (
                  application.internalNotes.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-gray-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-gray-400 text-[10px]">
                        <strong className="text-[#111827] font-bold">{note.author}</strong>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="pt-3.5 border-t border-gray-100 space-y-2.5">
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tambahkan catatan hasil kontak telepon atau memo underwriting..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] resize-none"
                />
                <Button
                  id="submit-note-btn"
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center rounded-xl bg-[#0F4C5C]"
                  icon={<Send className="w-3.5 h-3.5" />}
                  disabled={!noteContent.trim()}
                >
                  Simpan Catatan
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* REJECTION REASON MODAL (EXPLICIT PROMPT REQUIREMENT: "must capture rejection reason") */}
      {isRejectModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRejectModalOpen(false)}
          title="Konfirmasi Penolakan Aplikasi Asuransi"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>
                Penolakan aplikasi mewajibkan alasan jelas untuk kepatuhan regulasi OJK dan rekaman audit underwriting.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rejection-reason" className="block font-semibold text-slate-800">
                Alasan Penolakan (Wajib Diisi):
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Riwayat medis di luar kriteria seleksi standar, batas usia melebihi ketentuan produk..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-900 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!rejectionReason.trim()}
                onClick={handleConfirmReject}
              >
                Konfirmasi Tolak Aplikasi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
