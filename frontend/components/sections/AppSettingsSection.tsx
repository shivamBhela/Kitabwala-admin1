'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Settings, Save, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export default function AppSettingsSection() {
  const { settings, updateSetting } = useAdminStore();

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const handleSave = (key: string) => {
    const val = editValues[key] !== undefined ? editValues[key] : settings.find((s) => s.key === key)?.value;
    if (val !== undefined) {
      updateSetting(key, val);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-amber-500" /> Platform App Settings (No Code Deploy Needed)
        </h2>
        <p className="text-xs text-slate-500">
          All platform-wide defaults stored in PostgreSQL app_settings table. Changes take effect instantly on live mobile app.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((st) => (
          <div key={st.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{st.key}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{st.description}</p>
              </div>
              {savedKey === st.key && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={editValues[st.key] !== undefined ? editValues[st.key] : st.value}
                onChange={(e) => setEditValues({ ...editValues, [st.key]: e.target.value })}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={() => handleSave(st.key)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
