'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import type { SupportTicket } from '@/lib/types';
import { LifeBuoy, AlertTriangle, CheckCircle2, MessageSquare, ShieldCheck, X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';

export default function SupportSection() {
  const { supportTickets, issueReports, resolveTicket, resolveIssue } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'tickets' | 'issues'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  return (
    <div className="space-y-6">
      {/* Sub Tabs Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tickets'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Customer & Vendor Tickets ({supportTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'issues'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            System Issue Reports ({issueReports.length})
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-amber-500" /> Support Desk Tickets
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">User & Role</th>
                  <th className="p-3.5">Subject & Message</th>
                  <th className="p-3.5">Linked Order</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {supportTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{t.user_name}</p>
                      <span className="uppercase text-[10px] font-bold text-slate-400">{t.user_role}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t.subject}</p>
                      <p className="text-[11px] text-slate-500 max-w-[250px] truncate">{t.message}</p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {t.order_id || 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-400">{t.created_at}</td>
                    <td className="p-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="p-3.5">
                      {t.status !== 'resolved' && (
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Platform Issue Reports
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Reporter Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Issue Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {issueReports.map((ir) => (
                  <tr key={ir.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{ir.user_name}</td>
                    <td className="p-3.5 uppercase font-bold text-rose-600 text-[10px]">{ir.category}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs">{ir.description}</td>
                    <td className="p-3.5">
                      <StatusBadge status={ir.status} />
                    </td>
                    <td className="p-3.5">
                      {ir.status !== 'resolved' && (
                        <button
                          onClick={() => resolveIssue(ir.id, 'Issue diagnosed and fixed by admin.')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold"
                        >
                          Resolve Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Resolve Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Resolve Ticket — {selectedTicket.subject}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Resolution Note for User</label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="E.g., Your package is out for delivery with Ramesh Singh today."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolveTicket(selectedTicket.id, resolutionNote || 'Ticket resolved by support.');
                  setSelectedTicket(null);
                  setResolutionNote('');
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
