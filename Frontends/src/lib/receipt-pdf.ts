import { jsPDF } from 'jspdf';
import { ApplicantData, SimulationResult } from '../types';
import { formatIDR } from '../data/mockData';

export interface ReceiptData {
  reference: string;
  submittedAt: string;
  applicant: ApplicantData;
  simulation: SimulationResult;
  productName: string;
}

/**
 * Generates and triggers a browser download of a PDF acknowledgment receipt
 * for a just-submitted application. This is deliberately NOT a policy
 * document - it mirrors the on-page notice (SuccessView) that this is a
 * digital submission receipt only, not proof of purchase or coverage.
 */
export function downloadApplicationReceiptPdf(data: ReceiptData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  const submittedDate = new Date(data.submittedAt);
  const submittedLabel = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(submittedDate) + ' WIB';

  // Header
  doc.setFillColor(15, 76, 92); // #0F4C5C
  doc.rect(0, 0, pageWidth, 84, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PRAXIS INSURANCE', marginX, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Tanda Terima Pengajuan Digital', marginX, 60);

  y = 112;
  doc.setTextColor(17, 24, 39); // #111827

  // Reference box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 251);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 56, 8, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('NOMOR REFERENSI PENGAJUAN', marginX + 16, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 76, 92);
  doc.text(data.reference, marginX + 16, y + 44);
  y += 80;

  // Important notice
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(252, 211, 77);
  const noticeText =
    'PENTING: Dokumen ini adalah tanda terima pengajuan awal digital dan BUKAN merupakan polis asuransi ' +
    'atau bukti pembelian resmi. Polis resmi akan diterbitkan setelah proses seleksi risiko (underwriting) ' +
    'selesai dan pembayaran premi pertama terverifikasi.';
  const noticeLines = doc.splitTextToSize(noticeText, pageWidth - marginX * 2 - 24);
  const noticeHeight = noticeLines.length * 13 + 20;
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, noticeHeight, 8, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 84, 8);
  doc.text(noticeLines, marginX + 12, y + 18);
  y += noticeHeight + 28;

  const sectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(title, marginX, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y + 6, pageWidth - marginX, y + 6);
    y += 24;
  };

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128);
    doc.text(label, marginX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(value, marginX + 190, y);
    y += 20;
  };

  sectionTitle('Data Pemohon');
  row('Nama Lengkap', data.applicant.fullName);
  row('Email', data.applicant.email);
  row('Telepon / WhatsApp', data.applicant.phone);
  row('Usia', `${data.applicant.age} Tahun`);
  row('Kota Domisili', data.applicant.city);
  row('Waktu Kontak Pilihan', data.applicant.preferredContactTime);
  y += 8;

  sectionTitle('Ringkasan Simulasi & Produk');
  row('Produk Asuransi', data.productName);
  row('Uang Pertanggungan', formatIDR(data.simulation.params.sumAssured));
  row('Masa Pembayaran', `${data.simulation.params.paymentTerm} Tahun`);
  row('Frekuensi Pembayaran', data.simulation.params.frequency);
  row('Estimasi Premi Bulanan', `${formatIDR(data.simulation.monthlyPremium)} / bulan`);
  row('Estimasi Premi Tahunan', `${formatIDR(data.simulation.annualPremium)} / tahun`);
  y += 8;

  sectionTitle('Informasi Pengajuan');
  row('Tanggal & Waktu Pengajuan', submittedLabel);
  row('Status', 'Submitted (Menunggu Verifikasi)');

  if (data.applicant.notes) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Catatan dari Pemohon:', marginX, y);
    y += 16;
    doc.setTextColor(17, 24, 39);
    const noteLines = doc.splitTextToSize(data.applicant.notes, pageWidth - marginX * 2);
    doc.text(noteLines, marginX, y);
    y += noteLines.length * 13;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, pageHeight - 64, pageWidth - marginX, pageHeight - 64);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text(
    'Ada pertanyaan mengenai pengajuan Anda? Hubungi Customer Care Halo Praxis di 1500-880 atau layanan@praxis.co.id',
    marginX,
    pageHeight - 44,
  );
  doc.text(
    'PT Praxis Asuransi Jiwa Indonesia - Dokumen ini dihasilkan otomatis dan sah tanpa tanda tangan basah.',
    marginX,
    pageHeight - 30,
  );

  doc.save(`tanda-terima-${data.reference}.pdf`);
}
