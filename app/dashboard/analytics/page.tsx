'use client'

import React, { useEffect, useState } from 'react'
import { RefreshCw, BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
}
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7']

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/overview')
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const byType = (data?.incidentsByType || []).map((d: any, i: number) => ({
    name: d.type.replace(/_/g, ' '),
    count: d.count,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }))
  const bySeverity = (data?.incidentsBySeverity || []).map((d: any) => ({
    name: d.severity,
    value: d.count,
    color: SEVERITY_COLORS[d.severity] || '#94a3b8',
  }))

  const trendData = [
    { day: 'Mon', incidents: 3, resolved: 2 },
    { day: 'Tue', incidents: 5, resolved: 3 },
    { day: 'Wed', incidents: 4, resolved: 4 },
    { day: 'Thu', incidents: 7, resolved: 5 },
    { day: 'Fri', incidents: 6, resolved: 4 },
    { day: 'Sat', incidents: 2, resolved: 2 },
    { day: 'Sun', incidents: data?.stats?.totalActive ?? 1, resolved: data?.resolvedLast7Days ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Incident and resource overview</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-black/[0.06] rounded-xl text-sm text-slate-600 shadow-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Incidents"
            value={data?.stats?.totalActive ?? 0}
            icon={<BarChart3 className="h-5 w-5" />}
            description="Currently open"
          />
          <StatCard
            title="Critical"
            value={data?.stats?.critical ?? 0}
            icon={<BarChart3 className="h-5 w-5" />}
            valueClassName="text-red-600"
            description="Needs immediate action"
          />
          <StatCard
            title="Resolved (7d)"
            value={data?.resolvedLast7Days ?? 0}
            icon={<BarChart3 className="h-5 w-5" />}
            valueClassName="text-green-600"
            description="In the last 7 days"
          />
          <StatCard
            title="Resources Available"
            value={data?.stats?.resourcesAvailable ?? 0}
            icon={<BarChart3 className="h-5 w-5" />}
            valueClassName="text-blue-600"
            description="Ready to deploy"
          />
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Incidents by Type</h2>
          {byType.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byType} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, color: '#0f172a' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byType.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Incidents by Severity</h2>
          {bySeverity.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySeverity} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {bySeverity.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, color: '#0f172a' }} />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#64748b', fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 7-day trend */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">7-Day Trend (Simulated)</h2>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Demo Data</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, color: '#0f172a' }} />
            <Legend formatter={(val) => <span style={{ color: '#64748b', fontSize: 11 }}>{val}</span>} />
            <Line type="monotone" dataKey="incidents" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} name="Reported" />
            <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent */}
      {data?.recentIncidents && data.recentIncidents.length > 0 && (
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentIncidents.slice(0, 5).map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  inc.severity === 'CRITICAL' ? 'bg-red-500'
                  : inc.severity === 'HIGH' ? 'bg-orange-500'
                  : inc.severity === 'MEDIUM' ? 'bg-yellow-500'
                  : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{inc.title}</p>
                  <p className="text-xs text-slate-500">{inc.incidentType.replace(/_/g,' ')} · {inc.status.replace(/_/g,' ')}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(inc.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
