import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

/** Matches the shape of a StatCard so lists of metrics don't pop in with layout shift. */
function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-28 mt-4" />
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  );
}

/** A skeleton table body — pass the real column count so widths line up. */
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  );
}

export { Skeleton, StatCardSkeleton, TableRowSkeleton };
