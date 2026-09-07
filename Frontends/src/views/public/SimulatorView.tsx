import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Calendar, 
  User, 
  Info,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';
import { PaymentFrequency } from '../../types';
import { publicApi, ApiError } from '../../lib/api';
import { adaptSimulationResult, FREQUENCY_TO_BACKEND } from '../../lib/adapters';

interface SimulatorViewProps {
  slug?: string;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ slug }) => {
  const { products, navigate, setActiveSimulation } = useApp();

  // Selected product state
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    slug || products[0]?.slug || 'praxis-jiwa-utama'
  );

  const product = useMemo(() => {
    return products.find((p) => p.slug === selectedProductSlug);
  }, [products, selectedProductSlug]);

  // Form inputs
  const [age, setAge] = useState<number>(30);
  const [sumAssured, setSumAssured] = useState<number>(1_000_000_000);
  const [paymentTerm, setPaymentTerm] = useState<number>(() => {
    return product?.allowedPaymentTerms[0] || 10;
  });
  const [frequency, setFrequency] = useState<PaymentFrequency>('Bulanan');

  // Real simulation state - server is the source of truth for the
  // calculation (see ARCHITECTURE-ESSENTIAL.md), not a local formula.
  const [simulation, setSimulation] = useState<ReturnType<typeof adaptSimulationResult> | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Update paymentTerm if selected product doesn't support the current term
  useEffect(() => {
    if (product && !product.allowedPaymentTerms.includes(paymentTerm)) {
      setPaymentTerm(product.allowedPaymentTerms[0]);
    }
  }, [product, paymentTerm]);

  // Sync sumAssured with product min/max
  useEffect(() => {
    if (!product) return;
    if (sumAssured < product.minSumAssured) {
      setSumAssured(product.minSumAssured);
    } else if (sumAssured > product.maxSumAssured) {
      setSumAssured(product.maxSumAssured);
    }
  }, [product, sumAssured]);

  // Debounced call to the real POST /simulations endpoint on every parameter
  // change, instead of computing the premium locally.
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setIsSimulating(true);
    const timer = setTimeout(() => {
      publicApi
        .simulate({
          productId: product.id,
          age,
          sumAssured,
          paymentTermYears: paymentTerm,
          paymentFrequency: FREQUENCY_TO_BACKEND[frequency],
        })
        .then((result) => {
          if (cancelled) return;
          setSimulation(
            adaptSimulationResult(result, {
              productId: product.id,
              productSlug: product.slug,
              age,
              sumAssured,
              paymentTerm,
              frequency,
            }),
          );
          setSimulationError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setSimulation(null);
          setSimulationError(err instanceof ApiError ? err.message : 'Gagal menghitung simulasi premi.');
        })
        .finally(() => {
          if (!cancelled) setIsSimulating(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [product, age, sumAssured, paymentTerm, frequency]);

  const presetSums = product
    ? [250_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 5_000_000_000].filter(
        (s) => s >= product.minSumAssured && s <= product.maxSumAssured,
      )
    : [];

  if (products.length === 0) {
    return (
      <div className="w-full bg-[#F9FAFB] py-20 min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Memuat data produk...</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="w-full bg-[#F9FAFB] py-20 min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Produk tidak ditemukan.</p>
      </div>
    );
  }

  const handleProceedToApply = () => {
    if (!simulation || !simulation.isValid) return;
    setActiveSimulation(simulation);
    navigate('/apply');
  };

  // Get active display premium based on frequency
  const displayCurrentPremium = () => {
    if (!simulation) return 0;
    switch (frequency) {
      case 'Bulanan': return simulation.monthlyPremium;
      case 'Triwulanan': return simulation.quarterlyPremium;
      case 'Semesteran': return simulation.semesterPremium;
      case 'Tahunan': return simulation.annualPremium;
    }
  };

  return (
    <div className="w-full bg-[#F9FAFB] py-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Back Link & Header */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/products/${product.slug}`)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0F4C5C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Detail {product.name}</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-[#0F4C5C]" />
                <span>Simulator & Ilustrasi Premi Instan</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] mt-2">
                Kalkulator Premi Asuransi
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Sesuaikan variabel usia, nilai santunan tunai, dan periode pembayaran untuk melihat estimasi premi transparan.
              </p>
            </div>

            {/* Product Switcher dropdown */}
            <div className="shrink-0">
              <label htmlFor="product-select" className="block text-xs font-bold text-gray-700 mb-1">
                Pilih Produk Asuransi:
              </label>
              <select
                id="product-select"
                value={selectedProductSlug}
                onChange={(e) => setSelectedProductSlug(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-[#0F4C5C] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} ({p.categoryLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Inputs on Left, Result State on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-7 bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-soft space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-[#111827]">Variabel Ilustrasi</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Masukkan parameter akurat sesuai kondisi calon tertanggung
              </p>
            </div>

            {/* Input 1: Age */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="age-input" className="font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Usia Calon Tertanggung:</span>
                </label>
                <span className="font-mono text-sm font-bold text-[#0F4C5C] bg-[#E6F0F1] px-3 py-1 rounded-full">
                  {age} Tahun
                </span>
              </div>
              <input
                id="age-input"
                type="range"
                min={product.minAge}
                max={product.maxAge}
                step={1}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full accent-[#0F4C5C] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Min: {product.minAge} thn</span>
                <span>Rentang usia produk: {product.minAge} - {product.maxAge} thn</span>
                <span>Maks: {product.maxAge} thn</span>
              </div>
            </div>

            {/* Input 2: Sum Assured (Uang Pertanggungan) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="sum-assured-slider" className="font-bold text-gray-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Uang Pertanggungan (Santunan Tunai):</span>
                </label>
                <span className="font-bold text-base text-[#0F4C5C] bg-[#E6F0F1] px-3 py-1 rounded-full">
                  {formatIDR(sumAssured)}
                </span>
              </div>

              <input
                id="sum-assured-slider"
                type="range"
                min={product.minSumAssured}
                max={product.maxSumAssured}
                step={50_000_000}
                value={sumAssured}
                onChange={(e) => setSumAssured(parseInt(e.target.value, 10))}
                className="w-full accent-[#0F4C5C] cursor-pointer"
              />

              {/* Preset Sum Assured Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetSums.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSumAssured(preset)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold ${
                      sumAssured === preset
                        ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-sm'
                        : 'bg-[#F3F4F6] text-gray-600 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    Rp {(preset / 1_000_000).toLocaleString('id-ID')} Jt
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Payment Term (Masa Pembayaran) */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Pilihan Masa Pembayaran Premi:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.allowedPaymentTerms.map((term) => {
                  const isSelected = paymentTerm === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setPaymentTerm(term)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-soft'
                          : 'bg-[#F9FAFB] text-[#111827] border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{term} Tahun</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-gray-400'}`}>
                        Setoran pasti
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400">
                Masa perlindungan proteksi tetap aktif hingga usia {product.coverageDurationYears} tahun meskipun masa bayar telah berakhir.
              </p>
            </div>

            {/* Input 4: Frequency */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-gray-400" />
                <span>Frekuensi Pembayaran:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Bulanan', 'Triwulanan', 'Semesteran', 'Tahunan'] as PaymentFrequency[]).map((freq) => {
                  const isSelected = frequency === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-sm'
                          : 'bg-[#F9FAFB] text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {freq}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INLINE VALIDATION / ERROR STATE */}
            {simulation && !simulation.isValid && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs animate-in fade-in duration-150">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold">Kombinasi Melebihi Batas Ketentuan Produk</strong>
                  <p className="leading-relaxed text-rose-800">{simulation.validationError}</p>
                  <p className="text-[11px] text-rose-700 font-medium">
                    Panduan: Turunkan masa pembayaran atau pilih produk lain yang mendukung usia lanjut.
                  </p>
                </div>
              </div>
            )}

            {simulationError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs animate-in fade-in duration-150">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold">Gagal Menghitung Simulasi</strong>
                  <p className="leading-relaxed text-rose-800">{simulationError}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: RESULT STATE & PROMINENT DISCLAIMER */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Hasil Simulasi Ilustrasi
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                  Tarif Standar
                </span>
              </div>

              {/* Estimated Premium Main Result */}
              <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#0F4C5C] to-[#0a3a46] text-white space-y-2 shadow-soft">
                <div className="text-xs font-medium text-slate-200">
                  Estimasi Setoran Premi ({frequency}):
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {isSimulating && !simulation ? (
                    <span className="text-lg font-semibold text-slate-200">Menghitung...</span>
                  ) : (
                    formatIDR(displayCurrentPremium())
                  )}
                  <span className="text-xs font-normal text-slate-200 ml-1.5">/ {frequency.toLowerCase()}</span>
                </div>
                <div className="pt-2 text-xs text-slate-200 border-t border-white/15 flex justify-between">
                  <span>Ekivalen Tahunan:</span>
                  <strong className="text-white font-bold">{formatIDR(simulation?.annualPremium ?? 0)} / tahun</strong>
                </div>
              </div>

              {/* Summary of Configuration */}
              <div className="space-y-2.5 text-xs text-gray-600 bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Produk Terpilih:</span>
                  <strong className="text-[#111827] font-bold">{product.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Uang Pertanggungan:</span>
                  <strong className="text-[#0F4C5C] font-extrabold">{formatIDR(sumAssured)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Usia Masuk:</span>
                  <span className="text-[#111827] font-bold">{age} Tahun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Masa Pembayaran:</span>
                  <span className="text-[#111827] font-bold">{paymentTerm} Tahun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Masa Perlindungan:</span>
                  <span className="text-[#111827] font-bold">Hingga Usia {product.coverageDurationYears} Tahun</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 text-gray-500">
                  <span>Estimasi Total Setoran:</span>
                  <strong className="text-[#111827] font-bold">
                    {formatIDR(simulation?.totalEstimatedInvestment ?? 0)}
                  </strong>
                </div>
              </div>

              {/* PROMINENT DISCLAIMER (EXPLICIT PROMPT REQUIREMENT) */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Penafian Resmi (Disclaimer)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Angka di atas merupakan <strong>ilustrasi estimasi awal</strong> dan <strong>bukan merupakan penawaran atau kontrak asuransi yang mengikat</strong>. Tarif premi definitif dan penerimaan risiko akan ditentukan melalui evaluasi seleksi underwriting resmi oleh PT Praxis Asuransi Jiwa Indonesia berdasarkan data SPAJ.
                </p>
              </div>

              {/* Action CTA: Carry simulation to application */}
              <Button
                id="simulator-apply-cta"
                variant="accent"
                size="lg"
                className="w-full justify-center"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                disabled={!simulation || !simulation.isValid || isSimulating}
                onClick={handleProceedToApply}
              >
                Lanjutkan ke Formulir Pengajuan
              </Button>

              <div className="text-center text-[11px] text-gray-400">
                Pengisian formulir hanya membutuhkan waktu 2-3 menit tanpa kewajiban bayar seketika.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
