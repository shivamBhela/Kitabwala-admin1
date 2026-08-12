'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { VendorProfile } from '@/lib/types';
import {
  Store,
  ShieldCheck,
  Percent,
  CheckCircle2,
  XCircle,
  Eye,
  Building,
  CreditCard,
  Ban,
  UserCheck,
  TrendingUp,
  X,
} from 'lucide-react';

export default function VendorsSection() {
  const { vendors, verifyVendorKyc, toggleVendorActive, updateVendorCommission } = useAdminStore();

  const [selectedKycVendor, setSelectedKycVendor] = useState<VendorProfile | null>(null);
  const [selectedCommissionVendor, setSelectedCommissionVendor] = useState<VendorProfile | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(10);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vendor Partners</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{vendors.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Multi-vendor marketplace sellers</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending KYC Verification</span>
          <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {vendors.filter((v) => !v.is_verified).length}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Requires admin review & verification</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Platform Fee</span>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">10% Commission</h3>
          <p className="text-xs text-slate-500 mt-1">Vendor retains 90% of order totals</p>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Store Name & Slug</th>
                <th className="p-3.5">GSTIN</th>
                <th className="p-3.5">Commission Rate</th>
                <th className="p-3.5">Total Earnings / Withdrawn</th>
                <th className="p-3.5">Pending Balance</th>
                <th className="p-3.5">KYC Status</th>
                <th className="p-3.5">Store Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{v.store_name}</p>
                    <p className="text-[11px] text-slate-500">/{v.store_slug} • Rating: ⭐ {v.average_rating}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {v.gstin || 'Unregistered'}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      {v.commission_rate}%
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">₹{v.total_earnings.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Withdrawn: ₹{v.total_withdrawn.toLocaleString()}</p>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{v.pending_balance.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.is_verified
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {v.is_verified ? 'Verified KYC' : 'Pending Verification'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.is_active
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {v.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedKycVendor(v)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                        title="View KYC Form & Verify"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCommissionVendor(v);
                          setNewCommissionRate(v.commission_rate);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100"
                        title="Set Custom Commission Rate"
                      >
                        <Percent className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleVendorActive(v.id)}
                        className={`p-1.5 rounded-lg ${
                          v.is_active
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100'
                        }`}
                        title={v.is_active ? 'Suspend Store' : 'Reactivate Store'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Form Inspector & Verification Modal */}
      {selectedKycVendor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                Vendor KYC Inspector — {selectedKycVendor.store_name}
              </h3>
              <button onClick={() => setSelectedKycVendor(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">PAN Number</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    {selectedKycVendor.kyc_form_data.pan_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Aadhaar (Last 4)</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    XXXX XXXX {selectedKycVendor.kyc_form_data.aadhaar_last4 || 'XXXX'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block">Business Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedKycVendor.kyc_form_data.address || 'Address registered on profile'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">Bank Account & IFSC</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  A/C: {selectedKycVendor.kyc_form_data.bank_account || 'N/A'} | IFSC: {selectedKycVendor.kyc_form_data.ifsc || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedKycVendor(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {!selectedKycVendor.is_verified && (
                <button
                  onClick={() => {
                    verifyVendorKyc(selectedKycVendor.id);
                    setSelectedKycVendor(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Verify KYC
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Commission Rate Modal */}
      {selectedCommissionVendor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Set Commission Rate — {selectedCommissionVendor.store_name}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Commission Rate (%)</label>
              <input
                type="number"
                value={newCommissionRate}
                onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Platform default is 10%.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCommissionVendor(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateVendorCommission(selectedCommissionVendor.id, newCommissionRate);
                  setSelectedCommissionVendor(null);
                }}
                className="flex-1 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400"
              >
                Save Commission Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
