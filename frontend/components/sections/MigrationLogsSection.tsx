'use client';

import React from 'react';
import { useAdminStore } from '@/lib/store';
import { Database, CheckCircle2 } from 'lucide-react';

export default function MigrationLogsSection() {
  const { migrationLogs } = useAdminStore();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-amber-500" /> Database Migration Execution Logs ({migrationLogs.length})
        </h2>
        <p className="text-xs text-slate-500">
          Source DB: u101172427_newdev (WordPress + WooCommerce + WCFM). Tracks records migrated, skipped (e.g. 680 guest orders), and execution times.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Source Table</th>
                <th className="p-3.5">Destination Table</th>
                <th className="p-3.5">Migrated</th>
                <th className="p-3.5">Skipped / Excluded</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {migrationLogs.map((mg) => (
                <tr key={mg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{mg.source_table}</td>
                  <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{mg.destination_table}</td>
                  <td className="p-3.5 font-bold text-emerald-600">{mg.records_migrated.toLocaleString()} rows</td>
                  <td className="p-3.5 text-slate-500">{mg.records_skipped} rows</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {mg.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{mg.completed_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
