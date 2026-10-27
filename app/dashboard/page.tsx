'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Activity, Users, Package, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const IncidentMap = dynamic(
  () => import('@/components/dashboard/IncidentMap').then((m) => m.IncidentMap),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> }
)

const SEVERITY_PIE_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
}

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [overviewRes, incidentsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/incidents?pageSize=50'),
      ])
      if (overviewRes.ok) setData(await overviewRes.json())
      if (incidentsRes.ok) {
        const d = await incidentsRes.json()
        setIncidents(d.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const byTypeData = (data?.incidentsByType || []).map((d: any) => ({
    name: (d.type || '').replace(/_/g, ' '),
    count: d.count,
  }))
  const bySeverityData = (data?.incidentsBySeverity || []).map((d: any) => ({
    name: d.severity,
    value: d.count,
    color: SEVERITY_PIE_COLORS[d.severity] || '#94a3b8',
  }))

  const mapIncidents = incidents.map((inc: any) => ({
    ...inc,
    incidentType: inc.type,
    latitude: inc.latitude,
    longitude: inc.longitude,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Command Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time emergency response dashboard</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-black/[0.06] rounded-xl text-sm text-slate-600 shadow-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Active Incidents" value={data?.activeIncidents ?? 0} icon={<Activity className="h-5 w-5" />} valueClassName={data?.activeIncidents ? 'text-blue-600' : undefined} />
        <StatCard title="Critical" value={data?.criticalIncidents ?? 0} icon={<AlertTriangle className="h-5 w-5" />} valueClassName={data?.criticalIncidents ? 'text-red-600' : undefined} />
        <StatCard title="Pending Review" value={data?.pendingReview ?? 0} icon={<Clock className="h-5 w-5" />} valueClassName={data?.pendingReview ? 'text-orange-600' : undefined} />
        <StatCard title="Teams Available" value={data?.teamsAvailable ?? 0} icon={<Users className="h-5 w-5" />} valueClassName="text-green-600" />
        <StatCard title="Resources Available" value={data?.resourcesAvailable ?? 0} icon={<Package className="h-5 w-5" />} valueClassName="text-green-600" />
        <StatCard title="Low Stock Items" value={data?.lowStockItems ?? 0} icon={<TrendingUp className="h-5 w-5" />} valueClassName={data?.lowStockItems ? 'text-amber-600' : undefined} />
      </div>

      {/* Map + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Live Incident Map</h2>
          <IncidentMap incidents={mapIncidents} height="300px" center={[20.5937, 78.9629]} zoom={5} />
        </div>
        <div className="space-y-4">
          <WeatherWidget lat={28.6139} lon={77.209} />
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">By Severity</h2>
            {bySeverityData.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={bySeverityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" nameKey="name">
                    {bySeverityData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, color: '#0f172a' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#64748b', fontSize: 11 }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Type chart */}
      {byTypeData.length > 0 && (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byTypeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, color: '#0f172a' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
          <Link href="/dashboard/incidents" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {(!data?.recentActivity || data.recentActivity.length === 0) ? (
          <div className="p-6 text-center text-slate-400 text-sm">No incidents recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentActivity.map((inc: any) => (
              <Link key={inc.id} href={`/dashboard/incidents/${inc.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 transition-colors">
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${SEVERITY_DOT[inc.severity] || 'bg-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{inc.title}</p>
                  <p className="text-xs text-slate-400">{(inc.type || '').replace(/_/g,' ')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:block">{formatDateTime(inc.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
