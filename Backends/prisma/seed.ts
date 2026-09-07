/* eslint-disable no-console */
import {
  PrismaClient,
  ProductCategory,
  DocumentType,
  RuleVersionStatus,
  PaymentFrequency,
  ApplicationStatus,
  ContactTime,
  StaffRole,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const SIMULATION_DISCLAIMER =
  'Angka ini adalah ilustrasi awal, bukan penawaran mengikat. Premi final ditentukan melalui proses underwriting resmi.';

// ---------------------------------------------------------------------------
// Small parsing helpers for the Indonesian-formatted strings baked into the
// frontend's mock data (../Frontends/src/data/mockData.ts).
// ---------------------------------------------------------------------------

const ID_MONTHS: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  Mei: '05',
  Jun: '06',
  Jul: '07',
  Agu: '08',
  Sep: '09',
  Okt: '10',
  Nov: '11',
  Des: '12',
};

/** Parses "DD Mon YYYY, HH:mm[:ss] WIB" (Asia/Jakarta, UTC+7, no DST). */
function parseWIB(input: string): Date {
  const match = input.match(
    /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) {
    throw new Error(`Cannot parse WIB timestamp: "${input}"`);
  }
  const [, dd, mon, yyyy, hh, mi, ss] = match;
  const month = ID_MONTHS[mon];
  if (!month) {
    throw new Error(`Unknown Indonesian month abbreviation: "${mon}"`);
  }
  return new Date(`${yyyy}-${month}-${dd}T${hh}:${mi}:${ss ?? '00'}+07:00`);
}

function contactTimeFromMock(text: string): ContactTime {
  if (text.startsWith('Pagi')) return ContactTime.MORNING;
  if (text.startsWith('Siang')) return ContactTime.AFTERNOON;
  if (text.startsWith('Malam')) return ContactTime.EVENING;
  throw new Error(`Unknown preferredContactTime string: "${text}"`);
}

function applicationStatusFromMock(status: string): ApplicationStatus {
  switch (status) {
    case 'Submitted':
      return ApplicationStatus.SUBMITTED;
    case 'Under Review':
      return ApplicationStatus.UNDER_REVIEW;
    case 'Approved':
      return ApplicationStatus.APPROVED;
    case 'Rejected':
      return ApplicationStatus.REJECTED;
    default:
      throw new Error(`Unknown application status string: "${status}"`);
  }
}

const CATEGORY_MAP: Record<string, ProductCategory> = {
  life: ProductCategory.LIFE,
  family: ProductCategory.FAMILY,
  'critical-illness': ProductCategory.CRITICAL_ILLNESS,
  education: ProductCategory.EDUCATION,
  savings: ProductCategory.SAVINGS,
  investment: ProductCategory.INVESTMENT,
};

const DOCUMENT_TYPE_MAP: Record<string, DocumentType> = {
  RIPLAY: DocumentType.RIPLAY,
  Brosur: DocumentType.BROCHURE,
  'Ketentuan Umum': DocumentType.TERMS,
  'Polis Contoh': DocumentType.OTHER,
};

const FREQUENCY_MAP: Record<string, PaymentFrequency> = {
  Bulanan: PaymentFrequency.MONTHLY,
  Triwulanan: PaymentFrequency.QUARTERLY,
  Semesteran: PaymentFrequency.SEMI_ANNUAL,
  Tahunan: PaymentFrequency.ANNUAL,
};

// ---------------------------------------------------------------------------
// Simulation rule config (translated from INITIAL_SIMULATION_RULES[0], the
// "v2.3 / Active" entry). The mock models this as one global/shared rule set
// (its SimulationRuleVersion type has no productId), so every product gets
// its own version:1/ACTIVE row seeded from the same base config, with
// termMultipliers filtered down to that product's own allowedPaymentTerms
// per the spec.
// ---------------------------------------------------------------------------

function parseAgeBandRange(range: string, factor: number) {
  const match = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    throw new Error(`Cannot parse age band range: "${range}"`);
  }
  return { min: Number(match[1]), max: Number(match[2]), factor };
}

const V2_3_AGE_BANDS = [
  { range: '18 - 30 Tahun', factor: 1.0 },
  { range: '31 - 40 Tahun', factor: 1.25 },
  { range: '41 - 50 Tahun', factor: 1.65 },
  { range: '51 - 60 Tahun', factor: 2.3 },
  { range: '61 - 65 Tahun', factor: 3.1 },
].map((b) => parseAgeBandRange(b.range, b.factor));

const V2_3_TERM_DISCOUNTS = [
  { term: 5, discountPercent: 0 },
  { term: 10, discountPercent: 5 },
  { term: 15, discountPercent: 9 },
  { term: 20, discountPercent: 14 },
];

const V2_3_FREQUENCY_FACTORS = {
  MONTHLY: 0.09, // Bulanan
  QUARTERLY: 0.26, // Triwulanan
  SEMI_ANNUAL: 0.51, // Semesteran
  ANNUAL: 1.0, // Tahunan
};

function buildFormulaConfig(allowedPaymentTerms: number[]) {
  const termMultipliers = allowedPaymentTerms.map((term) => {
    const discount = V2_3_TERM_DISCOUNTS.find((d) => d.term === term);
    const multiplier = discount ? 1 - discount.discountPercent / 100 : 1.0;
    return { term, multiplier };
  });

  return {
    maxAgePlusTerm: 75,
    ageBands: V2_3_AGE_BANDS,
    termMultipliers,
    frequencyFactors: V2_3_FREQUENCY_FACTORS,
  };
}

// ---------------------------------------------------------------------------
// Products (translated from INITIAL_PRODUCTS in ../Frontends/src/data/mockData.ts)
// ---------------------------------------------------------------------------

interface SeedProductBenefit {
  title: string;
  description: string;
  iconName?: string;
}

interface SeedProductCoverageDetail {
  category: string;
  benefit: string;
  maximumPayout: string;
  notes?: string;
}

interface SeedProductDocument {
  name: string;
  type: string;
  size?: string;
}

