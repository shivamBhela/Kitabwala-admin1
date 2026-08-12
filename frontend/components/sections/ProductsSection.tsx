'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Product, ProductStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  DollarSign,
  Plus,
  BookOpen,
  Building2,
  Layers,
  X,
} from 'lucide-react';

export default function ProductsSection() {
  const { products, approveProduct, rejectProduct, updateProductCityPrices } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [rejectModalProduct, setRejectModalProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cityPriceProduct, setCityPriceProduct] = useState<Product | null>(null);
  const [editingCityPrices, setEditingCityPrices] = useState<Record<string, number>>({});

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.vendor_name && p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search books by title, author, vendor SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {['all', 'pending_review', 'active', 'rejected'].map((st) => (
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
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Book Title & Author</th>
                <th className="p-3.5">Vendor Partner</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price & GST</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden shrink-0">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-6 h-6 m-3 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{p.title}</p>
                        <p className="text-[11px] text-slate-500">By {p.author || 'Editorial Board'} • SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {p.vendor_name}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {p.category_name}
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{p.sale_price || p.regular_price}{' '}
                      {p.sale_price && <span className="line-through text-slate-400 text-[10px]">₹{p.regular_price}</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">GST: {p.gst_rate}% (HSN: {p.hsn_code})</p>
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
                    <div className="flex items-center gap-2">
                      {p.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => approveProduct(p.id)}
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

                      <button
                        onClick={() => {
                          setCityPriceProduct(p);
                          const basePrice = p.sale_price || p.regular_price;
                          setEditingCityPrices(p.city_prices || {
                            'muzaffarpur': basePrice,
                            'patna': basePrice + 5,
                            'boring_road': basePrice + 10,
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                        title="City-wise Pricing"
                      >
                        <Building2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModalProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Reject Book Listing — {rejectModalProduct.title}
            </h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason for Rejection (Vendor will be notified)</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Incomplete ISBN, low resolution cover photo, incorrect pricing..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalProduct(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectProduct(rejectModalProduct.id, rejectReason || 'Listing guidelines not met.');
                  setRejectModalProduct(null);
                  setRejectReason('');
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City-wise Pricing Modal */}
      {cityPriceProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">City-wise Pricing Matrix</h3>
              <button onClick={() => setCityPriceProduct(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set specific pricing per tier-1/tier-2 city for book &quot;{cityPriceProduct.title}&quot;.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span>Muzaffarpur (Local HQ)</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={editingCityPrices['muzaffarpur'] || ''}
                    onChange={(e) => setEditingCityPrices({...editingCityPrices, 'muzaffarpur': Number(e.target.value)})}
                    className="w-20 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600 font-bold text-right focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span>Patna Hub</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={editingCityPrices['patna'] || ''}
                    onChange={(e) => setEditingCityPrices({...editingCityPrices, 'patna': Number(e.target.value)})}
                    className="w-20 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600 font-bold text-right focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span>Boring Road Branch</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={editingCityPrices['boring_road'] || ''}
                    onChange={(e) => setEditingCityPrices({...editingCityPrices, 'boring_road': Number(e.target.value)})}
                    className="w-20 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600 font-bold text-right focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                updateProductCityPrices(cityPriceProduct.id, editingCityPrices);
                setCityPriceProduct(null);
              }}
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
