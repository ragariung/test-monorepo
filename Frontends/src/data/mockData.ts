import { 
  Product, 
  ApplicationRecord, 
  StaffUser, 
  AuditLogEntry, 
  SimulationRuleVersion,
  SimulationParams,
  SimulationResult,
  PaymentFrequency
} from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'praxis-jiwa-utama',
    name: 'PRAXIS Jiwa Utama',
    tagline: 'Proteksi jiwa komprehensif seumur hidup dengan garansi kepastian finansial keluarga.',
    category: 'life',
    categoryLabel: 'Proteksi Jiwa',
    summary: 'Perlindungan finansial penuh bagi keluarga tercinta hingga usia 99 tahun. Memberikan santunan tunai pasti atas risiko tutup usia dengan pilihan masa bayar yang fleksibel.',
    targetAudience: [
      'Pencari nafkah utama keluarga yang menginginkan ketenangan pikiran.',
      'Profesional muda yang ingin mengunci premi murah sejak dini.',
      'Kepala keluarga yang merencanakan proteksi warisan tanpa risiko sengketa.'
    ],
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 5_000_000_000,
    allowedPaymentTerms: [5, 10, 15, 20],
    coverageDurationYears: 99,
    baseAnnualRatePerMillion: 18.5,
    status: 'Published',
    badge: 'Paling Populer',
    colorTone: '#0A3641',
    keyBenefits: [
      {
        id: 'b-1',
        title: '100% Uang Pertanggungan Tunai',
        description: 'Santunan cair utuh kepada ahli waris bebas pajak penghasilan saat terjadi risiko tutup usia.',
        iconName: 'ShieldCheck'
      },
      {
        id: 'b-2',
        title: 'Pilihan Masa Bayar Fleksibel',
        description: 'Cukup bayar selama 5, 10, 15, atau 20 tahun untuk proteksi perlindungan seumur hidup hingga usia 99 tahun.',
        iconName: 'CalendarClock'
      },
      {
        id: 'b-3',
        title: 'Bebas Biaya Administrasi Tambahan',
        description: 'Premi tetap (flat) selama masa pembayaran yang dipilih, tanpa kenaikan akibat inflasi usia.',
        iconName: 'Coins'
      },
      {
        id: 'b-4',
        title: 'Klaim Digital Cepat & Didampingi',
        description: 'Layanan klaim darurat 24/7 dengan rasio penyelesaian klaim 99,2% dan dedicated claims officer.',
        iconName: 'Headphones'
      }
    ],
    coverageDetails: [
      {
        category: 'Manfaat Utama',
        benefit: 'Meninggal Dunia karena Sakit atau Alami',
        maximumPayout: '100% Uang Pertanggungan',
        notes: 'Cair ke Penerima Manfaat resmi tanpa potongan biaya materai/admin.'
      },
      {
        category: 'Manfaat Utama',
        benefit: 'Meninggal Dunia Akibat Kecelakaan',
        maximumPayout: '200% Uang Pertanggungan',
        notes: 'Santunan ganda langsung cair apabila terjadi kecelakaan lalu lintas atau umum.'
      },
      {
        category: 'Manfaat Tambahan (Rider Opsional)',
        benefit: 'Pembebasan Premi (Waiver of Premium)',
        maximumPayout: '100% Bebas Sisa Premi',
        notes: 'Jika terdiagnosa cacat total tetap atau kondisi kritis tertentu.'
      },
      {
        category: 'Nilai Tunai',
        benefit: 'Nilai Tunai Garansi di Akhir Masa Polis',
        maximumPayout: 'Sesuai Tabel Garansi Polis',
        notes: 'Apabila tertanggung bertahan hidup hingga usia 99 tahun.'
      }
    ],
    eligibilityConditions: [
      'Warga Negara Indonesia (WNI) atau WNA pemegang KITAS/KITAP resmi.',
      'Usia masuk tertanggung 18 hingga 60 tahun (ulang tahun terdekat).',
      'Kondisi kesehatan standar (non-substandard) saat mengisi deklarasi kesehatan awal.',
      'Memiliki KTP / identitas resmi yang masih berlaku dan rekening bank terdaftar di Indonesia.'
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'RIPLAY (Ringkasan Informasi Produk dan Layanan Versi Umum)',
        type: 'RIPLAY',
        size: '1.4 MB',
        url: '#'
      },
      {
        id: 'doc-2',
        name: 'Brosur Resmi PRAXIS Jiwa Utama 2026',
        type: 'Brosur',
        size: '2.8 MB',
        url: '#'
      },
      {
        id: 'doc-3',
        name: 'Ketentuan Polis Standar & Pengecualian',
        type: 'Ketentuan Umum',
        size: '890 KB',
        url: '#'
      }
    ]
  },
  {
    id: 'prod-2',
    slug: 'praxis-sehat-mandiri',
    name: 'PRAXIS Sehat Mandiri',
    tagline: 'Perlindungan penyakit kritis tahap awal hingga akhir dengan fasilitas cashless rumah sakit.',
    category: 'critical-illness',
    categoryLabel: 'Penyakit Kritis & Rawat',
    summary: 'Solusi finansial tangguh menghadapi 68 kondisi kritis (kanker, stroke, jantung) dengan santunan tunai cepat tanpa harus menunggu kuitansi rumah sakit lunas.',
    targetAudience: [
      'Profesional aktif yang memiliki risiko kelelahan dan gaya hidup urban.',
      'Individu dengan riwayat penyakit kritis dalam riwayat genetik keluarga.',
      'Pemilik bisnis yang ingin menjaga kelangsungan usaha saat sakit berkepanjangan.'
    ],
    minAge: 20,
    maxAge: 55,
    minSumAssured: 200_000_000,
    maxSumAssured: 3_000_000_000,
    allowedPaymentTerms: [10, 15, 20],
    coverageDurationYears: 75,
    baseAnnualRatePerMillion: 24.2,
    status: 'Published',
    badge: 'Proteksi Kritis',
    colorTone: '#0E7E63',
    keyBenefits: [
      {
        id: 'b-5',
        title: 'Proteksi 68 Kondisi Kritis',
        description: 'Menanggung stadium awal (early stage), menengah, hingga komplikasi terminal.',
        iconName: 'HeartPulse'
      },
      {
        id: 'b-6',
        title: 'Santunan Tunai Sekaligus (Lump Sum)',
        description: 'Dana langsung cair ke rekening pribadi untuk biaya hidup, second opinion, atau pengobatan alternatif.',
        iconName: 'Banknote'
      },
      {
        id: 'b-7',
        title: 'Bebas Premi Pasca Diagnosa',
        description: 'Setelah klaim kondisi kritis disetujui, polis berlanjut tanpa perlu membayar premi lagi.',
        iconName: 'Sparkles'
      },
      {
        id: 'b-8',
        title: 'Jejaring RS Rekanan Global',
        description: 'Akses ke lebih dari 1.200 RS di Indonesia, Malaysia, dan Singapura.',
        iconName: 'Building2'
      }
    ],
    coverageDetails: [
      {
        category: 'Tahap Awal',
        benefit: 'Kanker Stadium Dini / Bedah Jantung Ringan',
        maximumPayout: '50% Uang Pertanggungan',
        notes: 'Dapat diklaim maksimal 2 kali untuk kondisi kritis berbeda.'
      },
      {
        category: 'Tahap Lanjut',
        benefit: 'Serangan Jantung, Kanker Ganas, Stroke Akut',
        maximumPayout: '100% Sisa Uang Pertanggungan',
        notes: 'Santunan tunai utuh tanpa perlu menyertakan rincian kuitansi biaya.'
      },
      {
        category: 'Manfaat Hidup',
        benefit: 'Tunjangan Pemulihan Pasca Rawat Inap',
        maximumPayout: 'Rp 15.000.000 / insiden',
        notes: 'Maksimal 1 kali per tahun polis.'
      }
    ],
    eligibilityConditions: [
      'Usia masuk 20 hingga 55 tahun.',
      'Masa tunggu (waiting period) 90 hari kalender sejak polis diterbitkan.',
      'Tidak memiliki riwayat diagnosa kondisi kritis sebelumnya.'
    ],
    documents: [
      {
        id: 'doc-4',
        name: 'RIPLAY PRAXIS Sehat Mandiri',
        type: 'RIPLAY',
        size: '1.2 MB',
        url: '#'
      },
      {
        id: 'doc-5',
        name: 'Daftar 68 Penyakit Kritis & Kriteria Diagnosa Medis',
        type: 'Ketentuan Umum',
        size: '1.9 MB',
        url: '#'
      }
    ]
  },
  {
    id: 'prod-3',
    slug: 'praxis-warisan-pintar',
    name: 'PRAXIS Warisan Pintar',
    tagline: 'Perencanaan transfer kekayaan keluarga terstruktur dengan jaminan kepastian hukum.',
    category: 'family',
    categoryLabel: 'Proteksi Keluarga',
    summary: 'Mempersiapkan warisan tunai bebas sengketa untuk anak dan cucu dengan perlindungan multigenerasi serta alokasi penerima manfaat proporsional.',
    targetAudience: [
      'Orang tua yang ingin menjamin kemandirian finansial anak di masa depan.',
      'Keluarga yang memiliki aset properti dan memerlukan likuiditas tunai untuk pajak waris.',
      'Pengusaha yang ingin mendistribusikan aset secara terencana.'
    ],
    minAge: 25,
    maxAge: 65,
    minSumAssured: 500_000_000,
    maxSumAssured: 10_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 99,
    baseAnnualRatePerMillion: 28.0,
    status: 'Published',
    badge: 'Solusi Waris',
    colorTone: '#1E3A8A',
    keyBenefits: [
      {
        id: 'b-9',
        title: 'Penetapan Ahli Waris Terproteksi',
        description: 'Uang pertanggungan langsung ke nama ahli waris tanpa melalui proses pengadilan hak waris.',
        iconName: 'Users'
      },
      {
        id: 'b-10',
        title: 'Likuiditas Cepat & Pasti',
        description: 'Cair dalam 7 hari kerja setelah dokumen klaim lengkap diterima.',
        iconName: 'Zap'
      },
      {
        id: 'b-11',
        title: 'Fleksibilitas Mata Uang',
        description: 'Tersedia dalam Rupiah (IDR) dan US Dollar (USD) untuk proteksi diversifikasi.',
        iconName: 'Globe'
      }
    ],
    coverageDetails: [
      {
        category: 'Manfaat Waris',
        benefit: 'Santunan Meninggal Dunia Garansi',
        maximumPayout: '100% Uang Pertanggungan + Nilai Tunai',
        notes: 'Diberikan penuh kepada nama anak/ahli waris terpilih.'
      }
    ],
    eligibilityConditions: [
      'Usia masuk pemegang polis & tertanggung 25 - 65 tahun.',
      'Melampirkan kartu keluarga dan akta kelahiran ahli waris saat verifikasi lanjutan.'
    ],
    documents: [
      {
        id: 'doc-6',
        name: 'RIPLAY PRAXIS Warisan Pintar',
        type: 'RIPLAY',
        size: '1.1 MB',
        url: '#'
      }
    ]
  },
  {
    id: 'prod-4',
    slug: 'praxis-cendekia',
    name: 'PRAXIS Cendekia',
    tagline: 'Kepastian dana pendidikan tinggi putra-putri tercinta di setiap jenjang akademis.',
    category: 'education',
    categoryLabel: 'Dana Pendidikan',
    summary: 'Program perlindungan dwiguna pendidikan dengan tahapan dana pasti saat anak masuk SMP, SMA, dan Universitas, terlepas dari apa pun risiko yang terjadi pada orang tua.',
    targetAudience: [
      'Orang tua dengan anak usia 0 hingga 10 tahun.',
      'Keluarga yang mengantisipasi inflasi biaya pendidikan 10-15% per tahun.'
    ],
    minAge: 21,
    maxAge: 50,
    minSumAssured: 150_000_000,
    maxSumAssured: 2_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 22,
    baseAnnualRatePerMillion: 32.5,
    status: 'Published',
    badge: 'Garansi Sekolah',
    colorTone: '#7C3AED',
    keyBenefits: [
      {
        id: 'b-12',
        title: 'Tahapan Dana Pasti di Tiap Jenjang',
        description: 'Pencairan dana garansi berkala saat anak berusia 12, 15, dan 18 tahun.',
        iconName: 'GraduationCap'
      },
      {
        id: 'b-13',
        title: 'Proteksi Ganda Orang Tua & Anak',
        description: 'Jika orang tua tutup usia, sisa setoran premi otomatis gratis dan dana pendidikan tetap cair sesuai jadwal.',
        iconName: 'ShieldAlert'
      }
    ],
    coverageDetails: [
      {
        category: 'Tahapan Belajar',
        benefit: 'Tahapan Masuk Perguruan Tinggi',
        maximumPayout: '50% Total Uang Pertanggungan',
        notes: 'Dicairkan tepat saat anak berusia 18 tahun.'
      }
    ],
    eligibilityConditions: [
      'Usia orang tua (pemegang polis): 21 - 50 tahun.',
      'Usia anak (tertanggung): 30 hari - 10 tahun.'
    ],
    documents: [
      {
        id: 'doc-7',
        name: 'RIPLAY PRAXIS Cendekia',
        type: 'RIPLAY',
        size: '1.5 MB',
        url: '#'
      }
    ]
  },
  {
    id: 'prod-5',
    slug: 'praxis-dana-sejahtera',
    name: 'PRAXIS Dana Sejahtera',
    tagline: 'Akumulasi dana terukur dengan imbal hasil garansi dan bonus loyalitas berkala.',
    category: 'savings',
    categoryLabel: 'Tabungan Berjangka',
    summary: 'Rencana simpanan terstruktur dengan kepastian imbal hasil di atas rata-rata deposito serta perlindungan jiwa melekat selama masa kepesertaan.',
    targetAudience: [
      'Profesional yang mencari instrumen konservatif rendah risiko.',
      'Calon pensiunan yang ingin memastikan arus kas stabil di hari tua.'
    ],
    minAge: 20,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 3_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 20,
    baseAnnualRatePerMillion: 26.0,
    status: 'Published',
    badge: 'Garansi Bonus',
    colorTone: '#D97706',
    keyBenefits: [
      {
        id: 'b-14',
        title: 'Tingkat Hasil Pasti Tertera di Polis',
        description: 'Bebas dari fluktuasi pasar saham, nilai dana dijamin secara kontraktual.',
        iconName: 'TrendingUp'
      },
      {
        id: 'b-15',
        title: 'Bonus Loyalitas Tiap 3 Tahun',
        description: 'Tambahan persentase dana tunai bagi pemegang polis yang disiplin membayar premi.',
        iconName: 'Gift'
      }
    ],
    coverageDetails: [
      {
        category: 'Manfaat Tabungan',
        benefit: 'Pengembalian Premi 110% di Akhir Kontrak',
        maximumPayout: '110% dari akumulasi premi',
        notes: 'Jika tertanggung sehat hingga akhir masa pertanggungan 20 tahun.'
      }
    ],
    eligibilityConditions: [
      'Usia masuk 20 hingga 60 tahun.',
      'Pilihan masa bayar 5 atau 10 tahun.'
    ],
    documents: [
      {
        id: 'doc-8',
        name: 'RIPLAY PRAXIS Dana Sejahtera',
        type: 'RIPLAY',
        size: '1.3 MB',
        url: '#'
      }
    ]
  },
  {
    id: 'prod-6',
    slug: 'praxis-investa-syariah',
    name: 'PRAXIS Investa Syariah',
    tagline: 'Perlindungan tolong-menolong berbasis prinsip syariah dengan pengelolaan dana halal.',
    category: 'investment',
    categoryLabel: 'Unit Link Syariah',
    summary: 'Kombinasi proteksi tolong-menolong (tabarru\') dengan instrumen sukuk dan saham syariah berprinsip amanah, diawasi oleh Dewan Pengawas Syariah (DPS).',
    targetAudience: [
      'Keluarga muslim modern yang mengutamakan kepatuhan syariah.',
      'Investor yang menginginkan diversifikasi portofolio etis & transparan.'
    ],
    minAge: 18,
    maxAge: 55,
    minSumAssured: 150_000_000,
    maxSumAssured: 4_000_000_000,
    allowedPaymentTerms: [10, 15, 20],
    coverageDurationYears: 80,
    baseAnnualRatePerMillion: 21.0,
    status: 'Published',
    badge: 'Prinsip Syariah',
    colorTone: '#059669',
    keyBenefits: [
      {
        id: 'b-16',
        title: 'Akad Tabarru\' Bebas Riba & Gharar',
        description: 'Sistem tolong-menolong antar nasabah yang sah secara syariah dan regulasi DSN-MUI.',
        iconName: 'Scale'
      },
      {
        id: 'b-17',
        title: 'Surplus Underwriting Berbagi Berkah',
        description: 'Potensi pembagian keuntungan underwriting jika klaim risiko dalam portofolio sehat.',
        iconName: 'HandCoins'
      }
    ],
    coverageDetails: [
      {
        category: 'Dana Tabarru\'',
        benefit: 'Santunan Tutup Usia Syariah',
        maximumPayout: '100% Uang Pertanggungan + Nilai Saldo Investasi',
        notes: 'Dikelola secara transparan dalam Rekening Tabarru\' terpisah.'
      }
    ],
    eligibilityConditions: [
      'Terbuka untuk seluruh masyarakat Indonesia tanpa memandang latar belakang.',
      'Usia masuk 18 - 55 tahun.'
    ],
    documents: [
      {
        id: 'doc-9',
        name: 'RIPLAY & Surat Rekomendasi DPS MUI',
        type: 'RIPLAY',
        size: '1.7 MB',
        url: '#'
      }
    ]
  }
];

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Bambang Soedirman',
    email: 'bambang.soedirman@praxis.co.id',
    role: 'Underwriter Manager',
    department: 'Underwriting & Risk Governance',
    assignedCount: 4,
    isActive: true,
  },
  {
    id: 'staff-2',
    name: 'Sarah Wijaya',
    email: 'sarah.wijaya@praxis.co.id',
    role: 'Senior Underwriter',
    department: 'Life & Medical Assessment',
    assignedCount: 6,
    isActive: true,
    managerId: 'staff-1',
    managerName: 'Bambang Soedirman'
  },
  {
    id: 'staff-3',
    name: 'Bobby Pratama',
    email: 'bobby.pratama@praxis.co.id',
    role: 'Senior Underwriter',
    department: 'Wealth & Legacy Solutions',
    assignedCount: 5,
    isActive: true,
    managerId: 'staff-1',
    managerName: 'Bambang Soedirman'
  },
  {
    id: 'staff-4',
    name: 'Dewi Anggraeni',
    email: 'dewi.anggraeni@praxis.co.id',
    role: 'Tele-Consultant',
    department: 'Digital Lead Qualification',
    assignedCount: 8,
    isActive: true,
    managerId: 'staff-1',
    managerName: 'Bambang Soedirman'
  }
];

