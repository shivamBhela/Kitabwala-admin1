import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { StatCardSkeleton } from './skeleton';

export type StatCardAccent = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const ACCENT_STYLES: Record<StatCardAccent, { bar: string; iconBg: string; iconColor: string; spark: string }> = {
  brand: { bar: 'bg-(--yellow)', iconBg: 'bg-(--yellow-pale)', iconColor: 'text-[#92660A]', spark: '#FFC107' },
  success: { bar: 'bg-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400', spark: '#10B981' },
  warning: { bar: 'bg-amber-500', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400', spark: '#F59E0B' },
  danger: { bar: 'bg-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600 dark:text-rose-400', spark: '#F43F5E' },
  info: { bar: 'bg-blue-500', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400', spark: '#3B82F6' },
  neutral: { bar: 'bg-slate-400', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600 dark:text-slate-400', spark: '#94A3B8' },
};

export interface StatCardTrend {
  /** Signed percentage, e.g. 14.2 or -3.5 */
  value: number;
  label?: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: StatCardAccent;
  trend?: StatCardTrend;
  /** Optional hint text shown when there's no trend to display. */
  hint?: string;
  /** Recent values (oldest→newest) to render as a tiny sparkline. */
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, accent = 'brand', trend, hint, sparkline, onClick, className }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5',
        'shadow-[var(--card-shadow)] transition-all duration-200 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <span className={cn('absolute top-0 left-0 right-0 h-[3px]', styles.bar)} aria-hidden />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', styles.iconBg, styles.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[2rem] leading-none font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</h3>
          {trend ? (
            <p
              className={cn(
                'text-xs flex items-center gap-1 mt-2 font-medium',
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {trend.value.toFixed(1)}% {trend.label ?? ''}
            </p>
          ) : hint ? (
            <p className="text-xs text-slate-500 mt-2 font-medium">{hint}</p>
          ) : null}
        </div>

        {sparkline && sparkline.length > 1 && (
          <div className="w-20 h-10 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline.map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id={`spark-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={styles.spark} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={styles.spark} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={styles.spark}
                  strokeWidth={2}
                  fill={`url(#spark-${label.replace(/\s+/g, '-')})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCardSkeleton };
