import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, hover = false, ...props }: React.ComponentProps<'div'> & { hover?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[var(--card-shadow)]',
        hover && 'transition-all duration-200 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex items-center justify-between p-5 pb-0', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('text-[15px] font-bold text-slate-800 dark:text-slate-100', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-xs text-slate-500 mt-0.5', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
