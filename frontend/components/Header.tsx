'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/utils/format';
import { NAV_ITEMS, filterNavItems } from '@/components/Sidebar';
import {
  Search,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  adminUser?: string;
  onLogout?: () => void;
}

type OpenMenu = 'none' | 'notifications' | 'user' | 'quickAdd';

/**
 * "Create new X" shortcuts — this app has no single obvious create action, so
 * Quick Add is a fast-navigation menu to the sections an admin most often adds
 * new content to. It only ever calls setActiveTab; there is no mock create-modal
 * pretending to save anything, since these sections still run on mock store data.
 */
const QUICK_ADD_ITEMS: { id: string; label: string }[] = [
  { id: 'coupons', label: 'New Coupon' },
  { id: 'banners', label: 'New Banner' },
  { id: 'static-pages', label: 'New Static Page' },
];

export default function Header({ adminUser = 'Super Admin', onLogout }: HeaderProps) {
  const { activeTab, auditLogs, setActiveTab } = useAdminStore();
  const { theme, setTheme } = useTheme();

  const [openMenu, setOpenMenu] = useState<OpenMenu>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown / search suggestions when clicking outside the toolbar cluster.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setOpenMenu('none');
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  // Escape closes whatever is open, same as click-outside.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu('none');
        setSearchFocused(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = adminUser
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'SA';

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard & Overview',
      'same-day-analytics': 'Same-Day Analytics — Live Ops Snapshot',
      map: 'Live Map',
      orders: 'Orders Management',
      products: 'Products & Books Catalog',
      vendors: 'Vendor Partners & KYC',
      users: 'User Accounts & Wallet Manager',
      delivery: 'Same-Day & Shadowfax Logistics',
      pincodes: 'Pincodes & COD Delivery Zones',
      returns: 'Return & Refund Requests',
      withdrawals: 'Vendor Payout Desk',
      coupons: 'Coupons & Promotional Offers',
      banners: 'Homepage Banner Manager',
      pins: 'Homepage Pin Override Desk',
      reviews: 'Product Reviews Moderation',
      support: 'Support Tickets & Platform Issues',
      exams: 'Competitive Exam Categories',
      settings: 'Platform App Settings',
      'static-pages': 'Static Legal & Policy Pages',
      notifications: 'FCM Push Notifications',
      'audit-logs': 'Admin Action Audit Trail',
      'email-logs': 'Outgoing Email Logs',
      'migration-logs': 'Database Migration Logs',
      'schema-ref': 'Prisma Schema & Enums Reference',
    };
    return titles[activeTab] || 'Admin Portal';
  };

  // Short label for the breadcrumb — reuses the sidebar's own nav labels
  // ("Dashboard", "Same-Day Analytics") rather than the long descriptive title above.
  const breadcrumbLabel = NAV_ITEMS.find((item) => item.id === activeTab)?.label ?? getTitle();

  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const searchResults = searchQuery.trim() ? filterNavItems(NAV_ITEMS, searchQuery).slice(0, 6) : [];

  const jumpTo = (id: string) => {
    setActiveTab(id);
    setSearchQuery('');
    setSearchFocused(false);
    setOpenMenu('none');
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
      jumpTo(searchResults[0].id);
    }
  };

  return (
    /* Yellow header band + wavy SVG divider */
    <header className="sticky top-0 z-20 relative bg-(--yellow) pb-10">
      {/* ── Main toolbar ── */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Breadcrumb + title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-foreground-subtle">
              <span>Kitabwalah</span>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-foreground truncate">{breadcrumbLabel}</span>
            </nav>
            <h1 className="text-base font-black tracking-tight text-foreground truncate">{getTitle()}</h1>
          </div>

          {/* Live DB pill */}
          <span className="hidden md:inline-flex text-xs px-2.5 py-0.5 rounded-full font-bold items-center gap-1.5 bg-black/10 border border-black/10 text-foreground shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
            RDS Connected
          </span>
        </div>

        {/* Right tools */}
        <div ref={toolsRef} className="flex items-center gap-2.5 shrink-0">
          {/* Search / jump to section */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Jump to a section..."
              aria-label="Jump to a section"
              className="w-56 pl-9 pr-8 py-1.5 text-xs rounded-full border-0 bg-white/75 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-black/15 focus:bg-white/95 transition-colors duration-150"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <AnimatePresence>
              {searchFocused && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+6px)] left-0 w-64 bg-white border border-border rounded-xl shadow-[var(--shadow-lg)] p-1.5 z-50"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => jumpTo(item.id)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-foreground-subtle shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-2.5 py-3 text-center text-xs text-foreground-subtle">
                      No section matches &quot;{searchQuery}&quot;
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Add */}
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpenMenu((m) => (m === 'quickAdd' ? 'none' : 'quickAdd'))}
              aria-expanded={openMenu === 'quickAdd'}
              aria-label="Quick add"
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Quick Add
              <ChevronDown className="w-3 h-3" />
            </Button>

            <AnimatePresence>
              {openMenu === 'quickAdd' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white border border-border rounded-xl shadow-[var(--shadow-lg)] p-1.5 z-50"
                >
                  <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">
                    Jump to create
                  </p>
                  {QUICK_ADD_ITEMS.map((qa) => {
                    const Icon = NAV_ITEMS.find((n) => n.id === qa.id)?.icon;
                    return (
                      <button
                        key={qa.id}
                        type="button"
                        onClick={() => jumpTo(qa.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-sidebar-item-active-text shrink-0" />}
                        {qa.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === 'notifications' ? 'none' : 'notifications'))}
              className="relative p-2 rounded-full bg-black/10 hover:bg-black/15 text-foreground transition-colors duration-150"
              aria-label="Recent admin activity"
              aria-expanded={openMenu === 'notifications'}
              title="Recent admin activity"
            >
              <Bell className="w-4 h-4" />
              {auditLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
              )}
            </button>

            <AnimatePresence>
              {openMenu === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white border border-border rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Recent Activity</p>
                    <Bell className="w-3.5 h-3.5 text-foreground-subtle" />
                  </div>

                  {recentLogs.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-foreground-subtle">
                      No recent activity yet.
                    </p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-border">
                      {recentLogs.map((log) => (
                        <li key={log.id} className="px-4 py-2.5">
                          <p className="text-xs font-semibold text-foreground truncate">{log.description}</p>
                          <p className="text-[11px] text-foreground-subtle mt-0.5">
                            {log.admin_name} · {formatRelativeTime(log.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('audit-logs');
                      setOpenMenu('none');
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-sidebar-item-active-text hover:bg-background-secondary transition-colors border-t border-border"
                  >
                    View all activity
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="inline-flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle Dark Mode"
              className="rounded-full bg-black/10 hover:bg-black/15 text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
            </Button>
          </span>

          {/* Admin avatar + logout */}
          <div className="flex items-center gap-2.5 pl-3 relative border-l-[1.5px] border-black/15">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === 'user' ? 'none' : 'user'))}
              className="w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shadow-[var(--shadow-sm)] transition-transform duration-150 hover:scale-110 bg-foreground text-(--yellow)"
              aria-label={`Account menu for ${adminUser}`}
              aria-expanded={openMenu === 'user'}
              title={adminUser}
            >
              {initials}
            </button>
            <div className="hidden md:block max-w-[220px]">
              <p className="text-xs font-bold leading-tight truncate text-foreground">{adminUser}</p>
              <p className="text-[10px] flex items-center gap-1 font-medium text-foreground-muted">
                <ShieldCheck className="w-3 h-3 text-foreground" />
                Full Access
              </p>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {openMenu === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 right-0 bg-white border border-border rounded-xl shadow-[var(--shadow-lg)] p-1 min-w-[140px] z-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu('none');
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-danger hover:bg-danger-bg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Wavy SVG divider flowing yellow → white ── */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-12"
        >
          <path
            d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </header>
  );
}