export const INITIAL_SIMULATION_RULES: SimulationRuleVersion[] = [
  {
    version: 'v2.3',
    status: 'Active',
    effectiveDate: '01 Jan 2026',
    author: 'Sarah Wijaya (Actuary Committee)',
    baseMortalityMultiplier: 1.0,
    ageBandMultipliers: [
      { range: '18 - 30 Tahun', factor: 1.0 },
      { range: '31 - 40 Tahun', factor: 1.25 },
      { range: '41 - 50 Tahun', factor: 1.65 },
      { range: '51 - 60 Tahun', factor: 2.30 },
      { range: '61 - 65 Tahun', factor: 3.10 }
    ],
    termDiscounts: [
      { term: 5, discountPercent: 0 },
      { term: 10, discountPercent: 5 },
      { term: 15, discountPercent: 9 },
      { term: 20, discountPercent: 14 }
    ],
    frequencySurcharges: [
      { frequency: 'Bulanan', factor: 0.09 }, // 9% of annual per month (~108% total)
      { frequency: 'Triwulanan', factor: 0.26 },
      { frequency: 'Semesteran', factor: 0.51 },
      { frequency: 'Tahunan', factor: 1.0 }
    ]
  },
  {
    version: 'v2.4',
    status: 'Draft',
    effectiveDate: '01 Okt 2026 (Rencana)',
    author: 'Bambang Soedirman',
    baseMortalityMultiplier: 0.98,
    ageBandMultipliers: [
      { range: '18 - 30 Tahun', factor: 0.95 },
      { range: '31 - 40 Tahun', factor: 1.20 },
      { range: '41 - 50 Tahun', factor: 1.60 },
      { range: '51 - 60 Tahun', factor: 2.25 },
      { range: '61 - 65 Tahun', factor: 3.00 }
    ],
    termDiscounts: [
      { term: 5, discountPercent: 2 },
      { term: 10, discountPercent: 6 },
      { term: 15, discountPercent: 11 },
      { term: 20, discountPercent: 16 }
    ],
    frequencySurcharges: [
      { frequency: 'Bulanan', factor: 0.088 },
      { frequency: 'Triwulanan', factor: 0.255 },
      { frequency: 'Semesteran', factor: 0.505 },
      { frequency: 'Tahunan', factor: 1.0 }
    ]
  },
  {
    version: 'v2.1',
    status: 'Retired',
    effectiveDate: '01 Jan 2025 - 31 Des 2025',
    author: 'Tim Aktuaria PRAXIS',
    baseMortalityMultiplier: 1.05,
    ageBandMultipliers: [
      { range: '18 - 30 Tahun', factor: 1.05 },
      { range: '31 - 40 Tahun', factor: 1.30 },
      { range: '41 - 50 Tahun', factor: 1.70 },
      { range: '51 - 60 Tahun', factor: 2.40 }
    ],
    termDiscounts: [
      { term: 5, discountPercent: 0 },
      { term: 10, discountPercent: 4 },
      { term: 15, discountPercent: 8 },
      { term: 20, discountPercent: 12 }
    ],
    frequencySurcharges: [
      { frequency: 'Bulanan', factor: 0.092 },
      { frequency: 'Triwulanan', factor: 0.265 },
      { frequency: 'Semesteran', factor: 0.52 },
      { frequency: 'Tahunan', factor: 1.0 }
    ]
  }
];

