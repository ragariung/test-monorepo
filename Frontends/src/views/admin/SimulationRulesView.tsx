import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  CheckCircle2, 
  History, 
  Play, 
  ArrowLeft, 
  AlertCircle, 
  Save, 
  FileCode,
  ShieldCheck,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/common/Button';
import { formatIDR, calculateSimulation } from '../../data/mockData';

interface SimulationRulesViewProps {
  slug?: string;
}

export const SimulationRulesView: React.FC<SimulationRulesViewProps> = ({ slug }) => {
  const { products, navigate, showToast } = useApp();

  const product = products.find((p) => p.slug === slug) || products[0];

  // Versions list (Active vs Draft vs Retired)
  const [selectedVersion, setSelectedVersion] = useState<'v2.2-prod' | 'v2.3-draft' | 'v2.1-retired'>('v2.2-prod');

  // Rule parameters (editable)
  const [baseRatePerThousand, setBaseRatePerThousand] = useState<number>(2.2);
  const [maxAgePlusTerm, setMaxAgePlusTerm] = useState<number>(75);

  // Age band multipliers
  const [ageBands, setAgeBands] = useState([
    { id: 1, range: '18 - 30 Tahun', min: 18, max: 30, factor: 1.00 },
    { id: 2, range: '31 - 40 Tahun', min: 31, max: 40, factor: 1.25 },
    { id: 3, range: '41 - 50 Tahun', min: 41, max: 50, factor: 1.65 },
    { id: 4, range: '51 - 60 Tahun', min: 51, max: 60, factor: 2.30 },
    { id: 5, range: '61 - 65 Tahun', min: 61, max: 65, factor: 3.20 }
  ]);

  // Payment term multipliers
  const [termMultipliers, setTermMultipliers] = useState([
    { term: 5, multiplier: 1.85, label: '5 Tahun (Pelunasan Cepat)' },
    { term: 10, multiplier: 1.00, label: '10 Tahun (Standar)' },
    { term: 15, multiplier: 0.72, label: '15 Tahun (Ringan)' },
    { term: 20, multiplier: 0.58, label: '20 Tahun (Ekonomis)' }
  ]);

  // Live Test Sandbox
  const [testAge, setTestAge] = useState(35);
  const [testSum, setTestSum] = useState(1_000_000_000);
  const [testTerm, setTestTerm] = useState(10);

  const testResult = calculateSimulation(product, testAge, testSum, testTerm, 'Bulanan');

  const handlePublishVersion = () => {
    showToast(
      'Versi Aturan Diterbitkan',
      `Aturan tarif ${selectedVersion} berhasil diverifikasi dan disinkronkan ke mesin kalkulator publik.`,
      'success'
    );
  };

  return (
    <AdminLayout
      activeNav="simulation-rules"
      title={`Aturan Simulasi & Tarif Aktuaria: ${product.name}`}
      subtitle="Kelola tabel faktor tarif usia, pengali masa bayar, batas risiko, dan versioning aturan OJK."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/admin/products')}
          >
            Kembali ke Produk
          </Button>
          <Button
            id="publish-rule-version"
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handlePublishVersion}
          >
            Publikasikan Versi Aktif
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Version Switcher Bar (Active vs Draft vs Retired) - EXPLICIT PROMPT REQUIREMENT */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-4 h-4 text-[#0F4C5C]" />
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Versi Aturan Aktuaria:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedVersion('v2.2-prod')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                selectedVersion === 'v2.2-prod'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-2xs'
                  : 'bg-[#F8FAFB] text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>v2.2-prod (Aktif Produksi)</span>
            </button>

            <button
              onClick={() => setSelectedVersion('v2.3-draft')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                selectedVersion === 'v2.3-draft'
                  ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-2xs'
                  : 'bg-[#F8FAFB] text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>v2.3-draft (Dalam Review Aktuaris)</span>
            </button>

            <button
              onClick={() => setSelectedVersion('v2.1-retired')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                selectedVersion === 'v2.1-retired'
                  ? 'bg-gray-200 text-gray-800 border-gray-400'
                  : 'bg-[#F8FAFB] text-gray-400 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span>v2.1 (Pensiun / Retired)</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Tables & Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: AGE BANDS & TERM MULTIPLIERS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Global Product Formula Constraints */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-soft space-y-4">
              <div className="border-b border-gray-100 pb-3.5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827]">Parameter Dasar Tarif</h3>
                <span className="text-[11px] text-gray-400 font-mono">Kode Tabel: MORT-ID-2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111827]">Tarif Dasar Per 1 Juta Pertanggungan</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.1}
                      value={baseRatePerThousand}
                      onChange={(e) => setBaseRatePerThousand(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFB] border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827]"
                    />
                    <span className="text-gray-400 font-mono font-bold">‰</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111827]">Batas Maksimal Usia + Masa Bayar</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={maxAgePlusTerm}
                      onChange={(e) => setMaxAgePlusTerm(parseInt(e.target.value, 10) || 75)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFB] border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827]"
                    />
                    <span className="text-gray-400 font-bold">Thn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Age Bands Table */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827]">Tabel Faktor Risiko Rentang Usia</h3>
                <span className="text-xs text-gray-400">5 Rentang Dikonfigurasi</span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                    <th className="py-3 px-5">Rentang Usia</th>
                    <th className="py-3 px-5">Batas Min/Maks</th>
                    <th className="py-3 px-5">Faktor Pengali (Multiplier)</th>
                    <th className="py-3 px-5 text-right">Deviasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-mono">
                  {ageBands.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-5 font-sans font-bold text-[#111827]">{b.range}</td>
                      <td className="py-3.5 px-5 text-gray-500">{b.min} - {b.max} thn</td>
                      <td className="py-3.5 px-5 font-extrabold text-[#0F4C5C]">{b.factor.toFixed(2)}x</td>
                      <td className="py-3.5 px-5 text-right text-gray-400">
                        {b.factor === 1.0 ? 'Benchmark' : `+${Math.round((b.factor - 1) * 100)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Term Factors */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827]">Faktor Diskon Masa Pembayaran</h3>
                <span className="text-xs text-gray-400">Anuitas Terkoreksi</span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                    <th className="py-3 px-5">Masa Bayar</th>
                    <th className="py-3 px-5">Karakteristik Produk</th>
                    <th className="py-3 px-5 text-right">Faktor Tahunan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {termMultipliers.map((t) => (
                    <tr key={t.term} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#111827]">{t.term} Tahun</td>
                      <td className="py-3.5 px-5 text-gray-600 font-medium">{t.label}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#111827]">
                        {t.multiplier.toFixed(2)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: RULE TEST SANDBOX */}
          <div className="lg:col-span-5 bg-white rounded-[28px] border border-gray-100 p-6 sm:p-7 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#0F4C5C]" />
                <h3 className="text-sm font-bold text-[#111827]">Sandbox Uji Aturan Live</h3>
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Uji Aktif
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Verifikasi hasil formula perhitungan premi sebelum menerbitkan versi perubahan ke nasabah publik.
            </p>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111827]">Uji Usia Nasabah: {testAge} Tahun</label>
                <input
                  type="range"
                  min={18}
                  max={65}
                  value={testAge}
                  onChange={(e) => setTestAge(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0F4C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111827]">Uang Pertanggungan: {formatIDR(testSum)}</label>
                <input
                  type="range"
                  min={100_000_000}
                  max={5_000_000_000}
                  step={100_000_000}
                  value={testSum}
                  onChange={(e) => setTestSum(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0F4C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111827]">Masa Bayar: {testTerm} Tahun</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTestTerm(t)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer text-xs ${
                        testTerm === t
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-2xs'
                          : 'bg-[#F8FAFB] text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {t} Thn
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Simulation Result Output */}
            <div className="p-5 rounded-[24px] bg-[#0A2B33] text-white space-y-3 shadow-soft">
              <div className="text-[11px] text-slate-300 flex justify-between">
                <span>Output Kalkulasi Formula:</span>
                <span className={testResult.isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {testResult.isValid ? 'Valid' : 'Tidak Memenuhi Syarat'}
                </span>
              </div>

              {testResult.isValid ? (
                <>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {formatIDR(testResult.monthlyPremium)}
                    <span className="text-xs text-slate-300 ml-1 font-sans">/ bulan</span>
                  </div>
                  <div className="text-xs text-slate-300 pt-2.5 border-t border-white/10 space-y-1 font-mono">
                    <div className="flex justify-between font-sans">
                      <span>Tahunan:</span>
                      <strong className="text-white font-mono">{formatIDR(testResult.annualPremium)}</strong>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span>Total Investasi Bayar:</span>
                      <strong className="text-white font-mono">{formatIDR(testResult.totalEstimatedInvestment)}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-300 leading-relaxed font-medium">
                  {testResult.validationError}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center rounded-xl"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                setTestAge(30);
                setTestSum(1_000_000_000);
                setTestTerm(10);
              }}
            >
              Reset Parameter Uji
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
