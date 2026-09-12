'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge } from '@/components/ui/badge';
import {
  getProducts,
  approveProduct,
  rejectProduct,
  updateCityPrices,
  createProduct,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  type ApiProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
  type ApiProductStatus,
} from '@/services/productService';
import {
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Plus,
  BookOpen,
  Building2,
  X,
  Trash2,
} from 'lucide-react';

const STATUSES: ApiProductStatus[] = ['pending_review', 'active', 'inactive', 'rejected'];

const emptyForm: CreateProductPayload = {
  vendor_id: 1,
  title: '',
  slug: '',
  regular_price: 0,
  sale_price: 0,
  gst_rate: 5,
  hsn_code: '',
  sku: '',
  author: '',
  stock_quantity: 10,
  in_stock: true,
};

export default function ProductsSection() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [rejectModalProduct, setRejectModalProduct] = useState<ApiProduct | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [cityPriceProduct, setCityPriceProduct] = useState<ApiProduct | null>(null);
  const [editingCityPrices, setEditingCityPrices] = useState<Record<string, number>>({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [formData, setFormData] = useState<CreateProductPayload>(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedStatus, searchQuery],
    queryFn: () =>
      getProducts({
        status: selectedStatus !== 'all' ? (selectedStatus as ApiProductStatus) : undefined,
        search: searchQuery || undefined,
        limit: 50,
      }),
  });

  const products = productsData?.data ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] });

  const approveMutation = useMutation({ mutationFn: approveProduct, onSuccess: invalidate });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectProduct(id, reason),
    onSuccess: () => { invalidate(); setRejectModalProduct(null); setRejectReason(''); },
  });

  const deactivateMutation = useMutation({ mutationFn: deactivateProduct, onSuccess: invalidate });

  const deleteMutation = useMutation({ mutationFn: deleteProduct, onSuccess: invalidate });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { invalidate(); setIsCreateModalOpen(false); setFormData(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductPayload }) => updateProduct(id, data),
    onSuccess: () => { invalidate(); setEditProduct(null); },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditProduct(null);
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditProduct(p);
    setFormData({
      vendor_id: p.vendor_id,
      title: p.title,
      slug: p.slug,
      regular_price: p.regular_price,
      sale_price: p.sale_price ?? 0,
      gst_rate: p.gst_rate ?? 5,
      hsn_code: p.hsn_code ?? '',
      sku: p.sku,
      author: p.author ?? '',
      stock_quantity: p.stock_quantity,
      in_stock: p.in_stock,
    });
    setIsCreateModalOpen(true);
  };

  const handleSave = () => {
    if (editProduct) {
      const { vendor_id, slug, ...rest } = formData; // slug/vendor usually immutable
      updateMutation.mutate({ id: editProduct.id, data: rest });
    } else {
      // Auto-generate slug from title if empty
      const payload: CreateProductPayload = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search books by title, author, SKU…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Create Product
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {['all', ...STATUSES].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  selectedStatus === st
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st === 'pending_review' ? 'Pending Review' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No products found.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Book Title & Author</th>
                  <th className="p-3.5">Vendor</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {products.map((p) => {
                  const primaryImg = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img src={primaryImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{p.title}</p>
                            <p className="text-[11px] text-slate-500">
                              By {p.author || 'Unknown'} • SKU: {p.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {p.vendor?.store_name ?? `Vendor #${p.vendor_id}`}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          ₹{p.sale_price ?? p.regular_price}
                          {p.sale_price != null && (
                            <span className="ml-1 line-through text-slate-400 text-[10px]">₹{p.regular_price}</span>
                          )}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${p.stock_quantity < 5 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {p.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(p.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => setRejectModalProduct(p)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          {p.status === 'active' && (
                            <button
                              onClick={() => deactivateMutation.mutate(p.id)}
                              className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-amber-700 dark:text-amber-400"
                              title="Unpublish"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {p.status === 'inactive' && (
                            <button
                              onClick={() => approveMutation.mutate(p.id)}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-400"
                              title="Publish"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 text-blue-700 dark:text-blue-400"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 text-rose-700 dark:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCityPriceProduct(p);
                              const base = p.sale_price ?? p.regular_price;
                              setEditingCityPrices(p.city_prices ?? { muzaffarpur: base, patna: base + 5 });
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                            title="City Pricing"
                          >
                            <Building2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 my-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                {editProduct ? `Edit: ${editProduct.title}` : 'Create New Product'}
              </h3>
              <button onClick={() => { setIsCreateModalOpen(false); setEditProduct(null); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-500 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author ?? ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Regular Price (₹) *</label>
                <input
                  type="number"
                  value={formData.regular_price}
                  onChange={(e) => setFormData({ ...formData, regular_price: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  value={formData.sale_price ?? 0}
                  onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) || undefined })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_quantity ?? 10}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Vendor ID *</label>
                <input
                  type="number"
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-xs text-rose-500">Save failed — check required fields and try again.</p>
            )}

            <button
              onClick={handleSave}
              disabled={isPending || !formData.title || !formData.sku}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {isPending ? 'Saving…' : editProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Reject — {rejectModalProduct.title}
            </h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason (vendor will be notified)</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Incomplete ISBN, low resolution cover photo…"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setRejectModalProduct(null); setRejectReason(''); }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  rejectMutation.mutate({ id: rejectModalProduct.id, reason: rejectReason || 'Listing guidelines not met.' })
                }
                disabled={rejectMutation.isPending}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City Pricing Modal */}
      {cityPriceProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">City-wise Pricing</h3>
              <button onClick={() => setCityPriceProduct(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">"{cityPriceProduct.title}"</p>
            <div className="space-y-3 text-xs">
              {Object.entries(editingCityPrices).map(([city, price]) => (
                <div key={city} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="capitalize">{city.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setEditingCityPrices({ ...editingCityPrices, [city]: Number(e.target.value) })}
                      className="w-20 p-1.5 border rounded-lg text-emerald-600 font-bold text-right bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { updateCityPrices(cityPriceProduct.id, editingCityPrices); setCityPriceProduct(null); }}
              className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
            >
              Save City Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
