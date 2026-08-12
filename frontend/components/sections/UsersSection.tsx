'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { User } from '@/lib/types';
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Wallet,
  IndianRupee,
  ShieldAlert,
  Share2,
  X,
  Plus,
} from 'lucide-react';

export default function UsersSection() {
  const { users, toggleUserBan, addWalletBalance } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [banModalUser, setBanModalUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [walletModalUser, setWalletModalUser] = useState<User | null>(null);
  const [walletAdjustmentAmount, setWalletAdjustmentAmount] = useState<number>(100);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by display name, phone (+91...), email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {['all', 'customer', 'vendor', 'delivery_person', 'reseller'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  selectedRole === role
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Phone & Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Wallet Balance</th>
                <th className="p-3.5">Migration Status</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{u.display_name}</p>
                    <p className="text-[10px] text-slate-400">Registered: {u.created_at}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{u.phone}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{u.wallet_balance}
                  </td>
                  <td className="p-3.5">
                    {u.is_migrated ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {u.migration_login_done ? '✓ Login Done' : 'Migrated (Pending Login)'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">New Platform</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_banned
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWalletModalUser(u)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100"
                        title="Adjust Wallet Balance"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (u.is_banned) {
                            toggleUserBan(u.id);
                          } else {
                            setBanModalUser(u);
                          }
                        }}
                        className={`p-1.5 rounded-lg ${
                          u.is_banned
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100'
                        }`}
                        title={u.is_banned ? 'Unban Account' : 'Ban Account'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Reason Modal */}
      {banModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Ban User Account — {banModalUser.display_name}
            </h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason for Ban</label>
              <textarea
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="E.g., Fraudulent activity, abuse of return policy..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBanModalUser(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleUserBan(banModalUser.id, banReason || 'Policy violation.');
                  setBanModalUser(null);
                  setBanReason('');
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Adjustment Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Adjust Wallet Balance — {walletModalUser.display_name}
            </h3>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between text-xs">
              <span className="text-slate-500">Current Balance:</span>
              <span className="font-bold text-emerald-600">₹{walletModalUser.wallet_balance}</span>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount to Add (or minus for debit)</label>
              <input
                type="number"
                value={walletAdjustmentAmount}
                onChange={(e) => setWalletAdjustmentAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setWalletModalUser(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addWalletBalance(walletModalUser.id, walletAdjustmentAmount);
                  setWalletModalUser(null);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500"
              >
                Update Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
