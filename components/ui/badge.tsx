import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors', {
  variants: {
    variant: {
      default: 'border-slate-200 bg-slate-100 text-slate-700',
      critical: 'border-red-200 bg-red-50 text-red-700',
      high: 'border-orange-200 bg-orange-50 text-orange-700',
      medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      low: 'border-green-200 bg-green-50 text-green-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      success: 'border-green-200 bg-green-50 text-green-700',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
