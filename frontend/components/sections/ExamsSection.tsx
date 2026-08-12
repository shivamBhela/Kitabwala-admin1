'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { GraduationCap, Plus, BookOpen, X, CheckCircle2 } from 'lucide-react';

export default function ExamsSection() {
  const { exams } = useAdminStore();

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [toast, setToast] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    // TODO: wire to POST /api/exams when backend is built
    setAddOpen(false);
    setNewName('');
    setNewDesc('');
    setNewSlot('');
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-500" /> Competitive Exam Categories ({exams.length})
          </h2>
          <p className="text-xs text-slate-500">Curate exam-specific book collections (UPSC, BPSC, SSC, NEET, JEE)</p>
        </div>

        <div className="flex items-center gap-2">
          {toast && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Category queued (backend pending)
            </span>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Exam Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3">
            <div className="h-36 bg-slate-800 relative overflow-hidden">
              <img src={ex.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md self-start mb-1">
                  Slot #{ex.display_order}
                </span>
                <h3 className="font-bold text-white text-base leading-tight">{ex.name}</h3>
              </div>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-400">{ex.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> {ex.linked_products_count} Books Linked
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active on App
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Exam Category Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Add Exam Category</h3>
              <button onClick={() => setAddOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Category Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. UPSC Civil Services"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short description for mobile app display"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Display Slot #</label>
                <input
                  type="number"
                  min={1}
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 py-2 bg-amber-500 hover:enabled:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
