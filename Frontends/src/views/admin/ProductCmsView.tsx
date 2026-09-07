import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit3, 
  Sliders, 
  ExternalLink, 
  CheckCircle2, 
  Archive, 
  FileText,
  Search,
  Save,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatIDR } from '../../data/mockData';
import { Product, ProductCategory } from '../../types';

export const ProductCmsView: React.FC = () => {
  const { products, updateProduct, navigate, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for the editor modal
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('life');
  const [formCategoryLabel, setFormCategoryLabel] = useState('Proteksi Jiwa');
  const [formSummary, setFormSummary] = useState('');
  const [formMinAge, setFormMinAge] = useState(18);
  const [formMaxAge, setFormMaxAge] = useState(65);
  const [formMinSum, setFormMinSum] = useState(100000000);
  const [formMaxSum, setFormMaxSum] = useState(5000000000);
  const [formStatus, setFormStatus] = useState<'Draft' | 'Published' | 'Archived'>('Published');

  const openEditor = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormTagline(prod.tagline);
    setFormCategory(prod.category);
    setFormCategoryLabel(prod.categoryLabel);
    setFormSummary(prod.summary);
    setFormMinAge(prod.minAge);
    setFormMaxAge(prod.maxAge);
    setFormMinSum(prod.minSumAssured);
    setFormMaxSum(prod.maxSumAssured);
    setFormStatus(prod.status);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: formName,
      tagline: formTagline,
      category: formCategory,
      categoryLabel: formCategoryLabel,
      summary: formSummary,
      minAge: formMinAge,
      maxAge: formMaxAge,
      minSumAssured: formMinSum,
      maxSumAssured: formMaxSum,
      status: formStatus
    });

    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout
      activeNav="products"
      title="Manajemen Konten Produk (CMS)"
      subtitle="Konfigurasi spesifikasi produk, ketentuan perlindungan, dan status publikasi di website publik."
      action={
        <Button
          id="cms-add-product"
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            showToast('Fitur Tambah Produk', 'Gunakan fungsi edit produk yang ada untuk memodifikasi konten produk.', 'info');
          }}
        >
          Tambah Produk Baru
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Search Bar */}
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk asuransi..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] transition-all"
            />
          </div>
          <div className="text-xs text-gray-500">
            Total <strong className="text-[#111827] font-bold">{products.length}</strong> produk terdaftar
          </div>
        </div>

        {/* Product Cards Table */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] text-[#111827] border-b border-gray-100 font-bold">
                  <th className="py-4 px-5">Nama Produk</th>
                  <th className="py-4 px-5">Kategori</th>
                  <th className="py-4 px-5">Rentang Usia</th>
                  <th className="py-4 px-5">Uang Pertanggungan</th>
                  <th className="py-4 px-5">Pilihan Masa Bayar</th>
                  <th className="py-4 px-5">Status CMS</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#111827]">{prod.name}</div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">{prod.tagline}</div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-[#111827]">
                      {prod.categoryLabel}
                    </td>
                    <td className="py-4 px-5 text-gray-600 whitespace-nowrap">
                      {prod.minAge} - {prod.maxAge} Tahun
                    </td>
                    <td className="py-4 px-5 font-mono font-medium text-[#111827]">
                      {formatIDR(prod.minSumAssured)} - {formatIDR(prod.maxSumAssured)}
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {prod.allowedPaymentTerms.join(', ')} Tahun
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          prod.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : prod.status === 'Draft'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl hover:bg-[#F8FAFB] text-gray-700"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => openEditor(prod)}
                        >
                          Edit Konten
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl text-[#0F4C5C] border-gray-200 hover:border-[#0F4C5C]/30"
                          icon={<Sliders className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/admin/products/${prod.slug}/simulation-rules`)}
                        >
                          Tarif & Rumus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PRODUCT EDITOR MODAL */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Konten: ${editingProduct.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111827]">Nama Produk Asuransi</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111827]">Tagline / Proposisi Nilai</label>
                <input
                  type="text"
                  required
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111827]">Deskripsi / Ringkasan</label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#111827] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Usia Minimal Masuk (Tahun)</label>
                <input
                  type="number"
                  value={formMinAge}
                  onChange={(e) => setFormMinAge(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Usia Maksimal Masuk (Tahun)</label>
                <input
                  type="number"
                  value={formMaxAge}
                  onChange={(e) => setFormMaxAge(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Uang Pertanggungan Min (Rp)</label>
                <input
                  type="number"
                  step={10000000}
                  value={formMinSum}
                  onChange={(e) => setFormMinSum(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Uang Pertanggungan Maks (Rp)</label>
                <input
                  type="number"
                  step={50000000}
                  value={formMaxSum}
                  onChange={(e) => setFormMaxSum(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl text-[#111827]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111827]">Status Publikasi</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl text-[#111827] cursor-pointer"
                >
                  <option value="Published">Published (Tampil di Website Publik)</option>
                  <option value="Draft">Draft (Dalam Pengembangan Internal)</option>
                  <option value="Archived">Archived (Diarsipkan / Tidak Dijual)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setEditingProduct(null)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={<Save className="w-3.5 h-3.5" />}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
};
