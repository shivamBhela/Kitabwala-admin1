'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { HomepinType } from '@/lib/types';
import { getProducts } from '@/services/productService';
import { Pin, Plus, Trash2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function HomepagePinsSection() {
  const { homepagePins, addHomepagePin, removeHomepagePin, categories, banners } = useAdminStore();
  const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: () => getProducts({ limit: 200 }) });
  const products = productsData?.data ?? [];

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<HomepinType>('product');
  const [referenceId, setReferenceId] = useState('prod-101');
  const [position, setPosition] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refTitle =
      type === 'product'
        ? products.find((p) => String(p.id) === referenceId)?.title || referenceId
        : type === 'category'
        ? categories.find((c) => c.id === referenceId)?.name || referenceId
        : banners.find((b) => b.id === referenceId)?.title || referenceId;

    addHomepagePin({
      type,
      reference_id: referenceId,
      title: refTitle,
      position,
      is_active: true,
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-1 text-xs">
        <h2 className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Option C: Hybrid Algorithm + Manual Pin Override
        </h2>
        <p className="text-amber-800 dark:text-amber-400">
          The Kitabwalah app homepage ranks products automatically by sales velocity. Pinning an item forces it into a fixed position slot, overriding the algorithm for that slot only.
        </p>
      </div>

      {/* Pins Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-500" /> Active Homepage Pin Overrides ({homepagePins.length})
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Pin Item to Slot
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Slot Position</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Pinned Entity Title</th>
                <th className="p-3.5">Reference ID</th>
                <th className="p-3.5">Last Updated</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {homepagePins.map((pin) => (
                <tr key={pin.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold font-mono text-amber-600 text-sm">
                    Slot #{pin.position}
                  </td>
                  <td className="p-3.5">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {pin.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {pin.title}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">
                    {pin.reference_id}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {pin.updated_at}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => removeHomepagePin(pin.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100"
                      title="Unpin Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Pin Item to Homepage Slot</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Entity Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HomepinType)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="product">Book Product</option>
                  <option value="category">Category Collection</option>
                  <option value="banner">Homepage Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Target Reference ID</label>
                <input
                  type="text"
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Slot Position Number (1, 2, 3...)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400"
              >
                Pin Override
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
