'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminStore } from '@/lib/store';
import { getProducts } from '@/services/productService';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '@/utils/format';
import { staggerContainer, slideUp, pageTransition } from '@/lib/animations';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Store,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

interface RevenueTrendPoint {
  day: string;
  label: string;
  revenue: number;
}

const QUEUE_TONES = {
  warning: { border: 'border-l-amber-500', iconBg: 'bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-400' },
  info: { border: 'border-l-blue-500', iconBg: 'bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400' },
  success: { border: 'border-l-emerald-500', iconBg: 'bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  danger: { border: 'border-l-rose-500', iconBg: 'bg-rose-500/10', icon: 'text-rose-600 dark:text-rose-400' },
} as const;

interface ApprovalRowProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  tone: keyof typeof QUEUE_TONES;
  onClick: () => void;
}

function ApprovalRow({ icon: Icon, label, hint, tone, onClick }: ApprovalRowProps) {
  const t = QUEUE_TONES[tone];
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 flex items-center justify-between gap-3',
        'bg-white dark:bg-slate-900/60 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow-hover)]',
        t.border,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t.iconBg, t.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{label}</p>
          <p className="text-[11px] text-slate-500">{hint}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
    </div>
  );
}

export default function DashboardSection() {
  const {
    orders,
    users,
    vendors,
    withdrawalRequests,
    returnRequests,
    setActiveTab,
  } = useAdminStore();

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const products = productsData?.data ?? [];

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing');
  const activeVendors = vendors.filter((v) => v.is_active && v.is_verified);
  const pendingProducts = products.filter((p) => p.status === 'pending_review');
  const pendingKyc = vendors.filter((v) => !v.is_verified);
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');
  const pendingReturns = returnRequests.filter((r) => r.status === 'pending');
  const lowStockProducts = products.filter((p) => p.stock_quantity < 5);

  const migratedUsersCount = users.filter((u) => u.migration_login_done).length;
  const avgCommissionRate = activeVendors.length
    ? Math.round(activeVendors.reduce((sum, v) => sum + v.commission_rate, 0) / activeVendors.length)
    : 10;

  // Real revenue-by-day trend — derived from delivered orders already loaded via
  // useAdminStore(). No invented data: whatever distinct order dates exist in the
  // backing store is exactly what gets plotted, even if that's just one day.
  const revenueTrend: RevenueTrendPoint[] = useMemo(() => {
    const byDay = new Map<string, number>();
    orders
      .filter((o) => o.status === 'delivered')
      .forEach((o) => {
        const day = o.created_at.slice(0, 10); // 'YYYY-MM-DD' prefix of created_at
        byDay.set(day, (byDay.get(day) ?? 0) + o.total);
      });
    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([day, revenue]) => ({
        day,
        label: format(parseISO(day), 'MMM d'),
        revenue: Math.round(revenue * 100) / 100,
      }));
  }, [orders]);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-6">
      {/* Metric Cards Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={slideUp}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={IndianRupee}
            accent="success"
            hint={`${deliveredOrders.length} delivered order${deliveredOrders.length === 1 ? '' : 's'}`}
            sparkline={revenueTrend.map((d) => d.revenue)}
          />
        </motion.div>
        <motion.div variants={slideUp}>
          <StatCard
            label="Total Orders"
            value={formatNumber(orders.length)}
            icon={ShoppingCart}
            accent="warning"
            hint={`${pendingOrders.length} pending processing`}
          />
        </motion.div>
        <motion.div variants={slideUp}>
          <StatCard
            label="Total Users"
            value={formatNumber(users.length)}
            icon={Users}
            accent="info"
            hint={`${migratedUsersCount} migrated from WP`}
          />
        </motion.div>
        <motion.div variants={slideUp}>
          <StatCard
            label="Active Vendors"
            value={formatNumber(activeVendors.length)}
            icon={Store}
            accent="brand"
            hint={`${avgCommissionRate}% platform commission rate`}
          />
        </motion.div>
      </motion.div>

      {/* Main Row: Revenue Chart & Pending Action Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Day — built from real delivered orders in useAdminStore(), not fabricated */}
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <div>
              <CardTitle>Revenue by Day</CardTitle>
              <CardDescription>Delivered-order revenue for Muzaffarpur &amp; Bihar zones</CardDescription>
            </div>
            {revenueTrend.length > 0 && (
              <Badge variant="neutral">
                {revenueTrend.length} day{revenueTrend.length === 1 ? '' : 's'} of data
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {revenueTrend.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No revenue data yet"
                description="This chart will fill in as soon as orders are marked delivered."
              />
            ) : (
              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend} margin={{ top: 28, right: 12, left: 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="revenueBarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFC107" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#FFC107" stopOpacity={0.55} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#94A3B8" strokeOpacity={0.25} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        borderRadius: 10,
                        border: 'none',
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: 12,
                        padding: '8px 12px',
                      }}
                      labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 2 }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="url(#revenueBarFill)" radius={[4, 4, 0, 0]} maxBarSize={64}>
                      <LabelList
                        dataKey="revenue"
                        position="top"
                        formatter={(value) => formatCurrencyCompact(Number(value))}
                        style={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Required Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Pending Admin Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ApprovalRow
              icon={BookOpen}
              label="Pending Book Listings"
              hint={`${pendingProducts.length} books await review`}
              tone="warning"
              onClick={() => setActiveTab('products')}
            />
            <ApprovalRow
              icon={Store}
              label="Pending Vendor KYC"
              hint={`${pendingKyc.length} vendor registrations`}
              tone="info"
              onClick={() => setActiveTab('vendors')}
            />
            <ApprovalRow
              icon={IndianRupee}
              label="Pending Vendor Payouts"
              hint={`${pendingWithdrawals.length} withdrawal requests`}
              tone="success"
              onClick={() => setActiveTab('withdrawals')}
            />
            <ApprovalRow
              icon={RotateCcw}
              label="Pending Return Requests"
              hint={`${pendingReturns.length} returns await review`}
              tone="danger"
              onClick={() => setActiveTab('returns')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent>
            {orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="New orders placed on the storefront will show up here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Order No</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Delivery</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {orders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{order.order_number}</td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{order.customer_name}</td>
                        <td className="p-3">
                          <Badge variant={order.delivery_type === 'same_day' ? 'info' : 'neutral'}>
                            {order.delivery_type === 'same_day' ? '⚡ Same-Day' : 'Normal'}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert Desk */}
        <Card hover>
          <CardHeader>
            <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Low Stock Alert (&lt;5)
            </CardTitle>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
              {lowStockProducts.length}
            </span>
          </CardHeader>

          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All inventory levels healthy"
                description="No products are currently below the low-stock threshold."
              />
            ) : (
              lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{prod.title}</p>
                    <p className="text-[10px] text-slate-400">{prod.vendor_name}</p>
                  </div>
                  <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-1 rounded-md shrink-0">
                    Qty: {prod.stock_quantity}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
