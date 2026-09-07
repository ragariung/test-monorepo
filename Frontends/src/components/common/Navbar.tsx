import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Calculator, 
  Search, 
  X, 
  PhoneCall, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from './Button';
import { Product } from '../../types';
import { formatIDR } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const { currentPath, navigate, products } = useApp();
  
  // State for Prudential-style controls
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [readMoreModalOpen, setReadMoreModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  
  // Search query in modal / drawer
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { label: 'Beranda', path: '/', description: 'Halaman utama proteksi keluarga' },
    { label: 'Katalog Produk', path: '/products', description: '5 pilihan polis asuransi jiwa unggulan' },
    { label: 'Simulasi Premi', path: '/products/praxis-jiwa-utama/simulate', description: 'Hitung estimasi premi instan sesuai profil Anda' },
    { label: 'Cara Kerja & Klaim', path: '/#how-it-works', description: 'Alur pendaftaran digital & rasio klaim 99,2%' },
    { label: 'Pertanyaan Umum (FAQ)', path: '/#faq', description: 'Jawaban lengkap seputar polis & proteksi' }
  ];

  // Auto-cycle through featured products in header banner
  useEffect(() => {
    if (!products || products.length === 0) return;
    const timer = setInterval(() => {
      setActiveProductIndex((prev) => (prev + 1) % products.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [products]);

  // Focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [searchModalOpen]);

  // Lock body scroll when drawer, search modal, or read more modal is open
  useEffect(() => {
    if (drawerOpen || searchModalOpen || readMoreModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, searchModalOpen, readMoreModalOpen]);

  const handleOpenReadMore = (prod?: Product) => {
    setSelectedProduct(prod || products[activeProductIndex] || products[0]);
    setReadMoreModalOpen(true);
  };

  const handleNav = (path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.replace('/#', '');
      if (currentPath !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
    setSearchModalOpen(false);
  };

  // Filter products and pages for search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        {/* Top micro-bar: Featured products text line with "Read More" action & hotline */}
        <div className="bg-[#07262F] text-slate-200 text-xs py-2 px-4 sm:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Product highlight text line */}
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <span className="inline-flex items-center gap-1 font-bold text-[#F27D26] bg-[#F27D26]/15 border border-[#F27D26]/30 px-2 py-0.5 rounded text-[11px] shrink-0">
                <Sparkles className="w-3 h-3 text-[#F27D26]" />
                <span className="hidden sm:inline">Produk Pilihan:</span>
                <span className="sm:hidden">Produk:</span>
              </span>

              <div className="flex items-center gap-2 truncate text-slate-300">
                <span className="font-bold text-white truncate">
                  {products[activeProductIndex]?.name || products[0]?.name}
                </span>
                <span className="text-slate-400 hidden md:inline">—</span>
                <span className="hidden md:inline truncate text-slate-300">
                  {products[activeProductIndex]?.tagline || products[0]?.tagline}
                </span>

                {/* Clickable Read More button */}
                <button
                  type="button"
                  onClick={() => handleOpenReadMore(products[activeProductIndex] || products[0])}
                  className="inline-flex items-center gap-1 text-[#F27D26] hover:text-[#ff9547] font-bold text-[11px] hover:underline cursor-pointer shrink-0 transition-colors ml-1.5 group"
                  id="top-bar-read-more-btn"
                  title="Baca selengkapnya tentang produk ini"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Prev / Next controls for switching product line */}
              {products && products.length > 1 && (
                <div className="hidden xl:flex items-center gap-0.5 ml-2 shrink-0 border-l border-white/15 pl-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setActiveProductIndex((prev) => (prev - 1 + products.length) % products.length)}
                    className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/10"
                    title="Produk sebelumnya"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProductIndex((prev) => (prev + 1) % products.length)}
                    className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/10"
                    title="Produk berikutnya"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Contact & Hotline */}
            <div className="flex items-center gap-4 text-[12px] shrink-0">
              <a 
                href="tel:1500880" 
                className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
                title="Hubungi Layanan Nasabah PRAXIS Care 24/7"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span className="font-medium hidden sm:inline">Halo Praxis: 1500-880</span>
                <span className="font-medium sm:hidden">1500-880</span>
              </a>
              <span className="hidden lg:inline text-slate-500">|</span>
              <span className="hidden lg:inline text-slate-300">Rasio Klaim: 99,2%</span>
            </div>
          </div>
        </div>

        {/* Main Navbar: Logo on left, Nav items when space is sufficient, Search + User + Hamburger on right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo with Sleek geometric emblem */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            id="brand-logo"
          >
            <div className="w-10 h-10 bg-[#0F4C5C] rounded-xl flex items-center justify-center shadow-soft group-hover:bg-[#0a3a46] transition-all">
              <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45 transition-transform group-hover:rotate-90 duration-300"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#0F4C5C]">PRAXIS</span>
                <span className="text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full bg-[#E6F0F1] text-[#0F4C5C]">
                  INSURANCE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight">Perlindungan Keluarga Indonesia</p>
            </div>
          </div>

          {/* Desktop Navigation Links - Shown when there IS sufficient space */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && !item.path.startsWith('/#') && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className={`py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative whitespace-nowrap ${
                    isActive
                      ? 'text-[#0F4C5C]'
                      : 'text-gray-600 hover:text-[#0F4C5C]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0F4C5C] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Search, and Hamburger when space is NOT sufficient */}
          <div className="flex items-center gap-3 relative shrink-0">
            {/* Search Button (Circular button styled in brand teal #0F4C5C) */}
            <button
              id="header-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E6F0F1] text-[#0F4C5C] hover:bg-[#0F4C5C] hover:text-white border border-[#0F4C5C]/20 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              aria-label="Cari Produk Asuransi"
              title="Cari Produk & Layanan"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Hamburger Menu Button - ONLY shown when displaying navbar is NOT sufficient space (lg:hidden) */}
            <button
              id="header-hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-[#111827] hover:bg-gray-100 transition-all cursor-pointer group"
              aria-label="Buka Menu Navigasi"
              title="Menu Navigasi"
            >
              <span className="w-6 h-[2.5px] bg-[#111827] rounded-full transition-all group-hover:scale-x-110"></span>
              <span className="w-6 h-[2.5px] bg-[#111827] rounded-full transition-all group-hover:scale-x-110"></span>
              <span className="w-6 h-[2.5px] bg-[#111827] rounded-full transition-all group-hover:scale-x-110"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Prudential-Style Full Slide-Over Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Side Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0F4C5C] rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45"></div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-lg tracking-tight text-[#0F4C5C]">PRAXIS</span>
                    <span className="text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-[#E6F0F1] text-[#0F4C5C]">
                      INSURANCE
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search Input */}
            <div className="p-6 pb-2">
              <div 
                onClick={() => {
                  setDrawerOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#F8FAFB] border border-gray-200 rounded-2xl text-xs text-gray-400 cursor-pointer hover:border-[#0F4C5C]/40 hover:bg-white transition-all shadow-2xs"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span>Cari produk asuransi, simulasi, klaim...</span>
              </div>
            </div>

            {/* Navigation Links (Large & Clean Typography) */}
            <div className="p-6 pt-2 space-y-1 flex-1">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Navigasi Utama
              </div>

              {navItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.path)}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                      isActive 
                        ? 'bg-[#E6F0F1] text-[#0F4C5C] font-bold shadow-2xs' 
                        : 'text-[#111827] hover:bg-[#F8FAFB] font-semibold'
                    }`}
                  >
                    <div>
                      <div className="text-sm tracking-tight">{item.label}</div>
                      <div className="text-[11px] text-gray-400 font-normal mt-0.5">{item.description}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-[#0F4C5C]' : 'text-gray-400'}`} />
                  </button>
                );
              })}

              {/* Product Catalog Quick Links */}
              <div className="pt-5 mt-4 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
                  <span>5 Produk Unggulan</span>
                  <button 
                    onClick={() => handleNav('/products')} 
                    className="text-[11px] text-[#0F4C5C] hover:underline font-bold"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-1">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleNav(`/products/${p.slug}`)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#F8FAFB] transition-colors flex items-center justify-between group cursor-pointer text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#111827] group-hover:text-[#0F4C5C]">{p.name}</div>
                        <div className="text-[11px] text-gray-400">{p.categoryLabel}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0F4C5C] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Card: Simulasi Premi Mandiri */}
              <div className="mt-6 p-5 rounded-[24px] bg-[#0A2B33] text-white space-y-3 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Kalkulator Premi</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Ketahui estimasi premi bulanan dan uang pertanggungan keluarga Anda dalam hitungan detik.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center bg-white text-[#0A2B33] hover:bg-slate-100 border-none font-bold"
                  onClick={() => handleNav('/products/praxis-jiwa-utama/simulate')}
                  icon={<Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />}
                >
                  Hitung Simulasi Sekarang
                </Button>
              </div>

              {/* Customer Care Notice */}
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <PhoneCall className="w-4 h-4 text-[#0F4C5C] shrink-0" />
                  <span>Halo Praxis 1500-880 (Siaga 24 Jam)</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Company Information */}
            <div className="p-6 border-t border-gray-100 bg-[#F8FAFB] text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-2 text-[#0F4C5C] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PT Praxis Asuransi Jiwa Indonesia</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Menara Praxis SCBD Lt. 18, Jakarta Selatan • Layanan Bebas Pulsa 24 Jam
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prudential-Style Search Dialog Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSearchModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E6F0F1] text-[#0F4C5C] flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 stroke-[2.2]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk asuransi, simulasi, klaim, atau FAQ..."
                className="flex-1 text-sm sm:text-base font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setSearchModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Tutup (Esc)
              </button>
            </div>

            {/* Quick Filters / Tags */}
            <div className="p-4 bg-[#F8FAFB] border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-gray-400 font-medium shrink-0">Pencarian Populer:</span>
              <button
                onClick={() => setSearchQuery('Jiwa')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#0F4C5C] text-gray-700 font-medium transition-colors shrink-0 cursor-pointer"
              >
                Proteksi Jiwa
              </button>
              <button
                onClick={() => setSearchQuery('Simulasi')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#0F4C5C] text-gray-700 font-medium transition-colors shrink-0 cursor-pointer"
              >
                Simulasi Premi
              </button>
              <button
                onClick={() => setSearchQuery('Syariah')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#0F4C5C] text-gray-700 font-medium transition-colors shrink-0 cursor-pointer"
              >
                Asuransi Syariah
              </button>
              <button
                onClick={() => setSearchQuery('Klaim')}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-[#0F4C5C] text-gray-700 font-medium transition-colors shrink-0 cursor-pointer"
              >
                Cara Klaim
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredProducts.length > 0 ? (
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Produk Asuransi Terkait ({filteredProducts.length})
                  </div>
                  <div className="space-y-2">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleNav(`/products/${p.slug}`)}
                        className="p-3.5 rounded-2xl border border-gray-100 hover:border-[#0F4C5C]/30 hover:bg-[#F8FAFB] transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#111827] group-hover:text-[#0F4C5C]">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {p.categoryLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.tagline}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNav(`/products/${p.slug}/simulate`);
                            }}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#E6F0F1] text-[#0F4C5C] hover:bg-[#0F4C5C] hover:text-white transition-colors"
                          >
                            Simulasi
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F4C5C]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery ? (
                <div className="py-12 text-center text-gray-500">
                  <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#111827]">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci lain seperti "Jiwa", "Premi", atau "Syariah".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Akses Cepat
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNav('/products/praxis-jiwa-utama/simulate')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-[#0F4C5C]/30 hover:bg-[#F8FAFB] text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111827]">Kalkulator Premi Instan</div>
                        <div className="text-[10px] text-gray-400">Simulasi premi dalam 10 detik</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/products')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-[#0F4C5C]/30 hover:bg-[#F8FAFB] text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111827]">Katalog Semua Produk</div>
                        <div className="text-[10px] text-gray-400">Pilihan proteksi 100% transparan</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/#how-it-works')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-[#0F4C5C]/30 hover:bg-[#F8FAFB] text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111827]">Cara Kerja & Klaim</div>
                        <div className="text-[10px] text-gray-400">Rasio penyelesaian 99,2%</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/#faq')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-[#0F4C5C]/30 hover:bg-[#F8FAFB] text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111827]">Pertanyaan Umum (FAQ)</div>
                        <div className="text-[10px] text-gray-400">Pusat bantuan & info klaim</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive "Read More" Product Overview Modal */}
      {readMoreModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setReadMoreModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#07262F] to-[#0F4C5C] text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    {selectedProduct.categoryLabel}
                  </span>
                  {selectedProduct.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F27D26] text-white">
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  {selectedProduct.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadMoreModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tutup Dialog"
                id="modal-close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Tabs Switcher inside Modal */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-gray-100 bg-gray-50/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {products.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProduct(prod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedProduct.id === prod.id
                      ? 'bg-[#0F4C5C] text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                  }`}
                >
                  {prod.name}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
              {/* Product Narrative Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Ringkasan Perlindungan
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {selectedProduct.summary}
                </p>
              </div>

              {/* Specifications Card Row */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  Ketentuan & Spesifikasi Polis
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#F8FAFB] rounded-2xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Uang Pertanggungan
                    </span>
                    <span className="text-xs font-extrabold text-[#0F4C5C] block">
                      {formatIDR(selectedProduct.minSumAssured)} s.d. {formatIDR(selectedProduct.maxSumAssured)}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFB] rounded-2xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Masa Perlindungan
                    </span>
                    <span className="text-xs font-extrabold text-[#0F4C5C] block">
                      Hingga Usia {selectedProduct.coverageDurationYears} Tahun
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFB] rounded-2xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Usia Masuk
                    </span>
                    <span className="text-xs font-extrabold text-[#0F4C5C] block">
                      {selectedProduct.minAge} – {selectedProduct.maxAge} Tahun
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFB] rounded-2xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Masa Bayar Premi
                    </span>
                    <span className="text-xs font-extrabold text-[#0F4C5C] block">
                      {selectedProduct.allowedPaymentTerms.join(', ')} Tahun (Flat)
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Benefits List */}
              {selectedProduct.keyBenefits && selectedProduct.keyBenefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Manfaat Unggulan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProduct.keyBenefits.map((benefit) => (
                      <div 
                        key={benefit.id} 
                        className="p-3.5 rounded-2xl border border-gray-100 bg-[#FCFDFD] flex items-start gap-3 hover:border-[#0F4C5C]/30 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#111827]">{benefit.title}</h5>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReadMoreModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Tutup
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReadMoreModalOpen(false);
                    handleNav(`/products/${selectedProduct.slug}`);
                  }}
                  className="w-full sm:w-auto text-xs"
                >
                  <span>Halaman Produk</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    setReadMoreModalOpen(false);
                    handleNav(`/products/${selectedProduct.slug}/simulate`);
                  }}
                  className="w-full sm:w-auto text-xs"
                >
                  <Calculator className="w-3.5 h-3.5 mr-1" />
                  <span>Simulasi Premi</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

