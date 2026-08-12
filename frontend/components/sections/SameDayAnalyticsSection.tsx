'use client';

import {
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Tag,
  UserPlus,
  UserCheck,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useSameDayAnalytics } from '@/hooks/queries/useSameDayAnalytics';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '@/utils/format';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

export default function SameDayAnalyticsSection() {
  const { data, isLoading, isError, error, isFetching, refetch, dataUpdatedAt } = useSameDayAnalytics();

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-sm font-bold">Couldn&apos;t load Same-Day Analytics</h2>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error contacting the backend.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {data ? `Today — ${data.date}` : 'Today'}
          </h2>
          <p className="text-xs text-slate-500">
            Live operational snapshot, refreshed every 60s
            {dataUpdatedAt ? ` · last updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 9 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Today's Orders"
              value={formatNumber(data.ordersCount)}
              icon={ShoppingCart}
              accent="brand"
            />
            <StatCard
              label="Today's Revenue"
              value={formatCurrencyCompact(data.revenue)}
              hint={formatCurrency(data.revenue)}
              icon={IndianRupee}
              accent="success"
            />
            <StatCard
              label="Today's Profit"
              value={formatCurrencyCompact(data.profit)}
              hint="Contribution margin, not full P&L"
              icon={TrendingUp}
              accent="success"
            />
            <StatCard
              label="Today's Loss"
              value={formatCurrencyCompact(data.loss)}
              hint={data.loss > 0 ? 'Costs exceeded margin today' : 'No loss today'}
              icon={TrendingDown}
              accent="danger"
            />
            <StatCard
              label="Today's Coupon Usage"
              value={formatNumber(data.couponUsage.count)}
              hint={`${formatCurrency(data.couponUsage.totalDiscountAmount)} discounted`}
              icon={Tag}
              accent="info"
            />
            <StatCard
              label="Today's New Users"
              value={formatNumber(data.newUsersCount)}
              icon={UserPlus}
              accent="info"
            />
            <StatCard
              label="Today's Returning Users"
              value={formatNumber(data.returningUsersCount)}
              icon={UserCheck}
              accent="info"
            />
            <StatCard
              label="Today's Delivery Cost"
              value={formatCurrencyCompact(data.deliveryCostEstimated)}
              hint="Estimated from zone flat-rates"
              icon={Truck}
              accent="neutral"
            />
            <StatCard
              label="Today's Refund Cost"
              value={formatCurrencyCompact(data.refundCost)}
              icon={RotateCcw}
              accent="danger"
            />
          </>
        )}
      </div>
    </div>
  );
}
