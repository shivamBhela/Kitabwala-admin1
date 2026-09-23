import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ApiProduct, updateCityPrices, featureProduct } from '@/services/productService';

const CITY_MAP: Record<string, number> = { muzaffarpur: 1, patna: 2, gaya: 3, bhagalpur: 4 };

export function BulkResultsModal({ results, onClose }: { results: any[], onClose: () => void }) {
  const successCount = results.filter(r => r.ok).length;
  const failCount = results.length - successCount;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Bulk Action Results</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="text-sm">
          <p className="mb-2">Processed {results.length} items. <span className="text-emerald-500 font-bold">{successCount} succeeded</span>, <span className="text-rose-500 font-bold">{failCount} failed</span>.</p>
          <div className="max-h-64 overflow-y-auto border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex gap-2">
                <span className={r.ok ? 'text-emerald-500' : 'text-rose-500'}>{r.ok ? '✓' : '✗'}</span>
                <span className="font-medium">ID {r.id}:</span>
                <span className="text-slate-500">{r.ok ? r.status : r.error}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800">Close</button>
      </div>
    </div>
  );
}

export function FeatureProductModal({ product, onClose, onSuccess }: { product: ApiProduct, onClose: () => void, onSuccess: () => void }) {
  const [days, setDays] = useState(30);
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    try {
      await featureProduct(product.id, days);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Feature Product</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <p className="text-xs text-slate-500">{product.title}</p>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Duration (Days)</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full p-2 border rounded-xl text-sm" min="1" max="365" />
        </div>
        <button onClick={handleSave} disabled={isPending} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 disabled:opacity-50">
          {isPending ? 'Saving...' : 'Set as Featured'}
        </button>
      </div>
    </div>
  );
}

export function CityPricesModal({ product, onClose, onSuccess }: { product: ApiProduct, onClose: () => void, onSuccess: () => void }) {
  const basePrice = product.sale_price ?? product.regular_price;
  const initialPrices = product.city_prices ?? {};
  
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    Object.keys(CITY_MAP).forEach(c => {
      p[c] = initialPrices[c] ?? basePrice;
    });
    return p;
  });
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    try {
      const payload = Object.entries(prices).map(([city, price]) => ({
        cityId: CITY_MAP[city],
        price: price.toString()
      }));
      await updateCityPrices(product.id, payload);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">City-wise Pricing</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <p className="text-xs text-slate-500">{product.title}</p>
        <div className="space-y-3 text-xs">
          {Object.entries(prices).map(([city, price]) => (
            <div key={city} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="capitalize">{city}</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrices({ ...prices, [city]: Number(e.target.value) })}
                  className="w-24 p-1.5 border rounded-lg font-bold text-right bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={isPending} className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 disabled:opacity-50">
          {isPending ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
}
