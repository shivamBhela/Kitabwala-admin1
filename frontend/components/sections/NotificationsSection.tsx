'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Bell, Send, CheckCircle2, Users, Store, MapPin } from 'lucide-react';

export default function NotificationsSection() {
  const { notifications, sendNotification } = useAdminStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetGroup, setTargetGroup] = useState<'all' | 'vendors' | 'city' | 'single_user'>('all');
  const [targetCity, setTargetCity] = useState('Muzaffarpur');
  const [payload, setPayload] = useState('{"screen": "category", "id": "cat-2"}');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    sendNotification({
      target_group: targetGroup,
      target_city: targetGroup === 'city' ? targetCity : undefined,
      title,
      body,
      data_payload: payload,
    });
    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" /> Firebase FCM Push Notification Dispatcher
        </h2>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1">Target Audience Group</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value as 'all' | 'vendors' | 'city' | 'single_user')}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="all">Broadcast to All App Users (14,200+ devices)</option>
                <option value="vendors">Active Vendors Only</option>
                <option value="city">City Segment (e.g., Muzaffarpur / Patna)</option>
                <option value="single_user">Single User Account</option>
              </select>
            </div>

            {targetGroup === 'city' && (
              <div>
                <label className="block text-slate-500 mb-1">Target City Segment</label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Notification Title</label>
            <input
              type="text"
              required
              placeholder="E.g., 📚 Same-day delivery available in Muzaffarpur!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Notification Body Message</label>
            <textarea
              rows={2}
              required
              placeholder="E.g., Order your UPSC and NCERT books before 2 PM to get them by 7 PM today."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Deep Link JSON Payload</label>
            <input
              type="text"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Send className="w-4 h-4" /> Trigger Push Notification
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notification Delivery Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Title & Message</th>
                <th className="p-3">Target Group</th>
                <th className="p-3">Sent Count</th>
                <th className="p-3">Dispatch Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                    <p className="text-slate-500 text-[11px]">{n.body}</p>
                  </td>
                  <td className="p-3">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {n.target_group}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {n.sent_count.toLocaleString()} devices
                  </td>
                  <td className="p-3 text-slate-400">{n.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