interface SeedProduct {
  mockId: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  categoryLabel: string;
  summary: string;
  targetAudience: string[];
  minAge: number;
  maxAge: number;
  minSumAssured: number;
  maxSumAssured: number;
  allowedPaymentTerms: number[];
  coverageDurationYears: number;
  baseAnnualRatePerMillion: number;
  badge?: string;
  colorTone?: string;
  keyBenefits: SeedProductBenefit[];
  coverageDetails: SeedProductCoverageDetail[];
  eligibilityConditions: string[];
  documents: SeedProductDocument[];
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    mockId: 'prod-1',
    slug: 'praxis-jiwa-utama',
    name: 'PRAXIS Jiwa Utama',
    tagline:
      'Proteksi jiwa komprehensif seumur hidup dengan garansi kepastian finansial keluarga.',
    category: 'life',
    categoryLabel: 'Proteksi Jiwa',
    summary:
      'Perlindungan finansial penuh bagi keluarga tercinta hingga usia 99 tahun. Memberikan santunan tunai pasti atas risiko tutup usia dengan pilihan masa bayar yang fleksibel.',
    targetAudience: [
      'Pencari nafkah utama keluarga yang menginginkan ketenangan pikiran.',
      'Profesional muda yang ingin mengunci premi murah sejak dini.',
      'Kepala keluarga yang merencanakan proteksi warisan tanpa risiko sengketa.',
    ],
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 5_000_000_000,
    allowedPaymentTerms: [5, 10, 15, 20],
    coverageDurationYears: 99,
    baseAnnualRatePerMillion: 18.5,
    badge: 'Paling Populer',
    colorTone: '#0A3641',
    keyBenefits: [
      {
        title: '100% Uang Pertanggungan Tunai',
        description:
          'Santunan cair utuh kepada ahli waris bebas pajak penghasilan saat terjadi risiko tutup usia.',
        iconName: 'ShieldCheck',
      },
      {
        title: 'Pilihan Masa Bayar Fleksibel',
        description:
          'Cukup bayar selama 5, 10, 15, atau 20 tahun untuk proteksi perlindungan seumur hidup hingga usia 99 tahun.',
        iconName: 'CalendarClock',
      },
      {
        title: 'Bebas Biaya Administrasi Tambahan',
        description:
          'Premi tetap (flat) selama masa pembayaran yang dipilih, tanpa kenaikan akibat inflasi usia.',
        iconName: 'Coins',
      },
      {
        title: 'Klaim Digital Cepat & Didampingi',
        description:
          'Layanan klaim darurat 24/7 dengan rasio penyelesaian klaim 99,2% dan dedicated claims officer.',
        iconName: 'Headphones',
      },
    ],
    coverageDetails: [
      {
        category: 'Manfaat Utama',
        benefit: 'Meninggal Dunia karena Sakit atau Alami',
        maximumPayout: '100% Uang Pertanggungan',
        notes: 'Cair ke Penerima Manfaat resmi tanpa potongan biaya materai/admin.',
      },
      {
        category: 'Manfaat Utama',
        benefit: 'Meninggal Dunia Akibat Kecelakaan',
        maximumPayout: '200% Uang Pertanggungan',
        notes: 'Santunan ganda langsung cair apabila terjadi kecelakaan lalu lintas atau umum.',
      },
      {
        category: 'Manfaat Tambahan (Rider Opsional)',
        benefit: 'Pembebasan Premi (Waiver of Premium)',
        maximumPayout: '100% Bebas Sisa Premi',
        notes: 'Jika terdiagnosa cacat total tetap atau kondisi kritis tertentu.',
      },
      {
        category: 'Nilai Tunai',
        benefit: 'Nilai Tunai Garansi di Akhir Masa Polis',
        maximumPayout: 'Sesuai Tabel Garansi Polis',
        notes: 'Apabila tertanggung bertahan hidup hingga usia 99 tahun.',
      },
    ],
    eligibilityConditions: [
      'Warga Negara Indonesia (WNI) atau WNA pemegang KITAS/KITAP resmi.',
      'Usia masuk tertanggung 18 hingga 60 tahun (ulang tahun terdekat).',
      'Kondisi kesehatan standar (non-substandard) saat mengisi deklarasi kesehatan awal.',
      'Memiliki KTP / identitas resmi yang masih berlaku dan rekening bank terdaftar di Indonesia.',
    ],
    documents: [
      {
        name: 'RIPLAY (Ringkasan Informasi Produk dan Layanan Versi Umum)',
        type: 'RIPLAY',
        size: '1.4 MB',
      },
      { name: 'Brosur Resmi PRAXIS Jiwa Utama 2026', type: 'Brosur', size: '2.8 MB' },
      { name: 'Ketentuan Polis Standar & Pengecualian', type: 'Ketentuan Umum', size: '890 KB' },
    ],
  },
  {
    mockId: 'prod-2',
    slug: 'praxis-sehat-mandiri',
    name: 'PRAXIS Sehat Mandiri',
    tagline:
      'Perlindungan penyakit kritis tahap awal hingga akhir dengan fasilitas cashless rumah sakit.',
    category: 'critical-illness',
    categoryLabel: 'Penyakit Kritis & Rawat',
    summary:
      'Solusi finansial tangguh menghadapi 68 kondisi kritis (kanker, stroke, jantung) dengan santunan tunai cepat tanpa harus menunggu kuitansi rumah sakit lunas.',
    targetAudience: [
      'Profesional aktif yang memiliki risiko kelelahan dan gaya hidup urban.',
      'Individu dengan riwayat penyakit kritis dalam riwayat genetik keluarga.',
      'Pemilik bisnis yang ingin menjaga kelangsungan usaha saat sakit berkepanjangan.',
    ],
    minAge: 20,
    maxAge: 55,
    minSumAssured: 200_000_000,
    maxSumAssured: 3_000_000_000,
    allowedPaymentTerms: [10, 15, 20],
    coverageDurationYears: 75,
    baseAnnualRatePerMillion: 24.2,
    badge: 'Proteksi Kritis',
    colorTone: '#0E7E63',
    keyBenefits: [
      {
        title: 'Proteksi 68 Kondisi Kritis',
        description: 'Menanggung stadium awal (early stage), menengah, hingga komplikasi terminal.',
        iconName: 'HeartPulse',
      },
      {
        title: 'Santunan Tunai Sekaligus (Lump Sum)',
        description:
          'Dana langsung cair ke rekening pribadi untuk biaya hidup, second opinion, atau pengobatan alternatif.',
        iconName: 'Banknote',
      },
      {
        title: 'Bebas Premi Pasca Diagnosa',
        description:
          'Setelah klaim kondisi kritis disetujui, polis berlanjut tanpa perlu membayar premi lagi.',
        iconName: 'Sparkles',
      },
      {
        title: 'Jejaring RS Rekanan Global',
        description: 'Akses ke lebih dari 1.200 RS di Indonesia, Malaysia, dan Singapura.',
        iconName: 'Building2',
      },
    ],
    coverageDetails: [
      {
        category: 'Tahap Awal',
        benefit: 'Kanker Stadium Dini / Bedah Jantung Ringan',
        maximumPayout: '50% Uang Pertanggungan',
        notes: 'Dapat diklaim maksimal 2 kali untuk kondisi kritis berbeda.',
      },
      {
        category: 'Tahap Lanjut',
        benefit: 'Serangan Jantung, Kanker Ganas, Stroke Akut',
        maximumPayout: '100% Sisa Uang Pertanggungan',
        notes: 'Santunan tunai utuh tanpa perlu menyertakan rincian kuitansi biaya.',
      },
      {
        category: 'Manfaat Hidup',
        benefit: 'Tunjangan Pemulihan Pasca Rawat Inap',
        maximumPayout: 'Rp 15.000.000 / insiden',
        notes: 'Maksimal 1 kali per tahun polis.',
      },
    ],
    eligibilityConditions: [
      'Usia masuk 20 hingga 55 tahun.',
      'Masa tunggu (waiting period) 90 hari kalender sejak polis diterbitkan.',
      'Tidak memiliki riwayat diagnosa kondisi kritis sebelumnya.',
    ],
    documents: [
      { name: 'RIPLAY PRAXIS Sehat Mandiri', type: 'RIPLAY', size: '1.2 MB' },
      {
        name: 'Daftar 68 Penyakit Kritis & Kriteria Diagnosa Medis',
        type: 'Ketentuan Umum',
        size: '1.9 MB',
      },
    ],
  },
  {
    mockId: 'prod-3',
    slug: 'praxis-warisan-pintar',
    name: 'PRAXIS Warisan Pintar',
    tagline: 'Perencanaan transfer kekayaan keluarga terstruktur dengan jaminan kepastian hukum.',
    category: 'family',
    categoryLabel: 'Proteksi Keluarga',
    summary:
      "Mempersiapkan warisan tunai bebas sengketa untuk anak dan cucu dengan perlindungan multigenerasi serta alokasi penerima manfaat proporsional.",
    targetAudience: [
      'Orang tua yang ingin menjamin kemandirian finansial anak di masa depan.',
      'Keluarga yang memiliki aset properti dan memerlukan likuiditas tunai untuk pajak waris.',
      'Pengusaha yang ingin mendistribusikan aset secara terencana.',
    ],
    minAge: 25,
    maxAge: 65,
    minSumAssured: 500_000_000,
    maxSumAssured: 10_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 99,
    baseAnnualRatePerMillion: 28.0,
    badge: 'Solusi Waris',
    colorTone: '#1E3A8A',
    keyBenefits: [
      {
        title: 'Penetapan Ahli Waris Terproteksi',
        description:
          'Uang pertanggungan langsung ke nama ahli waris tanpa melalui proses pengadilan hak waris.',
        iconName: 'Users',
      },
      {
        title: 'Likuiditas Cepat & Pasti',
        description: 'Cair dalam 7 hari kerja setelah dokumen klaim lengkap diterima.',
        iconName: 'Zap',
      },
      {
        title: 'Fleksibilitas Mata Uang',
        description:
          'Tersedia dalam Rupiah (IDR) dan US Dollar (USD) untuk proteksi diversifikasi.',
        iconName: 'Globe',
      },
    ],
    coverageDetails: [
      {
        category: 'Manfaat Waris',
        benefit: 'Santunan Meninggal Dunia Garansi',
        maximumPayout: '100% Uang Pertanggungan + Nilai Tunai',
        notes: 'Diberikan penuh kepada nama anak/ahli waris terpilih.',
      },
    ],
    eligibilityConditions: [
      'Usia masuk pemegang polis & tertanggung 25 - 65 tahun.',
      'Melampirkan kartu keluarga dan akta kelahiran ahli waris saat verifikasi lanjutan.',
    ],
    documents: [{ name: 'RIPLAY PRAXIS Warisan Pintar', type: 'RIPLAY', size: '1.1 MB' }],
  },
  {
    mockId: 'prod-4',
    slug: 'praxis-cendekia',
    name: 'PRAXIS Cendekia',
    tagline: 'Kepastian dana pendidikan tinggi putra-putri tercinta di setiap jenjang akademis.',
    category: 'education',
    categoryLabel: 'Dana Pendidikan',
    summary:
      'Program perlindungan dwiguna pendidikan dengan tahapan dana pasti saat anak masuk SMP, SMA, dan Universitas, terlepas dari apa pun risiko yang terjadi pada orang tua.',
    targetAudience: [
      'Orang tua dengan anak usia 0 hingga 10 tahun.',
      'Keluarga yang mengantisipasi inflasi biaya pendidikan 10-15% per tahun.',
    ],
    minAge: 21,
    maxAge: 50,
    minSumAssured: 150_000_000,
    maxSumAssured: 2_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 22,
    baseAnnualRatePerMillion: 32.5,
    badge: 'Garansi Sekolah',
    colorTone: '#7C3AED',
    keyBenefits: [
      {
        title: 'Tahapan Dana Pasti di Tiap Jenjang',
        description: 'Pencairan dana garansi berkala saat anak berusia 12, 15, dan 18 tahun.',
        iconName: 'GraduationCap',
      },
      {
        title: 'Proteksi Ganda Orang Tua & Anak',
        description:
          'Jika orang tua tutup usia, sisa setoran premi otomatis gratis dan dana pendidikan tetap cair sesuai jadwal.',
        iconName: 'ShieldAlert',
      },
    ],
    coverageDetails: [
      {
        category: 'Tahapan Belajar',
        benefit: 'Tahapan Masuk Perguruan Tinggi',
        maximumPayout: '50% Total Uang Pertanggungan',
        notes: 'Dicairkan tepat saat anak berusia 18 tahun.',
      },
    ],
    eligibilityConditions: [
      'Usia orang tua (pemegang polis): 21 - 50 tahun.',
      'Usia anak (tertanggung): 30 hari - 10 tahun.',
    ],
    documents: [{ name: 'RIPLAY PRAXIS Cendekia', type: 'RIPLAY', size: '1.5 MB' }],
  },
  {
    mockId: 'prod-5',
    slug: 'praxis-dana-sejahtera',
    name: 'PRAXIS Dana Sejahtera',
    tagline: 'Akumulasi dana terukur dengan imbal hasil garansi dan bonus loyalitas berkala.',
    category: 'savings',
    categoryLabel: 'Tabungan Berjangka',
    summary:
      'Rencana simpanan terstruktur dengan kepastian imbal hasil di atas rata-rata deposito serta perlindungan jiwa melekat selama masa kepesertaan.',
    targetAudience: [
      'Profesional yang mencari instrumen konservatif rendah risiko.',
      'Calon pensiunan yang ingin memastikan arus kas stabil di hari tua.',
    ],
    minAge: 20,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 3_000_000_000,
    allowedPaymentTerms: [5, 10],
    coverageDurationYears: 20,
    baseAnnualRatePerMillion: 26.0,
    badge: 'Garansi Bonus',
    colorTone: '#D97706',
    keyBenefits: [
      {
        title: 'Tingkat Hasil Pasti Tertera di Polis',
        description: 'Bebas dari fluktuasi pasar saham, nilai dana dijamin secara kontraktual.',
        iconName: 'TrendingUp',
      },
      {
        title: 'Bonus Loyalitas Tiap 3 Tahun',
        description:
          'Tambahan persentase dana tunai bagi pemegang polis yang disiplin membayar premi.',
        iconName: 'Gift',
      },
    ],
    coverageDetails: [
      {
        category: 'Manfaat Tabungan',
        benefit: 'Pengembalian Premi 110% di Akhir Kontrak',
        maximumPayout: '110% dari akumulasi premi',
        notes: 'Jika tertanggung sehat hingga akhir masa pertanggungan 20 tahun.',
      },
    ],
    eligibilityConditions: ['Usia masuk 20 hingga 60 tahun.', 'Pilihan masa bayar 5 atau 10 tahun.'],
    documents: [{ name: 'RIPLAY PRAXIS Dana Sejahtera', type: 'RIPLAY', size: '1.3 MB' }],
  },
  {
    mockId: 'prod-6',
    slug: 'praxis-investa-syariah',
    name: 'PRAXIS Investa Syariah',
    tagline: 'Perlindungan tolong-menolong berbasis prinsip syariah dengan pengelolaan dana halal.',
    category: 'investment',
    categoryLabel: 'Unit Link Syariah',
    summary:
      "Kombinasi proteksi tolong-menolong (tabarru') dengan instrumen sukuk dan saham syariah berprinsip amanah, diawasi oleh Dewan Pengawas Syariah (DPS).",
    targetAudience: [
      'Keluarga muslim modern yang mengutamakan kepatuhan syariah.',
      'Investor yang menginginkan diversifikasi portofolio etis & transparan.',
    ],
    minAge: 18,
    maxAge: 55,
    minSumAssured: 150_000_000,
    maxSumAssured: 4_000_000_000,
    allowedPaymentTerms: [10, 15, 20],
    coverageDurationYears: 80,
    baseAnnualRatePerMillion: 21.0,
    badge: 'Prinsip Syariah',
    colorTone: '#059669',
    keyBenefits: [
      {
        title: "Akad Tabarru' Bebas Riba & Gharar",
        description:
          'Sistem tolong-menolong antar nasabah yang sah secara syariah dan regulasi DSN-MUI.',
        iconName: 'Scale',
      },
      {
        title: 'Surplus Underwriting Berbagi Berkah',
        description:
          'Potensi pembagian keuntungan underwriting jika klaim risiko dalam portofolio sehat.',
        iconName: 'HandCoins',
      },
    ],
    coverageDetails: [
      {
        category: "Dana Tabarru'",
        benefit: 'Santunan Tutup Usia Syariah',
        maximumPayout: '100% Uang Pertanggungan + Nilai Saldo Investasi',
        notes: "Dikelola secara transparan dalam Rekening Tabarru' terpisah.",
      },
    ],
    eligibilityConditions: [
      'Terbuka untuk seluruh masyarakat Indonesia tanpa memandang latar belakang.',
      'Usia masuk 18 - 55 tahun.',
    ],
    documents: [{ name: 'RIPLAY & Surat Rekomendasi DPS MUI', type: 'RIPLAY', size: '1.7 MB' }],
  },
];

