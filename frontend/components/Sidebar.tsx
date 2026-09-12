'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/lib/store';
import { useUIStore } from '@/store/useUIStore';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Zap,
  Map as MapIcon,
  ShoppingCart,
  BookOpen,
  Store,
  Users,
  Truck,
  MapPin,
  RotateCcw,
  Wallet,
  TicketPercent,
  Image as ImageIcon,
  Pin,
  Star,
  LifeBuoy,
  GraduationCap,
  Settings,
  FileText,
  Bell,
  History,
  Mail,
  Database,
  Code2,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Static nav structure — id/label/icon only, no badge counts here.
 * Badge counts are derived from live store data inside the component below.
 * Exported so Header.tsx can reuse the exact same section list for its
 * breadcrumb, "jump to a section" search, and Quick Add shortcuts, instead
 * of maintaining a second copy of these ids/labels.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'same-day-analytics', label: 'Same-Day Analytics', icon: Zap },
      { id: 'map', label: 'Live Map', icon: MapIcon },
    ],
  },
  {
    title: 'Catalog & Vendors',
    items: [
      { id: 'orders', label: 'Orders Management', icon: ShoppingCart },
      { id: 'products', label: 'Products & Books', icon: BookOpen },
      { id: 'vendors', label: 'Vendor Partners', icon: Store },
      { id: 'users', label: 'Users & Wallet', icon: Users },
    ],
  },
  {
    title: 'Operations & Logistics',
    items: [
      { id: 'delivery', label: 'Same-Day & Delivery', icon: Truck },
      { id: 'pincodes', label: 'Pincodes & COD Rules', icon: MapPin },
      { id: 'returns', label: 'Return Requests', icon: RotateCcw },
      { id: 'withdrawals', label: 'Vendor Payouts', icon: Wallet },
    ],
  },
  {
    title: 'Marketing & Display',
    items: [
      { id: 'coupons', label: 'Coupons & Offers', icon: TicketPercent },
      { id: 'banners', label: 'Homepage Banners', icon: ImageIcon },
      { id: 'pins', label: 'Homepage Pin Overrides', icon: Pin },
      { id: 'reviews', label: 'Product Reviews', icon: Star },
      { id: 'exams', label: 'Competitive Exams', icon: GraduationCap },
    ],
  },
  {
    title: 'Support & Helpdesk',
    items: [{ id: 'support', label: 'Support & Issues', icon: LifeBuoy }],
  },
  {
    title: 'Platform Config & Logs',
    items: [
      { id: 'settings', label: 'Platform Settings', icon: Settings },
      { id: 'static-pages', label: 'Static Legal Pages', icon: FileText },
      { id: 'notifications', label: 'Push Notifications', icon: Bell },
      { id: 'audit-logs', label: 'Admin Audit Logs', icon: History },
      { id: 'email-logs', label: 'Outgoing Email Logs', icon: Mail },
      { id: 'migration-logs', label: 'Migration Logs', icon: Database },
      { id: 'schema-ref', label: 'Prisma Schema Ref', icon: Code2 },
    ],
  },
];

/** Flat id/label/icon list — for breadcrumb + search lookups outside the grouped view. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/**
 * Case-insensitive substring filter over nav items. Shared by the sidebar's own
 * search box and the header's "jump to a section" search so both behave identically.
 */
export function filterNavItems<T extends { label: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.label.toLowerCase().includes(q));
}

