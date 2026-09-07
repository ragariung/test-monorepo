import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Lock, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="bg-[#051C22] text-slate-300 border-t border-slate-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] border border-white/20 flex items-center justify-center text-white shadow-sm">
                <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">PRAXIS</span>
                <span className="ml-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                  INSURANCE
                </span>
                <p className="text-xs text-slate-400">PT Praxis Asuransi Jiwa Indonesia</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Penyedia solusi perlindungan jiwa, penyakit kritis, dan warisan keluarga berbasis digital terkemuka. Berkomitmen memberikan transparansi ilustrasi premi tanpa biaya tersembunyi.
            </p>

            {/* Company Trust Highlights */}
            <div className="p-4 rounded-2xl bg-[#0F4C5C]/30 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Komitmen Integritas & Kredibilitas</span>
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                Menyediakan perlindungan asuransi jiwa dengan tingkat solvabilitas modal (RBC) mencapai 340% dan rasio penyelesaian klaim 99,2% yang didukung transparansi dokumen RIPLAY secara digital.
              </p>
            </div>
          </div>

          {/* Col 2: Kategori Proteksi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Produk Asuransi</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => navigate('/products/praxis-jiwa-utama')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Jiwa Utama
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products/praxis-sehat-mandiri')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Sehat Mandiri
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products/praxis-warisan-pintar')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Warisan Pintar
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products/praxis-cendekia')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Cendekia (Pendidikan)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products/praxis-dana-sejahtera')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Dana Sejahtera
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products/praxis-investa-syariah')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  PRAXIS Investa Syariah
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan & Informasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Informasi & Bantuan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => navigate('/products/praxis-jiwa-utama/simulate')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  Simulasi Premi Interaktif
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/#how-it-works')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  Panduan Alur Pengajuan
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/#faq')} className="hover:text-emerald-300 transition-colors text-left cursor-pointer">
                  Tanya Jawab (FAQ)
                </button>
              </li>
              <li>
                <span className="text-slate-500">Prosedur Klaim Digital</span>
              </li>
              <li>
                <span className="text-slate-500">Daftar Rumah Sakit Rekanan</span>
              </li>
              <li>
                <span className="text-slate-500">Unduh Dokumen RIPLAY</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Kantor & Kontak */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Hubungi Kami</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Menara Praxis SCBD, Lantai 18, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Halo Praxis: 1500-880 (24 Jam)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>layanan@praxis.co.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure Statement */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">Pemberitahuan Penting:</strong> Perhitungan yang ditampilkan pada kalkulator dan simulator premi situs ini merupakan estimasi ilustrasi semata berdasarkan tarif standar aktuaria dan bukan merupakan polis atau penawaran mengikat. Besaran premi dan penerimaan pertanggungan final akan ditentukan setelah evaluasi seleksi risiko (underwriting) berdasarkan pengisian Surat Pengajuan Asuransi Jiwa (SPAJ) resmi. Calon pemegang polis disarankan membaca dan memahami Ringkasan Informasi Produk dan Layanan (RIPLAY) sebelum memutuskan membeli produk asuransi.
            </p>
          </div>
        </div>
      </div>

      {/* Absolute Bottom OJK & Regulatory Bar (Exact layout as requested in reference image) */}
      <div className="bg-[#03090B] border-t border-slate-900 py-10 px-4 sm:px-8 text-xs sm:text-[13px] text-slate-400">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="space-y-1 text-slate-300 font-normal leading-relaxed">
            <p>PT Praxis Asuransi Jiwa Indonesia berizin dan diawasi oleh Otoritas Jasa Keuangan</p>
            <p>PT Praxis Asuransi Jiwa Indonesia adalah anggota dari Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-400">
            <p>
              Hak Cipta &copy; 2026 Praxis Indonesia. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer">Kebijakan Privasi</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Syarat & Ketentuan</span>
              <span>•</span>
              {/* Discrete link to /login for staff */}
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Khusus Staf & Tenaga Pemasar Internal PRAXIS"
                id="footer-staff-login-link"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Portal Staf (/login)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
