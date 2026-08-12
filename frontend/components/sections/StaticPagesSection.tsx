'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/store';
import { FileText, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
  about: 'About Us',
};

export default function StaticPagesSection() {
  const { staticPages, updateStaticPage } = useAdminStore();

  const [activeSlug, setActiveSlug] = useState('terms');
  const [localContent, setLocalContent] = useState(staticPages['terms'] ?? '');
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local textarea when switching tabs — prompt if unsaved
  const handleSelect = (slug: string) => {
    if (isDirty && slug !== activeSlug) {
      const confirmed = window.confirm(
        `You have unsaved changes to "${PAGE_LABELS[activeSlug]}". Discard them and switch?`
      );
      if (!confirmed) return;
    }
    setActiveSlug(slug);
    setLocalContent(staticPages[slug] ?? '');
    setIsDirty(false);
    setSaved(false);
  };

  // Keep local textarea in sync when activeSlug changes
  useEffect(() => {
    setLocalContent(staticPages[activeSlug] ?? '');
    setIsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  const handleChange = (value: string) => {
    setLocalContent(value);
    setIsDirty(value !== (staticPages[activeSlug] ?? ''));
    setSaved(false);
  };

  const handleSave = () => {
    updateStaticPage(activeSlug, localContent);
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" /> Static Legal &amp; Policy Page Editor
          </h2>
          <p className="text-xs text-slate-500">Edit legal documentation directly rendered on mobile app without code redeploy</p>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          )}
          {saved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Page Updated!
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex gap-2">
          {Object.keys(PAGE_LABELS).map((slug) => (
            <button
              key={slug}
              onClick={() => handleSelect(slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeSlug === slug
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {PAGE_LABELS[slug]}
            </button>
          ))}
        </div>

        <textarea
          rows={12}
          value={localContent}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
        />

        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="px-6 py-2.5 bg-amber-500 hover:enabled:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" /> Save Page Content
        </button>
      </div>
    </div>
  );
}
