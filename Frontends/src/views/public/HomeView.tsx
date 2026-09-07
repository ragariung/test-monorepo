import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  HeartHandshake, 
  Lock, 
  BadgePercent, 
  HelpCircle, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Clock,
  Sparkles,
  Users,
  Award,
  Building,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { StatusChip } from '../../components/common/StatusChip';
import { formatIDR } from '../../data/mockData';

export const HomeView: React.FC = () => {
  const { navigate, products } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const featuredProducts = products.slice(0, 3);

  const faqs = [
    {
      q: 'Apa itu Uang Pertanggungan (UP) dan bagaimana menentukannya?',
      a: 'Uang Pertanggungan (UP) adalah santunan tunai pasti yang dibayarkan oleh PRAXIS kepada ahli waris jika terjadi risiko tutup usia pada tertanggung. Formula umum yang disarankan adalah 5 hingga 10 kali pengeluaran tahunan keluarga ditambah total kewajiban utang aktif.'
    },
    {
      q: 'Apakah hasil kalkulator dan simulasi premi ini bersifat mengikat?',
      a: 'Tidak. Simulasi premi di situs PRAXIS adalah ilustrasi estimasi tarif standar aktuaria. Besaran premi dan penerimaan pertanggungan final akan dievaluasi melalui proses underwriting resmi setelah Anda melengkapi Surat Pengajuan Asuransi Jiwa (SPAJ).'
    },
    {
      q: 'Bagaimana proses klaim di PRAXIS Insurance?',
      a: 'PRAXIS menerapkan layanan klaim terdigitalisasi 24/7. Anda atau penerima manfaat cukup menghubungi Halo Praxis di 1500-880 atau mengunggah dokumen klaim awal secara online. Rasio penyelesaian klaim kami tercatat 99,2% dengan rata-rata pencairan santunan tunai 7 hari kerja sejak dokumen lengkap.'
    },
    {
      q: 'Apa itu dokumen RIPLAY (Ringkasan Informasi Produk dan Layanan)?',
      a: 'RIPLAY adalah dokumen resmi yang diwajibkan oleh Otoritas Jasa Keuangan (OJK). Dokumen ini memuat seluruh rincian manfaat, biaya-biaya, risiko, masa tunggu, hingga klausul pengecualian produk secara transparan sebelum Anda memutuskan membeli polis.'
    },
    {
      q: 'Apakah ada masa tunggu (waiting period) sebelum perlindungan aktif?',
      a: 'Untuk manfaat meninggal dunia akibat kecelakaan, perlindungan aktif seketika setelah polis terbit dan premi pertama dibayar. Untuk manfaat penyakit kritis (Critical Illness), berlaku masa tunggu standar 90 hari kalender.'
    }
  ];

  return (
    <div className="w-full bg-[#F9FAFB] text-[#1F2937]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F9FAFB] to-[#F3F4F6] text-[#1F2937] pt-10 pb-16 md:pt-16 md:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#0F4C5C]"></span>
                Terpercaya di Indonesia • Rasio Klaim 99,2%
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] text-[#111827] tracking-tight">
                Perlindungan Masa Depan <span className="text-[#F27D26] italic font-serif">Tenang</span> Bersama Praxis.
              </h1>

              {/* Supporting Subheadline */}
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl font-normal">
                Solusi perlindungan finansial yang transparan dan fleksibel untuk keluarga Anda. Mulai ilustrasi premi Anda dalam hitungan menit tanpa kerumitan administrasi.
              </p>

              {/* CTA Pair */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Button
                  id="hero-explore-cta"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => navigate('/products')}
                >
                  Jelajahi Produk Proteksi
                </Button>
                <Button
                  id="hero-simulate-cta"
                  variant="secondary"
                  size="lg"
                  icon={<Calculator className="w-4 h-4 text-[#0F4C5C]" />}
                  onClick={() => navigate('/products/praxis-jiwa-utama/simulate')}
                >
                  Hitung Simulasi Premi
                </Button>
              </div>

              {/* Sleek Stats Proofs */}
              <div className="pt-6 border-t border-gray-200/80 flex items-center gap-6 sm:gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827]">10jt+</span>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">Nasabah Aktif</span>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827]">99,2%</span>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">Klaim Disetujui</span>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827]">&gt; Rp 2,4 T</span>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">Klaim Dibayarkan</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual / Interactive Snapshot Card (Matching Design Theme) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[460px] bg-white rounded-[32px] p-7 sm:p-8 shadow-soft border border-gray-100 flex flex-col gap-5">
                <div className="flex flex-col gap-1 pb-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Simulasi Premi
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                      Praxis Jiwa Utama
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">Estimasi Perlindungan Cepat</h3>
                  <p className="text-xs text-gray-500">Lengkapi data untuk estimasi perlindungan Anda.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Uang Pertanggungan (Sum Assured)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-gray-400">IDR</span>
                      <input 
                        type="text" 
                        readOnly 
                        value="1.000.000.000" 
                        className="w-full pl-14 pr-4 py-2.5 bg-[#F3F4F6] border-none rounded-xl text-sm font-bold text-[#0F4C5C] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usia Masuk</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="30 Tahun" 
                        className="w-full px-4 py-2.5 bg-[#F3F4F6] border-none rounded-xl text-sm font-medium text-gray-700 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Masa Bayar</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="10 Tahun" 
                        className="w-full px-4 py-2.5 bg-[#F3F4F6] border-none rounded-xl text-sm font-medium text-gray-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0" />
                      <span>Santunan tunai utuh bebas potongan pajak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0" />
                      <span>Tanpa tes medis untuk UP sampai Rp 1,5 Miliar</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFB] rounded-2xl p-4.5 border border-gray-100 mt-1">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Estimasi Premi Bulanan
                      </p>
                      <h4 className="text-2xl font-extrabold text-[#0F4C5C]">IDR 1.980.000</h4>
                    </div>
                    <button 
                      onClick={() => navigate('/products/praxis-jiwa-utama/simulate')}
                      className="px-5 py-2.5 bg-[#F27D26] text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      Kustomisasi
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed italic">
                  *Ini adalah ilustrasi penawaran, bukan kutipan final. Premi akhir akan disesuaikan setelah evaluasi risiko SPAJ lengkap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES & FEATURED PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
              Katalog Solusi Perlindungan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Pilihan Proteksi yang Disesuaikan dengan Fase Hidup Anda
            </h2>
            <p className="text-sm text-gray-500">
              Setiap keluarga memiliki prioritas finansial yang berbeda. Pilih perlindungan yang tepat dari portofolio komprehensif kami.
            </p>
          </div>
          <Button
            id="view-all-products-btn"
            variant="outline"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => navigate('/products')}
          >
            Lihat Semua 6 Produk
          </Button>
        </div>

        {/* Featured Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                    {product.categoryLabel}
                  </span>
                  {product.badge && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#0F4C5C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Uang Pertanggungan:</span>
                    <strong className="text-[#111827] font-bold">Hingga {formatIDR(product.maxSumAssured)}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Usia Masuk:</span>
                    <strong className="text-[#111827] font-bold">{product.minAge} - {product.maxAge} Tahun</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pilihan Masa Bayar:</span>
                    <strong className="text-[#111827] font-bold">{product.allowedPaymentTerms.join(', ')} Tahun</strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  {product.keyBenefits.slice(0, 2).map((benefit) => (
                    <div key={benefit.id} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0 mt-0.5" />
                      <span>{benefit.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-2.5">
                <Button
                  className="flex-1 justify-center"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/products/${product.slug}`)}
                >
                  Lihat Detail
                </Button>
                <Button
                  className="flex-1 justify-center"
                  variant="primary"
                  size="sm"
                  icon={<Calculator className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/products/${product.slug}/simulate`)}
                >
                  Simulasi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHY CHOOSE PRAXIS (TRUST SIGNALS) */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
              Fondasi Kepercayaan Finansial
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Mengapa Lebih Dari 85.000 Keluarga Memilih PRAXIS
            </h2>
            <p className="text-sm text-gray-500">
              Bukan sekadar transaksi finansial — kami mendampingi perlindungan masa depan Anda dengan tata kelola risiko berstandar internasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F9FAFB] p-6 rounded-[24px] border border-gray-100 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E6F0F1] flex items-center justify-center text-[#0F4C5C]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Kepastian Regulasi OJK</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Berizin resmi dan diawasi OJK dengan rasio solvabilitas modal (RBC) mencapai 340%, jauh melampaui ketentuan minimum regulasi 120%.
              </p>
            </div>

            <div className="bg-[#F9FAFB] p-6 rounded-[24px] border border-gray-100 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">99,2% Tingkat Klaim Cair</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Komitmen pembayaran klaim yang transparan dengan pendampingan langsung oleh Petugas Klaim Khusus di setiap proses pengajuan.
              </p>
            </div>

            <div className="bg-[#F9FAFB] p-6 rounded-[24px] border border-gray-100 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <BadgePercent className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">100% Ilustrasi Transparan</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tanpa klausul tersembunyi, tanpa ilustrasi angka fiktif. Seluruh tabel perkembangan polis, biaya akuisisi, dan RIPLAY dapat diunduh bebas.
              </p>
            </div>

            <div className="bg-[#F9FAFB] p-6 rounded-[24px] border border-gray-100 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F4C5C]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Konsultasi Tanpa Paksaan</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Penasihat keuangan resmi kami berlisensi AAJI dan dilarang menerapkan praktik penjualan agresif atau mendesak calon nasabah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 STEPS VISUAL) */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
            Alur Pengajuan Praktis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            4 Langkah Mudah Memulai Perlindungan Asuransi
          </h2>
          <p className="text-sm text-gray-500">
            Proses digital transparan tanpa tumpukan kertas fisik. Anda mengendalikan setiap keputusan perlindungan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft relative">
            <div className="w-10 h-10 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
              1
            </div>
            <h3 className="text-base font-bold text-[#111827]">Telusuri Produk</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Pelajari rincian manfaat perlindungan jiwa, penyakit kritis, atau pendidikan sesuai kebutuhan keluarga Anda.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft relative">
            <div className="w-10 h-10 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
              2
            </div>
            <h3 className="text-base font-bold text-[#111827]">Simulasi Premi Instan</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Atur usia, pilihan Uang Pertanggungan, masa pembayaran, dan frekuensi setoran untuk melihat estimasi premi seketika.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft relative">
            <div className="w-10 h-10 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
              3
            </div>
            <h3 className="text-base font-bold text-[#111827]">Kirim Formulir Pengajuan</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Isi data kontak dasar dan jadwal waktu yang Anda inginkan untuk dihubungi. Terima kode referensi pengajuan resmi.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-soft relative">
            <div className="w-10 h-10 rounded-full bg-[#F27D26] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-md">
              4
            </div>
            <h3 className="text-base font-bold text-[#111827]">Konsultasi Terverifikasi</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Financial Advisor resmi berlisensi AAJI menghubungi Anda sesuai jadwal yang dipilih untuk verifikasi tanpa paksaan.
            </p>
          </div>
        </div>
      </section>

      {/* 5. STANDALONE PREMIUM SIMULATOR CTA BANNER */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="rounded-[32px] bg-gradient-to-r from-[#0F4C5C] via-[#0a3a46] to-[#07262F] p-8 sm:p-12 text-white shadow-soft-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#E6F0F1]">
              <Calculator className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Kalkulator Premi Interaktif Tanpa Registrasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ketahui Estimasi Premi Perlindungan Keluarga Anda dalam 30 Detik.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Gunakan simulator cerdas kami untuk menyesuaikan Uang Pertanggungan dari Rp 100 Juta hingga Rp 5 Miliar sesuai anggaran bulanan keluarga Anda.
            </p>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Button
                id="standalone-simulator-cta"
                variant="accent"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => navigate('/products/praxis-jiwa-utama/simulate')}
              >
                Mulai Hitung Simulasi Premi Sekarang
              </Button>
              <span className="text-xs text-slate-300">
                • Hasil simulasi dapat langsung diteruskan ke formulir pengajuan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ / IMPORTANT INFORMATION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
            Informasi Transparan
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-sm text-gray-500">
            Pelajari segala hal tentang ketentuan polis, kalkulasi uang pertanggungan, dan proses verifikasi kami.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[#111827] hover:text-[#0F4C5C] transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold">{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#0F4C5C] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-[#F9FAFB]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. CONTACT CTA BANNER */}
      <section className="py-16 bg-[#F3F4F6] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-10 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#111827]">
                Butuh Bantuan Menentukan Pilihan Polis?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tim Customer Care dan Penasihat Keuangan Berlisensi AAJI kami siap menjawab pertanyaan teknis Anda setiap hari kerja.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
              <a
                href="tel:1500880"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F3F4F6] text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#0F4C5C]" />
                <span>Halo Praxis 1500-880</span>
              </a>
              <Button
                id="contact-consult-cta"
                variant="accent"
                size="md"
                onClick={() => navigate('/products/praxis-jiwa-utama/simulate')}
              >
                Simulasi & Dihubungi Konsultan
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