export function calculateSimulation(
  product: Product,
  age: number,
  sumAssured: number,
  paymentTerm: number,
  frequency: PaymentFrequency
): SimulationResult {
  // Rule validations
  let isValid = true;
  let validationError: string | undefined = undefined;

  if (age < product.minAge || age > product.maxAge) {
    isValid = false;
    validationError = `Usia tertanggung harus antara ${product.minAge} sampai ${product.maxAge} tahun. Usia saat ini: ${age} tahun.`;
  } else if (sumAssured < product.minSumAssured) {
    isValid = false;
    validationError = `Uang pertanggungan minimum untuk ${product.name} adalah ${formatIDR(product.minSumAssured)}.`;
  } else if (sumAssured > product.maxSumAssured) {
    isValid = false;
    validationError = `Uang pertanggungan maksimum adalah ${formatIDR(product.maxSumAssured)}.`;
  } else if (!product.allowedPaymentTerms.includes(paymentTerm)) {
    isValid = false;
    validationError = `Masa pembayaran yang tersedia: ${product.allowedPaymentTerms.join(', ')} tahun.`;
  } else if (age + paymentTerm > 75) {
    isValid = false;
    validationError = `Kombinasi usia (${age} thn) + masa bayar (${paymentTerm} thn) melebihi batas usia maksimal 75 tahun. Mohon pilih masa bayar lebih pendek.`;
  }

  // Age factor calculation
  let ageFactor = 1.0;
  if (age <= 30) ageFactor = 1.0;
  else if (age <= 40) ageFactor = 1.0 + (age - 30) * 0.025; // up to 1.25
  else if (age <= 50) ageFactor = 1.25 + (age - 40) * 0.04; // up to 1.65
  else if (age <= 60) ageFactor = 1.65 + (age - 50) * 0.065; // up to 2.30
  else ageFactor = 2.30 + (age - 60) * 0.16;

  // Term factor calculation: shorter term = higher annual payment to complete in fewer years
  // 5 years pays more per year than 20 years
  const termFactor = (20 / paymentTerm) * 0.65 + 0.35;

  // Calculate annual base premium in IDR
  const millions = sumAssured / 1_000_000;
  const rawAnnual = millions * product.baseAnnualRatePerMillion * ageFactor * termFactor * 1000;
  // Round to thousands
  const annualPremium = Math.round(rawAnnual / 1000) * 1000;

  // Frequency factors
  const monthlyPremium = Math.round((annualPremium * 0.09) / 1000) * 1000;
  const quarterlyPremium = Math.round((annualPremium * 0.26) / 1000) * 1000;
  const semesterPremium = Math.round((annualPremium * 0.51) / 1000) * 1000;

  const totalEstimatedInvestment = annualPremium * paymentTerm;

  return {
    params: {
      productId: product.id,
      productSlug: product.slug,
      age,
      sumAssured,
      paymentTerm,
      frequency
    },
    monthlyPremium,
    quarterlyPremium,
    semesterPremium,
    annualPremium,
    totalEstimatedInvestment,
    isValid,
    validationError
  };
}