// ---------------------------------------------------------------------------
// Staff users (translated from INITIAL_STAFF)
// ---------------------------------------------------------------------------

interface SeedUser {
  email: string;
  fullName: string;
  role: StaffRole;
  department: string;
  managerName?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'bambang.soedirman@praxis.co.id',
    fullName: 'Bambang Soedirman',
    role: StaffRole.UNDERWRITER_MANAGER,
    department: 'Underwriting & Risk Governance',
  },
  {
    email: 'sarah.wijaya@praxis.co.id',
    fullName: 'Sarah Wijaya',
    role: StaffRole.SENIOR_UNDERWRITER,
    department: 'Life & Medical Assessment',
    managerName: 'Bambang Soedirman',
  },
  {
    email: 'bobby.pratama@praxis.co.id',
    fullName: 'Bobby Pratama',
    role: StaffRole.SENIOR_UNDERWRITER,
    department: 'Wealth & Legacy Solutions',
    managerName: 'Bambang Soedirman',
  },
  {
    email: 'dewi.anggraeni@praxis.co.id',
    fullName: 'Dewi Anggraeni',
    role: StaffRole.TELE_CONSULTANT,
    department: 'Digital Lead Qualification',
    managerName: 'Bambang Soedirman',
  },
  {
    email: 'rangga.pradipta@praxis.co.id',
    fullName: 'Rangga Pradipta',
    role: StaffRole.UNDERWRITER,
    department: 'Life & Medical Assessment',
    managerName: 'Sarah Wijaya',
  },
  {
    email: 'admin@praxis.co.id',
    fullName: 'PRAXIS Admin',
    role: StaffRole.ADMIN,
    department: 'System Administration',
  },
  {
    email: 'citra.aditama@praxis.co.id',
    fullName: 'Citra Aditama',
    role: StaffRole.AUDITOR,
    department: 'Compliance & Internal Audit',
    // Independent compliance function, deliberately not under the
    // underwriting manager's reporting line.
  },
];

