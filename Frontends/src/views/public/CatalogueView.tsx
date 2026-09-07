import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  HeartPulse, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Scale, 
  Calculator, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { formatIDR } from '../../data/mockData';
import { ProductCategory } from '../../types';

export const CatalogueView: React.FC = () => {
  const { products, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'life', label: 'Proteksi Jiwa' },
    { id: 'family', label: 'Proteksi Keluarga & Warisan' },
    { id: 'critical-illness', label: 'Penyakit Kritis' },
    { id: 'education', label: 'Dana Pendidikan' },
    { id: 'savings', label: 'Tabungan Berjangka' },
    { id: 'investment', label: 'Unit Link Syariah' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="w-full bg-[#F9FAFB] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2 border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F0F1] text-[#0F4C5C] rounded-full text-xs font-bold uppercase tracking-wider">
            Katalog Produk Digital
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
            Pilihan Solusi Asuransi PRAXIS
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            Jelajahi produk perlindungan jiwa, kesehatan, dan perencanaan warisan yang dirancang transparan dengan simulasi premi instan.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-soft space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="catalogue-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, manfaat, atau kata kunci..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#F3F4F6] border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-gray-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 font-medium shrink-0">
              Menampilkan <strong className="text-[#111827]">{filteredProducts.length}</strong> dari {products.length} produk
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0F4C5C] text-white shadow-sm'
                      : 'bg-[#F3F4F6] text-gray-600 hover:bg-gray-200 hover:text-[#0F4C5C]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid: 1 col mobile -> 3-4 col desktop */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-dashed border-gray-300 p-12 text-center max-w-md mx-auto space-y-4 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada produk asuransi yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filter Pencarian
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-lg transition-all p-6 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top category & badge */}
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

                  {/* Product Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#0F4C5C] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Quick Specs Container */}
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

                  {/* Key Benefits List */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                    {product.keyBenefits.slice(0, 3).map((benefit) => (
                      <div key={benefit.id} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{benefit.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTAs */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-2.5">
                  <Button
                    id={`view-detail-${product.slug}`}
                    className="flex-1 justify-center"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    Lihat Rincian
                  </Button>
                  <Button
                    id={`simulate-prod-${product.slug}`}
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
        )}
      </div>
    </div>
  );
};
