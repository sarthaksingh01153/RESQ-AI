import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors', {
  variants: {
    variant: {
      default: 'border-slate-700 bg-slate-800 text-slate-300',
      critical: 'border-red-400/20 bg-red-400/10 text-red-400',
      high: 'border-orange-400/20 bg-orange-400/10 text-orange-400',
      medium: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400',
      low: 'border-green-400/20 bg-green-400/10 text-green-400',
      blue: 'border-blue-400/20 bg-blue-400/10 text-blue-400',
      purple: 'border-purple-400/20 bg-purple-400/10 text-purple-400',
      success: 'border-green-500/20 bg-green-500/10 text-green-400',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

