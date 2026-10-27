'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  className?: string
  valueClassName?: string
  description?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName,
  description,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/[0.06] bg-white p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div>
        <span className={cn('text-3xl font-bold text-slate-900', valueClassName)}>{value}</span>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.value > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              trend.value > 0
                ? 'text-green-600'
                : trend.value < 0
                ? 'text-red-600'
                : 'text-slate-400'
            }
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