// ---------------------------------------------------------------------------
// Sample applications (translated from INITIAL_APPLICATIONS)
// ---------------------------------------------------------------------------

interface SeedStatusEvent {
  timestamp: string;
  toStatus: ApplicationStatus;
  actorName: string;
  comment?: string;
}

interface SeedNote {
  authorName: string;
  timestamp: string;
  content: string;
}

interface SeedApplication {
  productMockId: string;
  reference: string;
  submittedAt: string;
  lastUpdated: string;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    city: string;
    preferredContactTime: string;
    notes?: string;
  };
  simulation: {
    age: number;
    sumAssured: number;
    paymentTerm: number;
    frequency: string;
    monthlyPremium: number;
    quarterlyPremium: number;
    semesterPremium: number;
    annualPremium: number;
    totalEstimatedInvestment: number;
    isValid: boolean;
  };
  status: string;
  assignedToName?: string;
  rejectionReason?: string;
  notes: SeedNote[];
  statusEvents: SeedStatusEvent[];
}

const SEED_APPLICATIONS: SeedApplication[] = [
  {
    productMockId: 'prod-1',
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
      notes:
        'Mohon hubungi via WhatsApp terlebih dahulu sebelum telepon untuk mencocokkan jadwal meeting.',
    },
    simulation: {
      age: 34,
      sumAssured: 1_000_000_000,
      paymentTerm: 10,
      frequency: 'Bulanan',
      monthlyPremium: 2_150_000,
      quarterlyPremium: 6_210_000,
      semesterPremium: 12_180_000,
      annualPremium: 23_890_000,
      totalEstimatedInvestment: 238_900_000,
      isValid: true,
    },
    status: 'Under Review',
    assignedToName: 'Bobby Pratama',
    notes: [
      {
        authorName: 'Bobby Pratama',
        timestamp: '03 Sep 2026, 15:40 WIB',
        content:
          'Data awal KTP terverifikasi valid di Dukcapil. Sudah dikirim pesan WhatsApp pengantar jadwal verifikasi via video call besok pagi.',
      },
    ],
    statusEvents: [
      {
        timestamp: '03 Sep 2026, 15:40 WIB',
        toStatus: ApplicationStatus.UNDER_REVIEW,
        actorName: 'Bobby Pratama',
      },
    ],
  },
  {
    productMockId: 'prod-2',
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
    },
    simulation: {
      age: 29,
      sumAssured: 500_000_000,
      paymentTerm: 15,
      frequency: 'Bulanan',
      monthlyPremium: 1_280_000,
      quarterlyPremium: 3_700_000,
      semesterPremium: 7_250_000,
      annualPremium: 14_220_000,
      totalEstimatedInvestment: 213_300_000,
      isValid: true,
    },
    status: 'Submitted',
    notes: [],
    statusEvents: [],
  },
  {
    productMockId: 'prod-3',
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
    },
    simulation: {
      age: 42,
      sumAssured: 2_000_000_000,
      paymentTerm: 10,
      frequency: 'Tahunan',
      monthlyPremium: 5_200_000,
      quarterlyPremium: 15_020_000,
      semesterPremium: 29_480_000,
      annualPremium: 57_800_000,
      totalEstimatedInvestment: 578_000_000,
      isValid: true,
    },
    status: 'Approved',
    assignedToName: 'Sarah Wijaya',
    notes: [
      {
        authorName: 'Sarah Wijaya',
        timestamp: '03 Sep 2026, 09:30 WIB',
        content:
          'Medical check-up standard clear. SPAJ ditandatangani digital dengan PrivyID. Siap lanjut ke penerbitan e-Polis.',
      },
    ],
    statusEvents: [
      {
        timestamp: '03 Sep 2026, 08:10 WIB',
        toStatus: ApplicationStatus.UNDER_REVIEW,
        actorName: 'Sarah Wijaya',
      },
      {
        timestamp: '03 Sep 2026, 09:30 WIB',
        toStatus: ApplicationStatus.APPROVED,
        actorName: 'Sarah Wijaya',
      },
    ],
  },
  {
    productMockId: 'prod-4',
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
    },
    simulation: {
      age: 28,
      sumAssured: 300_000_000,
      paymentTerm: 10,
      frequency: 'Bulanan',
      monthlyPremium: 890_000,
      quarterlyPremium: 2_570_000,
      semesterPremium: 5_040_000,
      annualPremium: 9_880_000,
      totalEstimatedInvestment: 98_800_000,
      isValid: true,
    },
    status: 'Under Review',
    assignedToName: 'Dewi Anggraeni',
    notes: [
      {
        authorName: 'Dewi Anggraeni',
        timestamp: '02 Sep 2026, 14:15 WIB',
        content:
          'Sudah kontak via telp. Nasabah ingin konsultasi simulasi jadwal tahapan masuk SD dan SMP anak (saat ini usia anak 2 tahun).',
      },
    ],
    statusEvents: [
      {
        timestamp: '02 Sep 2026, 14:00 WIB',
        toStatus: ApplicationStatus.UNDER_REVIEW,
        actorName: 'Dewi Anggraeni',
      },
    ],
  },
  {
    productMockId: 'prod-1',
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
    },
    simulation: {
      age: 63,
      sumAssured: 500_000_000,
      paymentTerm: 15,
      frequency: 'Tahunan',
      // Deliberately NOT the frontend mock's premium figures: this run is
      // invalid (age 63 + term 15 = 78 > maxAgePlusTerm 75), and the real
      // engine's contract (see simulator/simulation.engine.ts) returns null
      // premiums whenever isValid is false. The mock's own record is
      // internally inconsistent here (it fills in premium numbers despite
      // isValid: false); we seed the corrected behaviour instead.
      monthlyPremium: 0,
      quarterlyPremium: 0,
      semesterPremium: 0,
      annualPremium: 0,
      totalEstimatedInvestment: 0,
      isValid: false,
    },
    status: 'Rejected',
    assignedToName: 'Sarah Wijaya',
    rejectionReason:
      'Batas Usia Tertanggung Melebihi Ketentuan Produk: Usia masuk pemohon (63 tahun) ditambah masa bayar 15 tahun melebihi batas maturitas polis maksimal 75 tahun.',
    notes: [
      {
        authorName: 'Sarah Wijaya',
        timestamp: '31 Agu 2026, 11:20 WIB',
        content:
          'Calon tertanggung melebihi ambang batas usia underwriting otomatis. Disarankan untuk menawarkan produk khusus PRAXIS Senior Legacy bila dibuka kuartal depan.',
      },
    ],
    statusEvents: [
      {
        timestamp: '31 Agu 2026, 11:20 WIB',
        toStatus: ApplicationStatus.REJECTED,
        actorName: 'Sarah Wijaya',
        comment:
          'Batas Usia Tertanggung Melebihi Ketentuan Produk: Usia masuk pemohon (63 tahun) ditambah masa bayar 15 tahun melebihi batas maturitas polis maksimal 75 tahun.',
      },
    ],
  },
  {
    productMockId: 'prod-6',
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
    },
    simulation: {
      age: 38,
      sumAssured: 750_000_000,
      paymentTerm: 15,
      frequency: 'Bulanan',
      monthlyPremium: 1_850_000,
      quarterlyPremium: 5_340_000,
      semesterPremium: 10_480_000,
      annualPremium: 20_550_000,
      totalEstimatedInvestment: 308_250_000,
      isValid: true,
    },
    status: 'Approved',
    assignedToName: 'Bobby Pratama',
    notes: [
      {
        authorName: 'Bobby Pratama',
        timestamp: '29 Agu 2026, 16:30 WIB',
        content:
          'Alokasi portofolio sukuk dikonfirmasi. Akad Tabarru dan Wakalah bil Ujrah disetujui pemohon.',
      },
    ],
    statusEvents: [
      {
        timestamp: '29 Agu 2026, 16:30 WIB',
        toStatus: ApplicationStatus.APPROVED,
        actorName: 'Bobby Pratama',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Top-level audit log (translated from INITIAL_AUDIT_LOGS). This is a
// separate, curated list from each application's own embedded auditTrail
// above - it seeds the admin Audit Log view, not per-application history.
// ---------------------------------------------------------------------------

interface SeedAuditLog {
  timestamp: string;
  actorName: string;
  action: string;
  entityType: 'Application' | 'SimulationRule' | 'Product';
  entityId: string;
  description: string;
  ipAddress: string;
}

const SEED_AUDIT_LOGS: SeedAuditLog[] = [
  {
    timestamp: '03 Sep 2026, 15:40:12 WIB',
    actorName: 'Bobby Pratama',
    action: 'STATUS_UPDATE',
    entityType: 'Application',
    entityId: 'PRX-2026-94812',
    description: 'Mengubah status pengajuan Budi Santoso dari Submitted menjadi Under Review.',
    ipAddress: '10.14.20.105',
  },
  {
    timestamp: '03 Sep 2026, 14:45:04 WIB',
    actorName: 'Bambang Soedirman',
    action: 'ASSIGNMENT',
    entityType: 'Application',
    entityId: 'PRX-2026-94812',
    description: 'Menugaskan pengajuan Budi Santoso kepada Bobby Pratama.',
    ipAddress: '10.14.20.101',
  },
  {
    timestamp: '03 Sep 2026, 11:15:22 WIB',
    actorName: 'Public Web Guest',
    action: 'APPLICATION_CREATED',
    entityType: 'Application',
    entityId: 'PRX-2026-94811',
    description:
      'Pengajuan baru Siti Rahmawati berhasil dikirimkan via simulasi PRAXIS Sehat Mandiri.',
    ipAddress: '180.252.14.92',
  },
  {
    timestamp: '03 Sep 2026, 09:30:18 WIB',
    actorName: 'Sarah Wijaya',
    action: 'STATUS_UPDATE',
    entityType: 'Application',
    entityId: 'PRX-2026-94789',
    description: 'Menyetujui pengajuan Hendra Wijaya Kusumah (Approved). Catatan medis bersih.',
    ipAddress: '10.14.20.108',
  },
  {
    timestamp: '02 Sep 2026, 16:15:00 WIB',
    actorName: 'Sarah Wijaya',
    action: 'RULE_DRAFT_CREATED',
    entityType: 'SimulationRule',
    entityId: 'v2.4',
    description:
      'Membuat draft versi aturan simulasi aktuaria v2.4 dengan penyesuaian diskon masa bayar.',
    ipAddress: '10.14.20.108',
  },
  {
    timestamp: '01 Sep 2026, 14:20:11 WIB',
    actorName: 'Bambang Soedirman',
    action: 'PRODUCT_CMS_UPDATE',
    entityType: 'Product',
    entityId: 'prod-1',
    description: 'Memperbarui dokumen RIPLAY versi 2026 pada produk PRAXIS Jiwa Utama.',
    ipAddress: '10.14.20.101',
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function resetDatabase() {
  console.log('Clearing existing data (FK-safe order)...');
  await prisma.auditLog.deleteMany();
  await prisma.applicationNote.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.applicationAssignment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.simulationRun.deleteMany();
  await prisma.simulationRuleVersion.deleteMany();
  await prisma.productDocument.deleteMany();
  await prisma.productEligibilityCondition.deleteMany();
  await prisma.productCoverageDetail.deleteMany();
  await prisma.productBenefit.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers(): Promise<Map<string, { id: string; fullName: string }>> {
  console.log('Seeding users...');
  const passwordHash = await argon2.hash('praxis123');
  const usersByName = new Map<string, { id: string; fullName: string }>();

  // Managers must be created before their reports (managerId FK). SEED_USERS
  // can now be a multi-level chain (e.g. Rangga -> Sarah -> Bambang), so this
  // repeatedly creates whichever remaining users have no manager or an
  // already-created one, instead of a single non-transitive sort pass (which
  // only correctly orders a single level of "has a manager" vs "doesn't").
  let remaining = [...SEED_USERS];
  while (remaining.length > 0) {
    const ready = remaining.filter(
      (u) => !u.managerName || usersByName.has(u.managerName),
    );
    if (ready.length === 0) {
      throw new Error(
        `Cannot resolve manager chain for: ${remaining.map((u) => u.fullName).join(', ')} — check for a cycle or a typo'd managerName.`,
      );
    }

    for (const seedUser of ready) {
      const manager = seedUser.managerName ? usersByName.get(seedUser.managerName) : undefined;
      const created = await prisma.user.create({
        data: {
          email: seedUser.email,
          fullName: seedUser.fullName,
          role: seedUser.role,
          department: seedUser.department,
          managerId: manager?.id ?? null,
          passwordHash,
        },
      });
      usersByName.set(seedUser.fullName, { id: created.id, fullName: created.fullName });
    }

    const readyNames = new Set(ready.map((u) => u.fullName));
    remaining = remaining.filter((u) => !readyNames.has(u.fullName));
  }

  return usersByName;
}

async function seedProducts(): Promise<Map<string, { id: string; slug: string; name: string; categoryLabel: string; allowedPaymentTerms: number[] }>> {
  console.log('Seeding products...');
  const productsByMockId = new Map<
    string,
    { id: string; slug: string; name: string; categoryLabel: string; allowedPaymentTerms: number[] }
  >();

  for (const seedProduct of SEED_PRODUCTS) {
    const category = CATEGORY_MAP[seedProduct.category];
    if (!category) {
      throw new Error(`Unknown product category: "${seedProduct.category}"`);
    }

    const created = await prisma.product.create({
      data: {
        slug: seedProduct.slug,
        name: seedProduct.name,
        tagline: seedProduct.tagline,
        category,
        categoryLabel: seedProduct.categoryLabel,
        summary: seedProduct.summary,
        targetAudience: seedProduct.targetAudience,
        minAge: seedProduct.minAge,
        maxAge: seedProduct.maxAge,
        minSumAssured: seedProduct.minSumAssured,
        maxSumAssured: seedProduct.maxSumAssured,
        allowedPaymentTerms: seedProduct.allowedPaymentTerms,
        coverageDurationYears: seedProduct.coverageDurationYears,
        baseAnnualRatePerMillion: seedProduct.baseAnnualRatePerMillion,
        badge: seedProduct.badge,
        colorTone: seedProduct.colorTone,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        benefits: {
          create: seedProduct.keyBenefits.map((b, index) => ({
            title: b.title,
            description: b.description,
            iconName: b.iconName,
            sortOrder: index,
          })),
        },
        coverageDetails: {
          create: seedProduct.coverageDetails.map((c, index) => ({
            category: c.category,
            benefit: c.benefit,
            maximumPayout: c.maximumPayout,
            notes: c.notes,
            sortOrder: index,
          })),
        },
        eligibilityConditions: {
          create: seedProduct.eligibilityConditions.map((text, index) => ({
            text,
            sortOrder: index,
          })),
        },
        documents: {
          create: seedProduct.documents.map((d) => ({
            name: d.name,
            documentType: DOCUMENT_TYPE_MAP[d.type] ?? DocumentType.OTHER,
            sizeLabel: d.size,
            url: '#',
          })),
        },
      },
    });

    productsByMockId.set(seedProduct.mockId, {
      id: created.id,
      slug: created.slug,
      name: created.name,
      categoryLabel: created.categoryLabel,
      allowedPaymentTerms: seedProduct.allowedPaymentTerms,
    });
  }

  return productsByMockId;
}

async function seedSimulationRuleVersions(
  productsByMockId: Map<string, { id: string; allowedPaymentTerms: number[] }>,
  authorId: string,
): Promise<Map<string, { id: string; productId: string }>> {
  console.log('Seeding simulation rule versions...');
  const ruleVersionByMockProductId = new Map<string, { id: string; productId: string }>();

  for (const [mockId, product] of productsByMockId.entries()) {
    const formulaConfig = buildFormulaConfig(product.allowedPaymentTerms);
    const created = await prisma.simulationRuleVersion.create({
      data: {
        productId: product.id,
        version: 1,
        status: RuleVersionStatus.ACTIVE,
        effectiveFrom: new Date('2026-01-01T00:00:00+07:00'),
        formulaConfig,
        createdById: authorId,
      },
    });
    ruleVersionByMockProductId.set(mockId, { id: created.id, productId: created.productId });
  }

  return ruleVersionByMockProductId;
}

async function seedApplications(
  productsByMockId: Map<
    string,
    { id: string; slug: string; name: string; categoryLabel: string }
  >,
  ruleVersionByMockProductId: Map<string, { id: string; productId: string }>,
  usersByName: Map<string, { id: string; fullName: string }>,
) {
  console.log('Seeding sample applications...');
  const applicationByReference = new Map<string, { id: string; applicantFullName: string }>();

  for (const seedApp of SEED_APPLICATIONS) {
    const product = productsByMockId.get(seedApp.productMockId);
    const ruleVersion = ruleVersionByMockProductId.get(seedApp.productMockId);
    if (!product || !ruleVersion) {
      throw new Error(`Unknown productMockId in seed application: ${seedApp.productMockId}`);
    }

    const isValid = seedApp.simulation.isValid;
    const validationError = isValid
      ? null
      : 'Kombinasi usia dan masa bayar melebihi batas maksimal 75 tahun.';

    const run = await prisma.simulationRun.create({
      data: {
        productId: product.id,
        ruleVersionId: ruleVersion.id,
        age: seedApp.simulation.age,
        sumAssured: seedApp.simulation.sumAssured,
        paymentTermYears: seedApp.simulation.paymentTerm,
        paymentFrequency: FREQUENCY_MAP[seedApp.simulation.frequency],
        isValid,
        validationError,
        monthlyPremium: isValid ? seedApp.simulation.monthlyPremium : null,
        quarterlyPremium: isValid ? seedApp.simulation.quarterlyPremium : null,
        semiAnnualPremium: isValid ? seedApp.simulation.semesterPremium : null,
        annualPremium: isValid ? seedApp.simulation.annualPremium : null,
        totalEstimatedPayment: isValid ? seedApp.simulation.totalEstimatedInvestment : null,
      },
    });

    const submittedAt = parseWIB(seedApp.submittedAt);
    const updatedAt = parseWIB(seedApp.lastUpdated);
    const status = applicationStatusFromMock(seedApp.status);

    const approvedEvent = seedApp.statusEvents.find(
      (e) => e.toStatus === ApplicationStatus.APPROVED,
    );
    const rejectedEvent = seedApp.statusEvents.find(
      (e) => e.toStatus === ApplicationStatus.REJECTED,
    );

    const simulationSnapshot = {
      simulationRunId: run.id,
      ruleVersionId: run.ruleVersionId,
      isValid: run.isValid,
      validationError: run.validationError,
      sumAssured: seedApp.simulation.sumAssured,
      paymentTermYears: seedApp.simulation.paymentTerm,
      paymentFrequency: FREQUENCY_MAP[seedApp.simulation.frequency],
      monthlyPremium: isValid ? seedApp.simulation.monthlyPremium : null,
      quarterlyPremium: isValid ? seedApp.simulation.quarterlyPremium : null,
      semiAnnualPremium: isValid ? seedApp.simulation.semesterPremium : null,
      annualPremium: isValid ? seedApp.simulation.annualPremium : null,
      totalEstimatedPayment: isValid ? seedApp.simulation.totalEstimatedInvestment : null,
      disclaimer: SIMULATION_DISCLAIMER,
    };

    const productSnapshot = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryLabel: product.categoryLabel,
    };

    const application = await prisma.application.create({
      data: {
        referenceNo: seedApp.reference,
        productId: product.id,
        simulationRunId: run.id,
        ruleVersionId: ruleVersion.id,
        status,
        applicantFullName: seedApp.applicant.fullName,
        applicantEmail: seedApp.applicant.email,
        applicantPhone: seedApp.applicant.phone,
        applicantAge: seedApp.applicant.age,
        applicantCity: seedApp.applicant.city,
        preferredContactTime: contactTimeFromMock(seedApp.applicant.preferredContactTime),
        applicantNotes: seedApp.applicant.notes,
        dataConsentAt: submittedAt,
        productSnapshot,
        simulationSnapshot,
        rejectionReason: seedApp.rejectionReason,
        submittedAt,
        createdAt: submittedAt,
        updatedAt,
        approvedAt: approvedEvent ? parseWIB(approvedEvent.timestamp) : null,
        rejectedAt: rejectedEvent ? parseWIB(rejectedEvent.timestamp) : null,
      },
    });

    applicationByReference.set(seedApp.reference, {
      id: application.id,
      applicantFullName: application.applicantFullName,
    });

    // Initial status history row (mirrors what POST /applications does).
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: ApplicationStatus.SUBMITTED,
        changedById: null,
        createdAt: submittedAt,
      },
    });

    // Subsequent transitions evidenced by the mock's own per-application
    // audit trail (e.g. "Status Changed to Under Review").
    let previousStatus: ApplicationStatus = ApplicationStatus.SUBMITTED;
    for (const event of seedApp.statusEvents) {
      const actor = usersByName.get(event.actorName);
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: previousStatus,
          toStatus: event.toStatus,
          changedById: actor?.id ?? null,
          comment: event.comment,
          createdAt: parseWIB(event.timestamp),
        },
      });
      previousStatus = event.toStatus;
    }

    // Assignment (manager Bambang assigns, mirroring the one explicit
    // example in the mock's own audit trail for app-01).
    if (seedApp.assignedToName) {
      const assignee = usersByName.get(seedApp.assignedToName);
      const assigner = usersByName.get('Bambang Soedirman');
      if (!assignee) {
        throw new Error(`Unknown assignee name in seed data: ${seedApp.assignedToName}`);
      }
      await prisma.applicationAssignment.create({
        data: {
          applicationId: application.id,
          assignedToId: assignee.id,
          assignedById: assigner?.id ?? null,
          assignedAt: submittedAt,
        },
      });
    }

    // Internal notes.
    for (const note of seedApp.notes) {
      const author = usersByName.get(note.authorName);
      await prisma.applicationNote.create({
        data: {
          applicationId: application.id,
          authorId: author?.id ?? null,
          content: note.content,
          isInternal: true,
          createdAt: parseWIB(note.timestamp),
        },
      });
    }
  }

  return applicationByReference;
}

