'use client';

import React from 'react';
import { useAdminStore } from '@/lib/store';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function EmailLogsSection() {
  const { emailLogs } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-amber-500" /> Outgoing Email Delivery Logs ({emailLogs.length})
        </h2>
        <p className="text-xs text-slate-500">
          History of all platform outgoing email dispatches (97 migrated from WP wp_wpml_mails + live orders).
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Recipient Email</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Message Content Snippet</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Sent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {emailLogs.map((em) => (
                <tr key={em.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{em.to_email}</td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{em.subject}</td>
                  <td className="p-3.5 text-slate-500 text-[11px] max-w-xs truncate">{em.message}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {em.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{em.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
