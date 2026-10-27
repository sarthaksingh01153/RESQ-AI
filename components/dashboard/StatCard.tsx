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
        'rounded-lg border border-slate-700 bg-slate-800 p-5 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div>
        <span className={cn('text-3xl font-bold text-slate-100', valueClassName)}>{value}</span>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.value > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-slate-500" />
          )}
          <span
            className={
              trend.value > 0
                ? 'text-green-400'
                : trend.value < 0
                ? 'text-red-400'
                : 'text-slate-500'
            }
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

