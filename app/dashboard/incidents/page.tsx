'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Search, RefreshCw, ChevronLeft, ChevronRight, Bot, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { formatDateTime } from '@/lib/utils'

const SEVERITY_VARIANTS: Record<string, string> = {
  CRITICAL: 'bg-red-900/40 text-red-400 border-red-800',
  HIGH: 'bg-orange-900/40 text-orange-400 border-orange-800',
  MEDIUM: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  LOW: 'bg-green-900/40 text-green-400 border-green-800',
}

const STATUS_VARIANTS: Record<string, string> = {
  REPORTED: 'bg-slate-700 text-slate-300 border-slate-600',
  ANALYZING: 'bg-blue-900/40 text-blue-400 border-blue-800',
  VERIFIED: 'bg-purple-900/40 text-purple-400 border-purple-800',
  DISPATCHED: 'bg-cyan-900/40 text-cyan-400 border-cyan-800',
  IN_PROGRESS: 'bg-amber-900/40 text-amber-400 border-amber-800',
  RESOLVED: 'bg-green-900/40 text-green-400 border-green-800',
  CLOSED: 'bg-slate-800 text-slate-500 border-slate-700',
}

const INCIDENT_TYPES = [
  { value: 'FLOOD', label: 'Flood' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'EARTHQUAKE', label: 'Earthquake' },
  { value: 'BUILDING_COLLAPSE', label: 'Building Collapse' },
  { value: 'MISSING_PERSON', label: 'Missing Person' },
  { value: 'OTHER', label: 'Other' },
]

export default function IncidentsPage() {
  const { toast } = useToast()
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (severityFilter !== 'ALL') params.set('severity', severityFilter)
    if (typeFilter !== 'ALL') params.set('type', typeFilter)
    try {
      const res = await fetch(`/api/incidents?${params}`)
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.data || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load incidents', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, severityFilter, typeFilter])

  useEffect(() => { fetchIncidents() }, [fetchIncidents])

  const runAnalysis = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAnalyzing(id)
    try {
      const res = await fetch(`/api/incidents/${id}/analyze`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'AI Analysis Started', description: 'Analysis running in background.' })
        setTimeout(fetchIncidents, 3000)
      } else {
        toast({ title: 'Error', description: 'Failed to start analysis', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setAnalyzing(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Incidents</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total incidents</p>
        </div>
        <Button onClick={fetchIncidents} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search incidents…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {['REPORTED','ANALYZING','VERIFIED','DISPATCHED','IN_PROGRESS','RESOLVED','CLOSED'].map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            {['CRITICAL','HIGH','MEDIUM','LOW'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {INCIDENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Tracking ID','Title','Type','Severity','Status','Reporter','Time','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <AlertTriangle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">No incidents found</p>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">{inc.trackingId}</code>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/dashboard/incidents/${inc.id}`} className="text-slate-200 hover:text-blue-400 font-medium truncate block">
                        {inc.title}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">{inc.address || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{(inc.type || '').replace(/_/g,' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_VARIANTS[inc.severity] || ''}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANTS[inc.status] || ''}`}>
                        {(inc.status || '').replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{inc.reportedBy?.name || inc.reporterName || 'Anonymous'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(inc.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/dashboard/incidents/${inc.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Button
                          variant="ghost" size="sm" className="h-7 px-2 text-blue-400 hover:text-blue-300"
                          onClick={(e) => runAnalysis(inc.id, e)}
                          disabled={analyzing === inc.id}
                          title="Run AI Analysis"
                        >
                          <Bot className={`h-3.5 w-3.5 ${analyzing === inc.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} · {total} total</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

