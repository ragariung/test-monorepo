import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';
import { ApplicantData } from '../../types';

export const ApplyView: React.FC = () => {
  const { activeSimulation, products, submitApplication, navigate } = useApp();

  const product = activeSimulation
    ? products.find((p) => p.id === activeSimulation.params.productId)
    : undefined;

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(activeSimulation?.params.age ?? 30);
  const [city, setCity] = useState('Jakarta Selatan');
  const [preferredContactTime, setPreferredContactTime] = useState<
    'Pagi (09.00 - 12.00 WIB)' | 'Siang (13.00 - 17.00 WIB)' | 'Malam (19.00 - 21.00 WIB)'
  >('Pagi (09.00 - 12.00 WIB)');
  const [notes, setNotes] = useState('');
  const [dataConsent, setDataConsent] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Guard once every hook above has run (rules-of-hooks safe): products
  // loads asynchronously now (real API, not instant mock data), and a
  // visitor can land on /apply directly without having run a simulation.
  if (products.length === 0) {
    return (
      <div className="w-full bg-[#F9FAFB] py-20 min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Memuat data produk...</p>
      </div>
    );
  }
  if (!activeSimulation || !product) {
    return (
      <div className="w-full bg-[#F9FAFB] py-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-[28px] border border-gray-100 shadow-soft p-8 space-y-4">
          <Calculator className="w-10 h-10 text-[#0F4C5C] mx-auto" />
          <h1 className="text-lg font-bold text-[#111827]">Jalankan Simulasi Terlebih Dahulu</h1>
          <p className="text-sm text-gray-500">
            Kami memerlukan hasil simulasi premi untuk melengkapi formulir pengajuan ini.
          </p>
          <Button variant="accent" size="md" onClick={() => navigate('/products')}>
            Pilih Produk & Simulasikan
          </Button>
        </div>
      </div>
    );
  }
  const simulation = activeSimulation;

  const indonesianCities = [
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Timur',
    'Jakarta Utara',
    'Tangerang / Tangerang Selatan',
    'Bekasi',
    'Depok',
    'Bogor',
    'Bandung',
    'Surabaya',
    'Semarang',
    'Yogyakarta',
    'Medan',
    'Palembang',
    'Makassar',
    'Denpasar / Bali',
    'Balikpapan',
    'Kota Lainnya di Indonesia'
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Nama lengkap sesuai KTP wajib diisi (minimal 3 karakter).';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Format alamat email tidak valid.';
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      errs.phone = 'Nomor WhatsApp / telepon wajib aktif (minimal 9 digit).';
    }

    if (!age || age < product.minAge || age > product.maxAge) {
      errs.age = `Usia harus antara ${product.minAge} sampai ${product.maxAge} tahun.`;
    }

    if (!city) {
      errs.city = 'Pilih kota domisili saat ini.';
    }

    if (!dataConsent) {
      errs.dataConsent = 'Anda wajib menyetujui persetujuan pemrosesan data & kontak penasihat resmi.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    const applicantPayload: ApplicantData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age,
      city,
      preferredContactTime,
      notes: notes.trim() || undefined,
      dataConsent
    };

    try {
      const reference = await submitApplication(applicantPayload, simulation);
      navigate(`/application/success/${reference}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Gagal mengirim pengajuan. Silakan coba lagi.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F9FAFB] py-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <button
            onClick={() => navigate(`/products/${product.slug}/simulate`)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0F4C5C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Simulator Premi</span>
          </button>
          <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#0F4C5C]" />
            <span>Formulir Terenkripsi 256-bit SSL</span>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0F4C5C]" />
            <span>Tahap 3 dari 4: Formulir Pengajuan Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Pengajuan Perlindungan {product.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
            Lengkapi data pemohon di bawah ini. Tim Financial Advisor resmi kami akan menghubungi Anda sesuai waktu yang Anda tentukan untuk verifikasi data tanpa paksaan membeli.
          </p>
        </div>

        {/* 1. READ-ONLY CONTEXT: SIMULATION SNAPSHOT (EXPLICIT PROMPT REQUIREMENT) */}
        <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#0F4C5C]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ringkasan Simulasi Terkunci (Read-Only)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/products/${product.slug}/simulate`)}
              className="text-xs font-bold text-[#0F4C5C] hover:underline cursor-pointer"
            >
              Ubah Parameter Simulasi
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100">
              <div className="text-gray-400 text-[11px] font-medium">Produk Asuransi:</div>
              <div className="font-bold text-[#111827] mt-0.5 truncate">{product.name}</div>
              <div className="text-[10px] text-gray-400">{product.categoryLabel}</div>
            </div>

            <div className="bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100">
              <div className="text-gray-400 text-[11px] font-medium">Uang Pertanggungan:</div>
              <div className="font-extrabold text-[#0F4C5C] mt-0.5">
                {formatIDR(simulation.params.sumAssured)}
              </div>
              <div className="text-[10px] text-gray-400">Santunan Tunai Pasti</div>
            </div>

            <div className="bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100">
              <div className="text-gray-400 text-[11px] font-medium">Masa Pembayaran:</div>
              <div className="font-bold text-[#111827] mt-0.5">
                {simulation.params.paymentTerm} Tahun
              </div>
              <div className="text-[10px] text-gray-400">Proteksi sd usia {product.coverageDurationYears} thn</div>
            </div>

            <div className="bg-[#F8FAFB] p-4 rounded-2xl border border-gray-100">
              <div className="text-gray-400 text-[11px] font-medium">Estimasi Premi:</div>
              <div className="font-extrabold text-[#0F4C5C] mt-0.5">
                {formatIDR(
                  simulation.params.frequency === 'Bulanan'
                    ? simulation.monthlyPremium
                    : simulation.annualPremium
                )}
              </div>
              <div className="text-[10px] text-gray-400">/ {simulation.params.frequency.toLowerCase()}</div>
            </div>
          </div>
        </div>

        {/* 2. APPLICATION FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-[#111827]">Data Diri Calon Pemegang Polis / Tertanggung</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Mohon pastikan nama dan nomor kontak sesuai dengan identitas KTP yang berlaku
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="full-name" className="block text-xs font-bold text-gray-700">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.fullName
                      ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                      : 'border-gray-200 bg-[#F9FAFB] focus:ring-[#0F4C5C] text-[#111827]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-gray-700">
                Alamat Email Aktif <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.email
                      ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                      : 'border-gray-200 bg-[#F9FAFB] focus:ring-[#0F4C5C] text-[#111827]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700">
                Nomor Telepon / WhatsApp <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.phone
                      ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                      : 'border-gray-200 bg-[#F9FAFB] focus:ring-[#0F4C5C] text-[#111827]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label htmlFor="applicant-age" className="block text-xs font-bold text-gray-700">
                Usia Saat Ini (Tahun) <span className="text-rose-600">*</span>
              </label>
              <input
                id="applicant-age"
                type="number"
                min={product.minAge}
                max={product.maxAge}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.age
                    ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                    : 'border-gray-200 bg-[#F9FAFB] focus:ring-[#0F4C5C] text-[#111827]'
                }`}
              />
              {errors.age && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* City / Domicile */}
            <div className="space-y-1.5">
              <label htmlFor="city-select" className="block text-xs font-bold text-gray-700">
                Kota / Domisili Saat Ini <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  id="city-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-[#F9FAFB] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] cursor-pointer"
                >
                  {indonesianCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Contact Time */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700">
                Waktu Terbaik untuk Dihubungi Petugas Konsultan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {(['Pagi (09.00 - 12.00 WIB)', 'Siang (13.00 - 17.00 WIB)', 'Malam (19.00 - 21.00 WIB)'] as const).map(
                  (timeOption) => {
                    const isSelected = preferredContactTime === timeOption;
                    return (
                      <button
                        key={timeOption}
                        type="button"
                        onClick={() => setPreferredContactTime(timeOption)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-left flex items-center gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E6F0F1] border-[#0F4C5C] text-[#0F4C5C]'
                            : 'bg-[#F9FAFB] border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0F4C5C]' : 'text-gray-400'}`} />
                        <span>{timeOption}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="notes-input" className="block text-xs font-bold text-gray-700">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Mohon konfirmasi jadwal via WhatsApp terlebih dahulu..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F9FAFB] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] resize-none"
              />
            </div>
          </div>

          {/* 3. EXPLICIT CONSENT CHECKBOX (MANDATORY REQUIREMENT) */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className={`p-4 rounded-2xl border transition-colors ${
              errors.dataConsent ? 'bg-rose-50 border-rose-300' : 'bg-[#F8FAFB] border-gray-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#0F4C5C] focus:ring-[#0F4C5C] border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  <strong className="text-[#111827] font-bold">Pernyataan Persetujuan Kontak & Kerahasiaan Data:</strong>{' '}
                  Saya dengan ini memberikan persetujuan kepada PT Praxis Asuransi Jiwa Indonesia untuk memproses data kontak saya dan menghubungi saya melalui telepon/WhatsApp resmi guna verifikasi ilustrasi dan konsultasi produk. Data Anda dilindungi undang-undang pelindungan data pribadi (UU PDP) dan tidak akan dialihkan ke pihak ketiga.
                </span>
              </label>
            </div>
            {errors.dataConsent && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.dataConsent}</span>
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{submitError}</span>
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-gray-400">
              Dengan mengklik &ldquo;Kirim Pengajuan&rdquo;, Anda tidak dibebankan biaya apa pun saat ini.
            </div>
            <Button
              id="submit-application-btn"
              type="submit"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              {isSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan Sekarang'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
