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
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-50 text-green-700 border-green-200',
}

const STATUS_VARIANTS: Record<string, string> = {
  REPORTED: 'bg-slate-100 text-slate-600 border-slate-200',
  ANALYZING: 'bg-blue-50 text-blue-700 border-blue-200',
  VERIFIED: 'bg-purple-50 text-purple-700 border-purple-200',
  DISPATCHED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-slate-50 text-slate-500 border-slate-200',
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
          <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total incidents</p>
        </div>
        <Button onClick={fetchIncidents} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search incidents…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {['REPORTED','ANALYZING','VERIFIED','DISPATCHED','IN_PROGRESS','RESOLVED','CLOSED'].map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900 rounded-xl"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            {['CRITICAL','HIGH','MEDIUM','LOW'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900 rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {INCIDENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Tracking ID','Title','Type','Severity','Status','Reporter','Time','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 uppercase text-[11px] font-semibold tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400">No incidents found</p>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{inc.trackingId}</code>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/dashboard/incidents/${inc.id}`} className="text-slate-800 hover:text-blue-600 font-medium truncate block">
                        {inc.title}
                      </Link>
                      <p className="text-xs text-slate-400 truncate">{inc.address || '—'}</p>
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
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(inc.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/dashboard/incidents/${inc.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Button
                          variant="ghost" size="sm" className="h-7 px-2 text-blue-500 hover:text-blue-700"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {page} of {totalPages} · {total} total</p>
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
