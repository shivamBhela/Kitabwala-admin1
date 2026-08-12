'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { CodType, DeliveryZone } from '@/lib/types';
import { MapPin, Building, Plus, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function PincodesSection() {
  const { pincodes, cities, updatePincodeCod, togglePincodeSameDay } = useAdminStore();

  const [selectedZone, setSelectedZone] = useState<string>('all');

  const filteredPincodes = pincodes.filter((p) => {
    return selectedZone === 'all' || p.delivery_zone === selectedZone;
  });

  return (
    <div className="space-y-6">
      {/* Cities Overview Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" /> Active Platform Cities ({cities.length})
            </h2>
            <p className="text-xs text-slate-500">Tier-1 and Tier-2 delivery hubs</p>
          </div>
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add New City
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <div key={city.id} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200">
              {city.name} ({city.slug})
            </div>
          ))}
        </div>
      </div>

      {/* Pincodes Zone Manager */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Pincode & COD Delivery Rules
            </h2>
            <p className="text-xs text-slate-500">Configure COD payment type & same-day eligibility per postal pincode</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> CSV Bulk Import
            </button>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="flex gap-2 text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
          {['all', 'local', 'rest_bihar', 'south_india', 'rest_india'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                selectedZone === zone
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {zone === 'local' ? 'Local (Muzaffarpur)' : zone.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Pincode</th>
                <th className="p-3.5">City & Zone</th>
                <th className="p-3.5">COD Rule</th>
                <th className="p-3.5">Partial COD Amount</th>
                <th className="p-3.5">Same-Day Eligibility</th>
                <th className="p-3.5">Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPincodes.map((pin) => (
                <tr key={pin.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {pin.pincode}
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{pin.city_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">{pin.delivery_zone}</p>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={pin.cod_type}
                      onChange={(e) => updatePincodeCod(pin.id, e.target.value as CodType)}
                      className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold text-[11px]"
                    >
                      <option value="full_cod">Full COD Allowed</option>
                      <option value="partial_cod">Partial COD (+ Deposit)</option>
                      <option value="prepaid_only">Prepaid Only (No COD)</option>
                    </select>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {pin.cod_type === 'partial_cod' ? `₹${pin.partial_cod_amount}` : 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => togglePincodeSameDay(pin.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        pin.is_same_day_eligible
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {pin.is_same_day_eligible ? '⚡ Same-Day Enabled' : 'Normal Delivery Only'}
                    </button>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Deliverable
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
