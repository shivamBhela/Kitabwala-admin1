'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { ReturnRequest } from '@/lib/types';
import { RotateCcw, CheckCircle2, XCircle, Eye, Image as ImageIcon, AlertCircle, RefreshCw, X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';

export default function ReturnsSection() {
  const { returnRequests, approveReturnRequest, rejectReturnRequest } = useAdminStore();

  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<ReturnRequest | null>(null);

  return (
    <div className="space-y-6">
      {/* Return Policy Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-medium">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            <strong>Platform Return Policy</strong>: 7 Days from delivery date • Wrong product / damaged items only • Partial item returns supported
          </span>
        </div>
      </div>

      {/* Return Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" /> Return & Payout Claim Desk ({returnRequests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Order # & Customer</th>
                <th className="p-3.5">Item Returned</th>
                <th className="p-3.5">Return Reason</th>
                <th className="p-3.5">Proof Photo</th>
                <th className="p-3.5">Refund Claim</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {returnRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{req.order_number}</p>
                    <p className="text-[11px] text-slate-500">{req.user_name}</p>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {req.product_name}
                  </td>
                  <td className="p-3.5">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {req.reason.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate">{req.reason_description}</p>
                  </td>
                  <td className="p-3.5">
                    {req.proof_images[0] ? (
                      <img src={req.proof_images[0]} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    ₹{req.refund_amount}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-3.5">
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveReturnRequest(req.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(req)}
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

      {/* Reject Return Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Reject Return Request — #{showRejectModal.order_number}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="E.g., Proof photo does not show defect, return window exceeded 7 days..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectReturnRequest(showRejectModal.id, rejectNote || 'Return conditions not satisfied.');
                  setShowRejectModal(null);
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