async function seedAuditLogs(
  usersByName: Map<string, { id: string; fullName: string }>,
  productsByMockId: Map<string, { id: string }>,
  applicationByReference: Map<string, { id: string; applicantFullName: string }>,
) {
  console.log('Seeding top-level audit log...');

  for (const entry of SEED_AUDIT_LOGS) {
    const actor = usersByName.get(entry.actorName);

    let entityId = entry.entityId;
    if (entry.entityType === 'Application') {
      const application = applicationByReference.get(entry.entityId);
      if (application) {
        entityId = application.id;
      }
    } else if (entry.entityType === 'Product') {
      const product = productsByMockId.get(entry.entityId);
      if (product) {
        entityId = product.id;
      }
    }
    // entityType 'SimulationRule' entityId 'v2.4' has no seeded counterpart
    // (only version 1 / ACTIVE is seeded per product) - kept as the literal
    // mock string, which is fine since AuditLog.entityId is a plain string,
    // not a foreign key.

    await prisma.auditLog.create({
      data: {
        actorId: actor?.id ?? null,
        actorLabel: entry.actorName,
        action: entry.action,
        entityType: entry.entityType,
        entityId,
        description: entry.description,
        ipAddress: entry.ipAddress,
        createdAt: parseWIB(entry.timestamp),
      },
    });
  }
}

async function main() {
  await resetDatabase();

  const usersByName = await seedUsers();
  const productsByMockId = await seedProducts();

  const manager = usersByName.get('Bambang Soedirman');
  const actuary = usersByName.get('Sarah Wijaya');
  if (!manager || !actuary) {
    throw new Error('Expected seed users Bambang Soedirman and Sarah Wijaya to exist');
  }

  const ruleVersionByMockProductId = await seedSimulationRuleVersions(
    productsByMockId,
    actuary.id,
  );

  const applicationByReference = await seedApplications(
    productsByMockId,
    ruleVersionByMockProductId,
    usersByName,
  );

  await seedAuditLogs(usersByName, productsByMockId, applicationByReference);

  console.log('Seed complete.');
  console.log('Demo login credentials (all users, password: praxis123):');
  for (const u of SEED_USERS) {
    console.log(`  - ${u.email} (${u.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
