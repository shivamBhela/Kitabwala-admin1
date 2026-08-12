'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { WithdrawalRequest } from '@/lib/types';
import { Wallet, CheckCircle2, XCircle, CreditCard, Building, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';

export default function WithdrawalsSection() {
  const { withdrawalRequests, approveWithdrawal, rejectWithdrawal } = useAdminStore();

  const [approveModal, setApproveModal] = useState<WithdrawalRequest | null>(null);
  const [utrReference, setUtrReference] = useState('');
  const [rejectModal, setRejectModal] = useState<WithdrawalRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-medium">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            <strong>Manual Payout Protocol</strong>: Verify vendor bank details & pending balance before generating bank transfer or entering UTR number.
          </span>
        </div>
      </div>

      {/* Payout Desk Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" /> Vendor Payout Desk ({withdrawalRequests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Vendor Store</th>
                <th className="p-3.5">Requested Amount</th>
                <th className="p-3.5">Bank Account & IFSC</th>
                <th className="p-3.5">Requested Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">UTR / Reference</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {withdrawalRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                    {req.store_name}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{req.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <p className="font-mono text-slate-800 dark:text-slate-200">A/C: {req.bank_details?.account_number}</p>
                    <p className="text-[10px] text-slate-400 font-mono">IFSC: {req.bank_details?.ifsc} | UPI: {req.bank_details?.upi_id || 'N/A'}</p>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {req.requested_at}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {req.payment_reference || '—'}
                  </td>
                  <td className="p-3.5">
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setApproveModal(req);
                            setUtrReference(''); // Admin must enter the real bank UTR — never auto-generated
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payout
                        </button>
                        <button
                          onClick={() => setRejectModal(req)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Payout Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Approve Payout — {approveModal.store_name}
            </h3>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
              <p className="text-slate-500">Payout Amount:</p>
              <p className="text-lg font-bold text-emerald-600">₹{approveModal.amount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Bank UTR / Transaction Reference Number
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={utrReference}
                onChange={(e) => setUtrReference(e.target.value.trim())}
                placeholder="e.g. 426110523214 or NEFT2026..."
                className={`w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold text-xs transition ${
                  utrReference.length > 0
                    ? 'border-emerald-400 dark:border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the real UTR/IMPS/NEFT reference from your bank portal. This cannot be changed after confirmation.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={utrReference.trim().length === 0}
                onClick={() => {
                  if (utrReference.trim().length === 0) return;
                  approveWithdrawal(approveModal.id, utrReference.trim());
                  setApproveModal(null);
                  setUtrReference('');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:enabled:bg-emerald-500 text-white"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payout Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Reject Payout Request — {rejectModal.store_name}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="E.g., Invalid bank account IFSC, suspicious order volume..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectWithdrawal(rejectModal.id, rejectNote || 'Payout check failed.');
                  setRejectModal(null);
                  setRejectNote('');
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
