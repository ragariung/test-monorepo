import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calculator, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Download, 
  AlertCircle, 
  Users, 
  Calendar, 
  Coins, 
  Sparkles,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';
import { Modal } from '../../components/common/Modal';

interface ProductDetailProps {
  slug?: string;
}

export const ProductDetailView: React.FC<ProductDetailProps> = ({ slug }) => {
  const { products, navigate, showToast } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Find product by slug or fallback to first product
  const product = products.find((p) => p.slug === slug) || products[0];

  const handleDownloadDoc = (docName: string) => {
    showToast('Dokumen Diunduh', `Mengunduh berkas ${docName} (PDF)`, 'info');
  };

  return (
    <div className="w-full bg-[#F9FAFB] pb-24">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#0F4C5C] to-[#0a3a46] text-white pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
          {/* Back link */}
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Produk</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                  {product.categoryLabel}
                </span>
                {product.badge && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {product.badge}
                  </span>
                )}
                <span className="text-xs text-slate-200">
                  Proteksi hingga usia {product.coverageDurationYears} tahun
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {product.name}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                {product.tagline}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  id="detail-hero-simulate-btn"
                  variant="accent"
                  size="md"
                  icon={<Calculator className="w-4 h-4" />}
                  onClick={() => navigate(`/products/${product.slug}/simulate`)}
                >
                  Hitung Simulasi Premi
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => {
                    const el = document.getElementById('benefits-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Pelajari Rincian Manfaat
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white/10 border border-white/20 p-6 rounded-[24px] backdrop-blur-md space-y-3 shadow-soft">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Ringkasan Ketentuan Produk
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-white/15 pb-2">
                    <span className="text-slate-300">Uang Pertanggungan:</span>
                    <strong className="text-white font-bold">
                      {formatIDR(product.minSumAssured)} - {formatIDR(product.maxSumAssured)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2">
                    <span className="text-slate-300">Usia Masuk:</span>
                    <strong className="text-white font-bold">{product.minAge} - {product.maxAge} Tahun</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2">
                    <span className="text-slate-300">Pilihan Masa Bayar:</span>
                    <strong className="text-white font-bold">{product.allowedPaymentTerms.join(', ')} Tahun</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Masa Asuransi:</span>
                    <strong className="text-white font-bold">Hingga Usia {product.coverageDurationYears} Tahun</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 space-y-16">
        {/* 2. KEY BENEFITS */}
        <section id="benefits-section" className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
              Manfaat Utama
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] mt-2">
              Keunggulan Perlindungan {product.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.keyBenefits.map((b, i) => (
              <div
                key={b.id || i}
                className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all space-y-2.5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F0F1] flex items-center justify-center text-[#0F4C5C] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#111827]">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. WHO IS IT FOR? */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
            <Users className="w-4 h-4 text-[#0F4C5C]" />
            <span>Siapa yang Tepat Memiliki Produk Ini?</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Profil Nasabah yang Sesuai
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {product.targetAudience.map((target, idx) => (
              <div key={idx} className="bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100 text-xs text-gray-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0F4C5C] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{target}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. COVERAGE / BENEFITS DETAIL TABLE */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
              Tabel Pertanggungan
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] mt-2">
              Rincian Cakupan & Batas Pembayaran Santunan
            </h2>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                    <th className="py-4 px-6">Kategori Manfaat</th>
                    <th className="py-4 px-6">Klausul Perlindungan</th>
                    <th className="py-4 px-6">Maksimum Santunan</th>
                    <th className="py-4 px-6">Ketentuan Pelaksanaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                  {product.coverageDetails.map((cov, idx) => (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-4 px-6 font-bold text-[#111827]">{cov.category}</td>
                      <td className="py-4 px-6">{cov.benefit}</td>
                      <td className="py-4 px-6 font-extrabold text-[#0F4C5C]">{cov.maximumPayout}</td>
                      <td className="py-4 px-6 text-gray-400">{cov.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. ELIGIBILITY & 6. PAYMENT OPTIONS (2-Col Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eligibility */}
          <div className="bg-white p-7 rounded-[28px] border border-gray-100 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#0F4C5C]" />
              <h3 className="text-lg font-bold text-[#111827]">Ketentuan & Syarat Kepesertaan</h3>
            </div>
            <ul className="space-y-3 text-xs text-gray-600">
              {product.eligibilityConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4C5C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment & term options */}
          <div className="bg-white p-7 rounded-[28px] border border-gray-100 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-[#0F4C5C]" />
              <h3 className="text-lg font-bold text-[#111827]">Opsi Masa Bayar & Frekuensi</h3>
            </div>
            <div className="space-y-3 text-xs text-gray-600">
              <p className="leading-relaxed">
                Pilih periode setoran yang paling sesuai dengan profil pendapatan Anda:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {product.allowedPaymentTerms.map((t) => (
                  <div key={t} className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-gray-100 text-center font-extrabold text-[#111827]">
                    {t} Tahun
                  </div>
                ))}
              </div>
              <div className="pt-2 text-gray-500">
                Tersedia metode pembayaran: <strong>Bulanan, Triwulanan, Semesteran, atau Tahunan</strong> melalui Virtual Account BCA, Mandiri, BRI, BNI, dan Autodebet Kartu Kredit.
              </div>
            </div>
          </div>
        </div>

        {/* 7. PREMIUM SIMULATOR PROMO CARD (EMBEDDED LAUNCHPAD) */}
        <section className="bg-gradient-to-r from-[#0F4C5C] to-[#0A333E] text-white p-8 sm:p-10 rounded-[28px] shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulasi Interaktif Resmi</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white">
              Hitung Premi Khusus untuk Usia & Kebutuhan Anda
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Atur kombinasi Uang Pertanggungan dan masa bayar untuk melihat rincian ilustrasi premi secara transparan.
            </p>
          </div>
          <Button
            id="detail-launch-simulator-btn"
            variant="accent"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={() => navigate(`/products/${product.slug}/simulate`)}
          >
            Buka Kalkulator Premi
          </Button>
        </section>

        {/* 8. DOCUMENTS (RIPLAY / BROCHURE / TERMS) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
              Dokumen Resmi Produk
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] mt-2">
              Unduh RIPLAY, Brosur, dan Ketentuan Polis
            </h2>
            <p className="text-xs text-gray-500">
              PRAXIS mematuhi regulasi transparansi OJK dengan menyediakan dokumen spesifikasi produk secara terbuka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {product.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-gray-400">{doc.size}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] leading-snug">{doc.name}</h4>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 justify-center"
                    icon={<FileText className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedDoc(doc.name)}
                  >
                    Pratinjau
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-3"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadDoc(doc.name)}
                    aria-label={`Unduh ${doc.name}`}
                  >
                    Unduh
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. TERMS / DISCLAIMER */}
        <section className="bg-white p-6 sm:p-7 rounded-[24px] border border-gray-100 shadow-soft space-y-3 text-xs text-gray-600">
          <div className="flex items-center gap-2 font-bold text-[#111827]">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Ketentuan Hukum & Penafian (Disclaimer)</span>
          </div>
          <p className="leading-relaxed">
            Halaman ini memuat ringkasan fitur utama dari produk asuransi {product.name} yang diterbitkan oleh PT Praxis Asuransi Jiwa Indonesia. Ketentuan lengkap mengenai hak dan kewajiban pemegang polis, rincian pengecualian, masa leluasa (grace period), dan pemulihan polis tertera secara sah pada Polis Asuransi. Calon pemegang polis disarankan untuk membaca dan memahami Ringkasan Informasi Produk dan Layanan (RIPLAY) sebelum menandatangani Surat Pengajuan Asuransi Jiwa (SPAJ).
          </p>
        </section>

        {/* 10. STICKY / PROMINENT APPLY CTA */}
        <section className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-[#111827]">
              Siap Mengamankan Masa Depan Keluarga dengan {product.name}?
            </h3>
            <p className="text-xs text-gray-500">
              Lakukan simulasi premi untuk mendapatkan ilustrasi yang dipersonalisasi dan ajukan aplikasi dalam 3 menit.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              id="detail-footer-simulate-cta"
              variant="accent"
              size="lg"
              icon={<Calculator className="w-5 h-5" />}
              onClick={() => navigate(`/products/${product.slug}/simulate`)}
            >
              Simulasi & Ajukan Sekarang
            </Button>
          </div>
        </section>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          title={`Pratinjau: ${selectedDoc}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Dokumen Resmi OJK / AAJI</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Format Ringkasan Sah
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Anda sedang melihat pratinjau spesifikasi standar untuk {product.name}. Dokumen ini berisi klausul transparansi biaya akuisisi, periode pertanggungan, dan prosedur klaim digital.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-[11px] bg-white">
              <div className="flex justify-between border-b pb-1">
                <span>Nama Produk:</span>
                <strong className="font-sans">{product.name}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Penerbit:</span>
                <span className="font-sans">PT Praxis Asuransi Jiwa Indonesia</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Nomor Regulasi:</span>
                <span>RIPLAY-PRX-2026/09</span>
              </div>
              <div className="flex justify-between">
                <span>Rasio Solvabilitas (RBC):</span>
                <span className="text-emerald-700 font-bold">340% (Minimum OJK 120%)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedDoc(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  handleDownloadDoc(selectedDoc);
                  setSelectedDoc(null);
                }}
              >
                Unduh Berkas Lengkap
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
