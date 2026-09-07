import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  PhoneCall, 
  Download, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { downloadApplicationReceiptPdf } from '../../lib/receipt-pdf';

interface SuccessViewProps {
  reference?: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ reference }) => {
  const { navigate, lastSubmission, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const refCode = reference || lastSubmission?.reference || '';
  // lastSubmission is in-memory only (see AppContext) - if this page was
  // reached via a hard refresh rather than right after submitting, we still
  // show the reference from the URL, just without the personalized copy /
  // the ability to regenerate the receipt PDF.
  const matchesLastSubmission = lastSubmission?.reference === refCode;
  const preferredContactTimeLabel = matchesLastSubmission ? lastSubmission!.applicant.preferredContactTime : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    showToast('Tersalin', `Nomor referensi ${refCode} berhasil disalin`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    if (!matchesLastSubmission || !lastSubmission) {
      showToast(
        'Tidak Dapat Membuat Tanda Terima',
        'Data pengajuan tidak lagi tersedia di sesi ini (mis. setelah memuat ulang halaman). Silakan simpan nomor referensi Anda dan hubungi Customer Care jika memerlukan salinan tanda terima.',
        'warning',
      );
      return;
    }
    downloadApplicationReceiptPdf(lastSubmission);
    showToast('Tanda Terima Diunduh', `Menyimpan berkas tanda-terima-${refCode}.pdf`, 'success');
  };

  return (
    <div className="w-full bg-[#F9FAFB] py-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Main Success Card */}
        <div className="bg-white rounded-[28px] border border-gray-100 p-8 sm:p-12 shadow-soft text-center space-y-6">
          {/* Animated Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#E6F0F1] border border-[#0F4C5C]/20 flex items-center justify-center mx-auto text-[#0F4C5C] shadow-soft">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full">
              Pengajuan Berhasil Diterima
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Terima Kasih, Pengajuan Anda Telah Terdaftar
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Formulir permohonan asuransi awal Anda telah berhasil masuk ke sistem underwriting kami untuk diverifikasi oleh staf ahli.
            </p>
          </div>

          {/* Reference Code Box */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[#F8FAFB] border border-gray-100 max-w-md mx-auto text-center space-y-1.5 shadow-soft">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Nomor Referensi Pengajuan
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-wider text-[#0F4C5C]">
                {refCode}
              </span>
              <button
                id="copy-reference-btn"
                onClick={handleCopy}
                className="p-2 rounded-xl text-gray-400 hover:text-[#0F4C5C] hover:bg-gray-100 transition-colors cursor-pointer"
                title="Salin nomor referensi"
                aria-label="Salin nomor referensi"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[11px] text-gray-500">
              Simpan nomor ini untuk memudahkan pengecekan status pengajuan Anda.
            </div>
          </div>

          {/* Explicit Notice: NOT a policy or purchase receipt (PROMPT REQUIREMENT) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs text-left flex items-start gap-2.5 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold">Pemberitahuan Penting:</strong> Dokumen ini adalah tanda terima pengajuan awal digital dan <strong className="font-bold">bukan merupakan polis asuransi atau bukti pembelian resmi</strong>. Polis resmi akan diterbitkan setelah proses seleksi risiko (underwriting) selesai dan pembayaran premi pertama terverifikasi.
            </p>
          </div>

          {/* What happens next timeline */}
          <div className="pt-4 border-t border-gray-100 text-left space-y-4 max-w-xl mx-auto">
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Apa Langkah Selanjutnya?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-[#E6F0F1] text-[#0F4C5C] flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Verifikasi Berkas Awal (1x24 Jam Kerja)</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Petugas seleksi risiko kami memeriksa kelengkapan data pemohon dan memastikan kesesuaian usia serta riwayat proteksi.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-[#E6F0F1] text-[#0F4C5C] flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Konsultasi Terjadwal via WhatsApp / Telepon</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Financial Advisor resmi berlisensi AAJI akan menghubungi Anda sesuai jadwal pilihan Anda ({preferredContactTimeLabel || 'jadwal kerja'}) untuk mengonfirmasi data tanpa desakan penjualan.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-xl bg-[#E6F0F1] text-[#0F4C5C] flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Tanda Tangan Elektronik SPAJ Resmi</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Jika Anda menyetujui seluruh klausul pada RIPLAY dan polis contoh, Anda akan menerima tautan e-Sign bersertifikasi untuk penandatanganan berkas resmi.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              id="download-receipt-btn"
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadReceipt}
            >
              Unduh Tanda Terima (PDF)
            </Button>
            <Button
              id="success-home-btn"
              variant="accent"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('/')}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>

        {/* Support hotline assistance */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <div>Ada pertanyaan mendesak mengenai pengajuan Anda?</div>
          <div className="font-bold text-[#111827]">
            Hubungi Customer Care Halo Praxis di <a href="tel:1500880" className="text-[#0F4C5C] underline">1500-880</a> atau email <a href="mailto:layanan@praxis.co.id" className="text-[#0F4C5C] underline">layanan@praxis.co.id</a>
          </div>
        </div>
      </div>
    </div>
  );
};