/** Small solid dot used for badge counts in collapsed (icon-only) mode. */
function badgeDotClass(variant: BadgeVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'danger':
      return 'bg-danger';
    case 'info':
      return 'bg-info';
    case 'brand':
      return 'bg-(--yellow)';
    default:
      return 'bg-foreground-subtle';
  }
}

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    vendors,
    withdrawalRequests,
    returnRequests,
    reviews,
    supportTickets,
  } = useAdminStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const collapsed = !isSidebarOpen;

  const [query, setQuery] = useState('');

  const { data: pendingProductsData } = useQuery({
    queryKey: ['products', 'pending_review'],
    queryFn: () => getProducts({ status: 'pending_review', limit: 1 }),
  });
  const pendingProductsCount = pendingProductsData?.meta.total ?? 0;
  const pendingKycCount = vendors.filter((v) => !v.is_verified).length;
  const pendingWithdrawalsCount = withdrawalRequests.filter((w) => w.status === 'pending').length;
  const pendingReturnsCount = returnRequests.filter((r) => r.status === 'pending').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const openTicketsCount = supportTickets.filter((t) => t.status === 'open').length;

  // Same counts as before, just paired with a Badge variant instead of a raw Tailwind color class.
  const badgeConfig: Record<string, { count: number; variant: BadgeVariant }> = {
    products: { count: pendingProductsCount, variant: 'warning' },
    vendors: { count: pendingKycCount, variant: 'info' },
    returns: { count: pendingReturnsCount, variant: 'danger' },
    withdrawals: { count: pendingWithdrawalsCount, variant: 'success' },
    reviews: { count: pendingReviewsCount, variant: 'brand' },
    support: { count: openTicketsCount, variant: 'outline' },
  };

  const visibleGroups = query.trim()
    ? NAV_GROUPS.map((group) => ({ ...group, items: filterNavItems(group.items, query) })).filter(
        (group) => group.items.length > 0,
      )
    : NAV_GROUPS;

  const handleToggleCollapse = () => {
    toggleSidebar();
    setQuery('');
  };

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 h-screen sticky top-0 bg-sidebar-bg border-r border-sidebar-border overflow-hidden transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Brand Header ── */}
      <div
        className={cn(
          'border-b border-sidebar-border',
          collapsed ? 'flex flex-col items-center gap-2 p-3' : 'flex items-center gap-3 p-4',
        )}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-[var(--shadow-sm)] bg-(--yellow) text-foreground shrink-0">
          K
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-base leading-tight tracking-wide text-foreground truncate">
              KITABWALAH
            </h1>
            <p className="text-xs font-semibold text-sidebar-item-active-text truncate">
              Admin Portal v2.0
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'shrink-0 p-1.5 rounded-lg text-foreground-subtle hover:bg-sidebar-item-hover hover:text-foreground transition-colors duration-150',
            !collapsed && 'ml-auto',
          )}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Search ── */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections..."
              aria-label="Search navigation sections"
              className="w-full pl-8 pr-7 py-2 text-xs rounded-lg bg-background-secondary text-foreground placeholder:text-foreground-subtle border border-transparent focus:outline-none focus:ring-2 focus:ring-(--yellow) focus:bg-white transition-colors duration-150"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Nav List ── */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {visibleGroups.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-foreground-subtle">
            No sections match &quot;{query}&quot;
          </p>
        )}

        {visibleGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {!collapsed && (
              <h2 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">
                {group.title}
              </h2>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badge = badgeConfig[item.id];
              const showBadge = Boolean(badge && badge.count > 0);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative w-full flex items-center rounded-xl text-xs font-medium transition-colors duration-150',
                    collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5',
                    !isActive && 'hover:bg-sidebar-item-hover',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-sidebar-item-active"
                      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive
                          ? 'text-sidebar-item-active-text'
                          : 'text-foreground-subtle group-hover:text-foreground',
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={cn(
                          'truncate',
                          isActive
                            ? 'text-sidebar-item-active-text font-semibold'
                            : 'text-foreground-muted group-hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </span>

                  {!collapsed && showBadge && (
                    <span className="relative z-10 shrink-0">
                      <Badge variant={badge.variant}>{badge.count}</Badge>
                    </span>
                  )}

                  {collapsed && showBadge && (
                    <span
                      className={cn(
                        'absolute z-10 top-1.5 right-1.5 w-2 h-2 rounded-full',
                        badgeDotClass(badge.variant),
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        className={cn(
          'border-t border-sidebar-border bg-background-secondary text-[11px] text-foreground-subtle',
          collapsed ? 'flex flex-col items-center gap-1.5 p-2.5' : 'flex items-center justify-between p-3',
        )}
      >
        {!collapsed && <span>HQ: Muzaffarpur, Bihar</span>}
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          {!collapsed && 'Live DB'}
        </span>
      </div>
    </aside>
  );
}
