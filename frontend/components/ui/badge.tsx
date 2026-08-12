import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-full border px-2.5 h-6 text-xs font-semibold leading-none whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-[hsl(var(--success-bg))] text-[hsl(var(--success))] border-transparent',
        warning: 'bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))] border-transparent',
        danger: 'bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))] border-transparent',
        info: 'bg-[hsl(var(--info-bg))] text-[hsl(var(--info))] border-transparent',
        neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-transparent',
        brand: 'bg-[var(--yellow-pale)] text-[#92660A] border-transparent',
        outline: 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      },
      pulse: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: { variant: 'neutral', pulse: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, pulse }), className)} {...props} />;
}

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

/**
 * One lookup covering every status string used across the app's order,
 * payment, shipment, product, withdrawal, return, and support-ticket enums —
 * single source of truth replacing the per-file color ternaries.
 */
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant; pulse?: boolean }> = {
  // Orders / order items
  pending: { label: 'Pending', variant: 'warning', pulse: true },
  confirmed: { label: 'Confirmed', variant: 'info' },
  processing: { label: 'Processing', variant: 'info', pulse: true },
  shipped: { label: 'Shipped', variant: 'info' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'info', pulse: true },
  in_transit: { label: 'In Transit', variant: 'info', pulse: true },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  return_requested: { label: 'Return Requested', variant: 'warning' },
  returned: { label: 'Returned', variant: 'neutral' },
  returned_to_seller: { label: 'Returned to Seller', variant: 'neutral' },
  delivery_failed: { label: 'Delivery Failed', variant: 'danger' },
  assigned: { label: 'Assigned', variant: 'info' },
  picked_up: { label: 'Picked Up', variant: 'info' },

  // Payments
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'neutral' },
  partially_refunded: { label: 'Partially Refunded', variant: 'warning' },

  // Products / vendors / users
  draft: { label: 'Draft', variant: 'neutral' },
  pending_review: { label: 'Pending Review', variant: 'warning', pulse: true },
  active: { label: 'Active', variant: 'success' },
  available: { label: 'Available', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
  rejected: { label: 'Rejected', variant: 'danger' },
  approved: { label: 'Approved', variant: 'success' },

  // Withdrawals / settlements / returns
  completed: { label: 'Completed', variant: 'success' },
  refund_initiated: { label: 'Refund Initiated', variant: 'info', pulse: true },
  pickup_scheduled: { label: 'Pickup Scheduled', variant: 'info' },

  // Support tickets / issues
  open: { label: 'Open', variant: 'warning', pulse: true },
  in_progress: { label: 'In Progress', variant: 'info', pulse: true },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'neutral' },
};

function humanizeStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: string;
}

/** Renders any status string from any enum in the app with a consistent color/label. */
function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const entry = STATUS_MAP[status.toLowerCase()] ?? { label: humanizeStatus(status), variant: 'neutral' as const };
  return (
    <Badge variant={entry.variant} pulse={entry.pulse} className={className} {...props}>
      {entry.label}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