export const INITIAL_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-01',
    reference: 'PRX-2026-94812',
    submittedAt: '03 Sep 2026, 14:28 WIB',
    lastUpdated: '03 Sep 2026, 15:40 WIB',
    applicant: {
      fullName: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      phone: '+62 812-3456-7890',
      age: 34,
      city: 'Jakarta Selatan',
      preferredContactTime: 'Siang (13.00 - 17.00 WIB)',
      notes: 'Mohon hubungi via WhatsApp terlebih dahulu sebelum telepon untuk mencocokkan jadwal meeting.',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-1',
      slug: 'praxis-jiwa-utama',
      name: 'PRAXIS Jiwa Utama',
      categoryLabel: 'Proteksi Jiwa'
    },
    simulation: {
      params: {
        productId: 'prod-1',
        productSlug: 'praxis-jiwa-utama',
        age: 34,
        sumAssured: 1_000_000_000,
        paymentTerm: 10,
        frequency: 'Bulanan'
      },
      monthlyPremium: 2_150_000,
      quarterlyPremium: 6_210_000,
      semesterPremium: 12_180_000,
      annualPremium: 23_890_000,
      totalEstimatedInvestment: 238_900_000,
      isValid: true
    },
    hasSimulation: true,
    status: 'Under Review',
    assignedTo: 'Bobby Pratama',
    internalNotes: [
      {
        id: 'n-1',
        author: 'Bobby Pratama',
        role: 'Senior Underwriter',
        timestamp: '03 Sep 2026, 15:40 WIB',
        content: 'Data awal KTP terverifikasi valid di Dukcapil. Sudah dikirim pesan WhatsApp pengantar jadwal verifikasi via video call besok pagi.'
      }
    ],
    auditTrail: [
      {
        id: 'aud-1',
        timestamp: '03 Sep 2026, 14:28 WIB',
        actor: 'Sistem Publik (Web Lead)',
        action: 'Application Submitted',
        details: 'Formulir pengajuan digital diterima dari IP 180.252.88.14 (Jakarta).'
      },
      {
        id: 'aud-2',
        timestamp: '03 Sep 2026, 14:45 WIB',
        actor: 'Bambang Soedirman (Manager)',
        action: 'Assigned Owner',
        details: 'Ditugaskan ke Bobby Pratama (Senior Life Underwriter).'
      },
      {
        id: 'aud-3',
        timestamp: '03 Sep 2026, 15:40 WIB',
        actor: 'Bobby Pratama',
        action: 'Status Changed to Under Review',
        details: 'Status diubah dari Submitted menjadi Under Review.'
      }
    ]
  },
  {
    id: 'app-02',
    reference: 'PRX-2026-94811',
    submittedAt: '03 Sep 2026, 11:15 WIB',
    lastUpdated: '03 Sep 2026, 11:15 WIB',
    applicant: {
      fullName: 'Siti Rahmawati',
      email: 'siti.rahma@permatagroup.co.id',
      phone: '+62 813-9876-5432',
      age: 29,
      city: 'Surabaya',
      preferredContactTime: 'Pagi (09.00 - 12.00 WIB)',
      notes: 'Tertarik dengan tambahan proteksi kondisi kritis jika memungkinkan.',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-2',
      slug: 'praxis-sehat-mandiri',
      name: 'PRAXIS Sehat Mandiri',
      categoryLabel: 'Penyakit Kritis & Rawat'
    },
    simulation: {
      params: {
        productId: 'prod-2',
        productSlug: 'praxis-sehat-mandiri',
        age: 29,
        sumAssured: 500_000_000,
        paymentTerm: 15,
        frequency: 'Bulanan'
      },
      monthlyPremium: 1_280_000,
      quarterlyPremium: 3_700_000,
      semesterPremium: 7_250_000,
      annualPremium: 14_220_000,
      totalEstimatedInvestment: 213_300_000,
      isValid: true
    },
    hasSimulation: true,
    status: 'Submitted',
    assignedTo: undefined,
    internalNotes: [],
    auditTrail: [
      {
        id: 'aud-4',
        timestamp: '03 Sep 2026, 11:15 WIB',
        actor: 'Sistem Publik (Web Lead)',
        action: 'Application Submitted',
        details: 'Aplikasi baru masuk via kampanye Sehat Mandiri Digital.'
      }
    ]
  },
  {
    id: 'app-03',
    reference: 'PRX-2026-94789',
    submittedAt: '02 Sep 2026, 16:50 WIB',
    lastUpdated: '03 Sep 2026, 09:30 WIB',
    applicant: {
      fullName: 'Hendra Wijaya Kusumah',
      email: 'hendra.kusumah@wijayatech.com',
      phone: '+62 811-2233-4455',
      age: 42,
      city: 'Bandung',
      preferredContactTime: 'Malam (19.00 - 21.00 WIB)',
      notes: 'Rencana warisan anak pertama dan kedua.',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-3',
      slug: 'praxis-warisan-pintar',
      name: 'PRAXIS Warisan Pintar',
      categoryLabel: 'Proteksi Keluarga'
    },
    simulation: {
      params: {
        productId: 'prod-3',
        productSlug: 'praxis-warisan-pintar',
        age: 42,
        sumAssured: 2_000_000_000,
        paymentTerm: 10,
        frequency: 'Tahunan'
      },
      monthlyPremium: 5_200_000,
      quarterlyPremium: 15_020_000,
      semesterPremium: 29_480_000,
      annualPremium: 57_800_000,
      totalEstimatedInvestment: 578_000_000,
      isValid: true
    },
    hasSimulation: true,
    status: 'Approved',
    assignedTo: 'Sarah Wijaya',
    internalNotes: [
      {
        id: 'n-2',
        author: 'Sarah Wijaya',
        role: 'Senior Underwriter',
        timestamp: '03 Sep 2026, 09:30 WIB',
        content: 'Medical check-up standard clear. SPAJ ditandatangani digital dengan PrivyID. Siap lanjut ke penerbitan e-Polis.'
      }
    ],
    auditTrail: [
      {
        id: 'aud-5',
        timestamp: '02 Sep 2026, 16:50 WIB',
        actor: 'Sistem Publik',
        action: 'Application Submitted',
        details: 'Aplikasi masuk dari portal web.'
      },
      {
        id: 'aud-6',
        timestamp: '03 Sep 2026, 08:10 WIB',
        actor: 'Sarah Wijaya',
        action: 'Status Changed to Under Review',
        details: 'Mulai proses verifikasi finansial dan dokumen identitas.'
      },
      {
        id: 'aud-7',
        timestamp: '03 Sep 2026, 09:30 WIB',
        actor: 'Sarah Wijaya',
        action: 'Status Changed to Approved',
        details: 'Disetujui tanpa pembobotan risiko (Standard Issue).'
      }
    ]
  },
  {
    id: 'app-04',
    reference: 'PRX-2026-94650',
    submittedAt: '01 Sep 2026, 10:20 WIB',
    lastUpdated: '02 Sep 2026, 14:15 WIB',
    applicant: {
      fullName: 'Dian Permata Sari',
      email: 'dian.permata@ymail.com',
      phone: '+62 818-7654-3210',
      age: 28,
      city: 'Tangerang Selatan',
      preferredContactTime: 'Pagi (09.00 - 12.00 WIB)',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-4',
      slug: 'praxis-cendekia',
      name: 'PRAXIS Cendekia',
      categoryLabel: 'Dana Pendidikan'
    },
    simulation: {
      params: {
        productId: 'prod-4',
        productSlug: 'praxis-cendekia',
        age: 28,
        sumAssured: 300_000_000,
        paymentTerm: 10,
        frequency: 'Bulanan'
      },
      monthlyPremium: 890_000,
      quarterlyPremium: 2_570_000,
      semesterPremium: 5_040_000,
      annualPremium: 9_880_000,
      totalEstimatedInvestment: 98_800_000,
      isValid: true
    },
    hasSimulation: true,
    status: 'Under Review',
    assignedTo: 'Dewi Anggraeni',
    internalNotes: [
      {
        id: 'n-3',
        author: 'Dewi Anggraeni',
        role: 'Tele-Consultant',
        timestamp: '02 Sep 2026, 14:15 WIB',
        content: 'Sudah kontak via telp. Nasabah ingin konsultasi simulasi jadwal tahapan masuk SD dan SMP anak (saat ini usia anak 2 tahun).'
      }
    ],
    auditTrail: [
      {
        id: 'aud-8',
        timestamp: '01 Sep 2026, 10:20 WIB',
        actor: 'Sistem Publik',
        action: 'Application Submitted',
        details: 'Aplikasi pengajuan dana pendidikan online diterima.'
      },
      {
        id: 'aud-9',
        timestamp: '02 Sep 2026, 14:00 WIB',
        actor: 'Dewi Anggraeni',
        action: 'Status Changed to Under Review',
        details: 'Sedang penyesuaian jadwal konsultasi daring.'
      }
    ]
  },
  {
    id: 'app-05',
    reference: 'PRX-2026-94520',
    submittedAt: '30 Agu 2026, 15:10 WIB',
    lastUpdated: '31 Agu 2026, 11:20 WIB',
    applicant: {
      fullName: 'Agus Triyono',
      email: 'agus.tri@indomail.com',
      phone: '+62 856-1122-3344',
      age: 63,
      city: 'Semarang',
      preferredContactTime: 'Siang (13.00 - 17.00 WIB)',
      notes: 'Mencoba mengajukan asuransi jiwa untuk perlindungan usaha kargo.',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-1',
      slug: 'praxis-jiwa-utama',
      name: 'PRAXIS Jiwa Utama',
      categoryLabel: 'Proteksi Jiwa'
    },
    simulation: {
      params: {
        productId: 'prod-1',
        productSlug: 'praxis-jiwa-utama',
        age: 63,
        sumAssured: 500_000_000,
        paymentTerm: 15,
        frequency: 'Tahunan'
      },
      monthlyPremium: 2_950_000,
      quarterlyPremium: 8_520_000,
      semesterPremium: 16_700_000,
      annualPremium: 32_750_000,
      totalEstimatedInvestment: 491_250_000,
      isValid: false
    },
    hasSimulation: true,
    status: 'Rejected',
    assignedTo: 'Sarah Wijaya',
    rejectionReason: 'Batas Usia Tertanggung Melebihi Ketentuan Produk: Usia masuk pemohon (63 tahun) ditambah masa bayar 15 tahun melebihi batas maturitas polis maksimal 75 tahun.',
    internalNotes: [
      {
        id: 'n-4',
        author: 'Sarah Wijaya',
        role: 'Senior Underwriter',
        timestamp: '31 Agu 2026, 11:20 WIB',
        content: 'Calon tertanggung melebihi ambang batas usia underwriting otomatis. Disarankan untuk menawarkan produk khusus PRAXIS Senior Legacy bila dibuka kuartal depan.'
      }
    ],
    auditTrail: [
      {
        id: 'aud-10',
        timestamp: '30 Agu 2026, 15:10 WIB',
        actor: 'Sistem Publik',
        action: 'Application Submitted',
        details: 'Aplikasi masuk via kalkulator simulasi.'
      },
      {
        id: 'aud-11',
        timestamp: '31 Agu 2026, 11:20 WIB',
        actor: 'Sarah Wijaya',
        action: 'Status Changed to Rejected',
        details: 'Ditolak dengan alasan: Batas Usia Tertanggung Melebihi Ketentuan Produk.'
      }
    ]
  },
  {
    id: 'app-06',
    reference: 'PRX-2026-94410',
    submittedAt: '28 Agu 2026, 09:45 WIB',
    lastUpdated: '29 Agu 2026, 16:30 WIB',
    applicant: {
      fullName: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@syariahint.org',
      phone: '+62 821-4455-6677',
      age: 38,
      city: 'Medan',
      preferredContactTime: 'Pagi (09.00 - 12.00 WIB)',
      notes: 'Memastikan investasi sepenuhnya pada instrumen sukuk negara syariah.',
      dataConsent: true
    },
    productSnapshot: {
      id: 'prod-6',
      slug: 'praxis-investa-syariah',
      name: 'PRAXIS Investa Syariah',
      categoryLabel: 'Unit Link Syariah'
    },
    simulation: {
      params: {
        productId: 'prod-6',
        productSlug: 'praxis-investa-syariah',
        age: 38,
        sumAssured: 750_000_000,
        paymentTerm: 15,
        frequency: 'Bulanan'
      },
      monthlyPremium: 1_850_000,
      quarterlyPremium: 5_340_000,
      semesterPremium: 10_480_000,
      annualPremium: 20_550_000,
      totalEstimatedInvestment: 308_250_000,
      isValid: true
    },
    hasSimulation: true,
    status: 'Approved',
    assignedTo: 'Bobby Pratama',
    internalNotes: [
      {
        id: 'n-5',
        author: 'Bobby Pratama',
        role: 'Senior Underwriter',
        timestamp: '29 Agu 2026, 16:30 WIB',
        content: 'Alokasi portofolio sukuk dikonfirmasi. Akad Tabarru dan Wakalah bil Ujrah disetujui pemohon.'
      }
    ],
    auditTrail: [
      {
        id: 'aud-12',
        timestamp: '28 Agu 2026, 09:45 WIB',
        actor: 'Sistem Publik',
        action: 'Application Submitted',
        details: 'Aplikasi asuransi syariah online diterima.'
      },
      {
        id: 'aud-13',
        timestamp: '29 Agu 2026, 16:30 WIB',
        actor: 'Bobby Pratama',
        action: 'Status Changed to Approved',
        details: 'Disetujui. Notifikasi konfirmasi diteruskan ke nasabah via email.'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '03 Sep 2026, 15:40:12 WIB',
    actor: 'Bobby Pratama',
    actorRole: 'Senior Underwriter',
    action: 'STATUS_UPDATE',
    entityType: 'Application',
    entityId: 'PRX-2026-94812',
    description: 'Mengubah status pengajuan Budi Santoso dari Submitted menjadi Under Review.',
    ipAddress: '10.14.20.105'
  },
  {
    id: 'log-2',
    timestamp: '03 Sep 2026, 14:45:04 WIB',
    actor: 'Bambang Soedirman',
    actorRole: 'Underwriter Manager',
    action: 'ASSIGNMENT',
    entityType: 'Application',
    entityId: 'PRX-2026-94812',
    description: 'Menugaskan pengajuan Budi Santoso kepada Bobby Pratama.',
    ipAddress: '10.14.20.101'
  },
  {
    id: 'log-3',
    timestamp: '03 Sep 2026, 11:15:22 WIB',
    actor: 'Public Web Guest',
    actorRole: 'Visitor',
    action: 'APPLICATION_CREATED',
    entityType: 'Application',
    entityId: 'PRX-2026-94811',
    description: 'Pengajuan baru Siti Rahmawati berhasil dikirimkan via simulasi PRAXIS Sehat Mandiri.',
    ipAddress: '180.252.14.92'
  },
  {
    id: 'log-4',
    timestamp: '03 Sep 2026, 09:30:18 WIB',
    actor: 'Sarah Wijaya',
    actorRole: 'Senior Underwriter',
    action: 'STATUS_UPDATE',
    entityType: 'Application',
    entityId: 'PRX-2026-94789',
    description: 'Menyetujui pengajuan Hendra Wijaya Kusumah (Approved). Catatan medis bersih.',
    ipAddress: '10.14.20.108'
  },
  {
    id: 'log-5',
    timestamp: '02 Sep 2026, 16:15:00 WIB',
    actor: 'Sarah Wijaya',
    actorRole: 'Senior Underwriter',
    action: 'RULE_DRAFT_CREATED',
    entityType: 'SimulationRule',
    entityId: 'v2.4',
    description: 'Membuat draft versi aturan simulasi aktuaria v2.4 dengan penyesuaian diskon masa bayar.',
    ipAddress: '10.14.20.108'
  },
  {
    id: 'log-6',
    timestamp: '01 Sep 2026, 14:20:11 WIB',
    actor: 'Bambang Soedirman',
    actorRole: 'Underwriter Manager',
    action: 'PRODUCT_CMS_UPDATE',
    entityType: 'Product',
    entityId: 'prod-1',
    description: 'Memperbarui dokumen RIPLAY versi 2026 pada produk PRAXIS Jiwa Utama.',
    ipAddress: '10.14.20.101'
  }
];

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
