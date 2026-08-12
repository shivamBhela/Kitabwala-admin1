'use client';

import React from 'react';
import { useAdminStore } from '@/lib/store';
import { History, ShieldCheck, Database, Code2 } from 'lucide-react';

export default function AuditLogsSection() {
  const { auditLogs } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <History className="w-4 h-4 text-amber-500" /> Immutable Admin Action Audit Logs ({auditLogs.length})
        </h2>
        <p className="text-xs text-slate-500">
          Full history of all admin operations (bans, product approvals, payouts, settings updates) recorded in admin_action_logs table.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Target Table & ID</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Admin Operator</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold uppercase text-amber-600 dark:text-amber-400">
                    {log.action_type}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {log.target_table} ({log.target_id})
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-sans">
                    {log.description}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {log.admin_name}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {log.created_at}
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
