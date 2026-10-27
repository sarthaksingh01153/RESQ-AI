'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bot, MapPin, Clock, User, Phone, AlertTriangle, CheckCircle,
  RefreshCw, Send, Loader2, FileText, Map, Activity, Package, Truck,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { AgentActivityLog } from '@/components/dashboard/AgentActivityLog'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import dynamic from 'next/dynamic'

const IncidentMap = dynamic(
  () => import('@/components/dashboard/IncidentMap').then((m) => m.IncidentMap),
  { ssr: false, loading: () => <div className="h-48 bg-slate-100 rounded-xl animate-pulse" /> }
)

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  LOW: 'text-green-700 bg-green-50 border-green-200',
}
const STATUS_COLORS: Record<string, string> = {
  REPORTED: 'text-slate-600 bg-slate-100 border-slate-200',
  ANALYZING: 'text-blue-700 bg-blue-50 border-blue-200',
  VERIFIED: 'text-purple-700 bg-purple-50 border-purple-200',
  DISPATCHED: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  IN_PROGRESS: 'text-amber-700 bg-amber-50 border-amber-200',
  RESOLVED: 'text-green-700 bg-green-50 border-green-200',
  CLOSED: 'text-slate-500 bg-slate-50 border-slate-200',
}

function fdt(d: string) {
  return new Date(d).toLocaleString()
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [incident, setIncident] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [planGenerating, setPlanGenerating] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [rescuePlans, setRescuePlans] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [incRes, tlRes, planRes] = await Promise.all([
        fetch(`/api/incidents/${id}`),
        fetch(`/api/incidents/${id}/timeline`),
        fetch(`/api/incidents/${id}/rescue-plan`),
      ])
      if (!incRes.ok) { router.push('/dashboard/incidents'); return }
      const incData = await incRes.json()
      setIncident(incData.incident)
      setReservations(incData.incident?.reservations || [])
      if (tlRes.ok) setTimeline((await tlRes.json()).timeline || [])
      if (planRes.ok) setRescuePlans((await planRes.json()).plans || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load incident', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch(`/api/incidents/${id}/analyze`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'AI Analysis Started', description: 'Analysis is running…' })
        setTimeout(fetchAll, 4000)
      } else {
        toast({ title: 'Error', description: 'Failed to start analysis', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setAnalyzing(false)
    }
  }

  const generatePlan = async () => {
    setPlanGenerating(true)
    try {
      const res = await fetch(`/api/incidents/${id}/rescue-plan`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Rescue Plan Generated' })
        fetchAll()
      } else {
        toast({ title: 'Error', description: 'Failed to generate plan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setPlanGenerating(false)
    }
  }

  const updateStatus = async () => {
    if (!newStatus) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: statusNote }),
      })
      if (res.ok) {
        toast({ title: 'Status Updated' })
        fetchAll()
        setNewStatus('')
        setStatusNote('')
      } else {
        toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const approveReservation = async (resId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/approve`, { method: 'POST' })
      if (res.ok) { toast({ title: 'Reservation Approved' }); fetchAll() }
      else toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' })
    } catch { toast({ title: 'Error', description: 'Network error', variant: 'destructive' }) }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-white border border-black/[0.06] rounded-xl animate-pulse w-48" />
        <div className="h-40 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
        <div className="h-96 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!incident) return null

  const analyses = incident.aiAnalyses || []
  const latestAnalysis = analyses[0]

  const rescuePlan = rescuePlans[0]
  const resRequired = rescuePlan?.resourcesRequired
    ? (() => { try { return JSON.parse(rescuePlan.resourcesRequired) } catch { return [] } })()
    : []

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <Link href="/dashboard/incidents" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Incidents
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-slate-900">{incident.title}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[incident.status]}`}>{(incident.status || '').replace(/_/g,' ')}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-mono">{incident.trackingId}</code>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fdt(incident.createdAt)}</span>
              {incident.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{incident.address}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAnalysis} disabled={analyzing} variant="outline" size="sm">
              <Bot className={`h-4 w-4 mr-1.5 ${analyzing ? 'animate-pulse' : ''}`} />
              {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
            </Button>
            <Button onClick={fetchAll} variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview"><FileText className="h-3.5 w-3.5 mr-1.5" />Overview</TabsTrigger>
              <TabsTrigger value="analysis"><Bot className="h-3.5 w-3.5 mr-1.5" />AI Analysis</TabsTrigger>
              <TabsTrigger value="plan"><Map className="h-3.5 w-3.5 mr-1.5" />Rescue Plan</TabsTrigger>
              <TabsTrigger value="resources"><Package className="h-3.5 w-3.5 mr-1.5" />Resources</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="h-3.5 w-3.5 mr-1.5" />Agent Log</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Incident Details</h3>
                <p className="text-sm text-slate-600">{incident.description || 'No description.'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400 mb-0.5">Type</p><p className="text-slate-800 font-medium">{(incident.type || '').replace(/_/g,' ')}</p></div>
                  <div><p className="text-xs text-slate-400 mb-0.5">Reporter</p><p className="text-slate-800 font-medium flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" />{incident.reportedBy?.name || incident.reporterName || 'Anonymous'}</p></div>
                  <div><p className="text-xs text-slate-400 mb-0.5">Contact</p><p className="text-slate-800 font-medium flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" />{incident.reporterPhone || '—'}</p></div>
                  <div><p className="text-xs text-slate-400 mb-0.5">Assigned To</p><p className="text-slate-800 font-medium">{incident.assignedTo?.name || 'Unassigned'}</p></div>
                </div>
                {incident.notes && (
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400 mb-1">Officer Notes</p>
                    <p className="text-sm text-slate-700">{incident.notes}</p>
                  </div>
                )}
              </div>

              {incident.latitude && incident.longitude && (
                <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Location</h3>
                  <IncidentMap
                    incidents={[{ ...incident, incidentType: incident.type }]}
                    center={[incident.latitude, incident.longitude]}
                    zoom={14} height="220px"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Timeline</h3>
                {timeline.length === 0 ? (
                  <p className="text-slate-400 text-xs">No timeline entries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((entry: any, i: number) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100 mt-1 flex-shrink-0" />
                          {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium text-slate-800">{entry.status.replace(/_/g,' ')}</p>
                          {entry.note && <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>}
                          <p className="text-xs text-slate-400 mt-1">{fdt(entry.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Analysis */}
            <TabsContent value="analysis" className="space-y-4 mt-4">
              {analyses.length === 0 ? (
                <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center shadow-sm">
                  <Bot className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">No analysis yet</p>
                  <p className="text-slate-400 text-sm mb-4">Run AI analysis to get incident insights and priority assessment.</p>
                  <Button onClick={runAnalysis} disabled={analyzing}>
                    <Bot className="h-4 w-4 mr-2" />{analyzing ? 'Analyzing…' : 'Run AI Analysis'}
                  </Button>
                </div>
              ) : (
                analyses.map((analysis: any, i: number) => {
                  const facts = analysis.keyFacts ? (() => { try { return JSON.parse(analysis.keyFacts) } catch { return [] } })() : []
                  const missing = analysis.missingInfo ? (() => { try { return JSON.parse(analysis.missingInfo) } catch { return [] } })() : []
                  return (
                    <div key={analysis.id} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Analysis #{analyses.length - i} — {analysis.agentName}</span>
                        <span className="text-xs text-slate-400">{fdt(analysis.createdAt)}</span>
                      </div>
                      {analysis.isMock && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          Demo Mode — Configure GEMINI_API_KEY for real AI analysis
                        </div>
                      )}
                      {analysis.summary && (
                        <div><p className="text-xs text-slate-400 mb-1">Summary</p><p className="text-sm text-slate-700">{analysis.summary}</p></div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs text-slate-400 mb-1">Classification</p><p className="text-sm font-medium text-slate-800">{analysis.classification || '—'}</p></div>
                        <div><p className="text-xs text-slate-400 mb-1">Severity Assessment</p><p className="text-sm font-medium text-slate-800">{analysis.severity || '—'}</p></div>
                      </div>
                      {analysis.priorityReason && (
                        <div><p className="text-xs text-slate-400 mb-1">Priority Reasoning</p><p className="text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-100 p-3">{analysis.priorityReason}</p></div>
                      )}
                      {facts.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Key Facts</p>
                          <ul className="space-y-1">
                            {facts.map((f: string, i: number) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {missing.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Missing Information</p>
                          <ul className="space-y-1">
                            {missing.map((m: string, i: number) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </TabsContent>

            {/* Rescue Plan */}
            <TabsContent value="plan" className="space-y-4 mt-4">
              {!rescuePlan ? (
                <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center shadow-sm">
                  <Map className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">No rescue plan yet</p>
                  <p className="text-slate-400 text-sm mb-4">Generate an AI-powered rescue plan.</p>
                  <Button onClick={generatePlan} disabled={planGenerating}>
                    {planGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                    {planGenerating ? 'Generating…' : 'Generate Rescue Plan'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">Rescue Plan</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rescuePlan.status === 'APPROVED' ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                        {rescuePlan.status}
                      </span>
                      <span className="text-xs text-slate-400">{fdt(rescuePlan.createdAt)}</span>
                    </div>
                  </div>
                  {rescuePlan.isMock && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      Demo Mode — Configure GEMINI_API_KEY for real AI planning
                    </div>
                  )}
                  {rescuePlan.summary && (
                    <div><p className="text-xs text-slate-400 mb-1">Summary</p><p className="text-sm text-slate-700">{rescuePlan.summary}</p></div>
                  )}
                  {rescuePlan.estimatedTime && (
                    <div><p className="text-xs text-slate-400 mb-1">Estimated Time</p><p className="text-sm text-slate-800">{rescuePlan.estimatedTime} minutes</p></div>
                  )}
                  {rescuePlan.routeInfo && (
                    <div><p className="text-xs text-slate-400 mb-1">Route Information</p><p className="text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-100 p-3">{rescuePlan.routeInfo}</p></div>
                  )}
                  {rescuePlan.weatherInfo && (
                    <div><p className="text-xs text-slate-400 mb-1">Weather Conditions</p><p className="text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-100 p-3">{rescuePlan.weatherInfo}</p></div>
                  )}
                  {resRequired.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Resources Required</p>
                      <div className="flex flex-wrap gap-1.5">
                        {resRequired.map((r: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button onClick={generatePlan} disabled={planGenerating} variant="outline" size="sm">
                      {planGenerating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Resources */}
            <TabsContent value="resources" className="space-y-4 mt-4">
              {reservations.length === 0 ? (
                <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center shadow-sm">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No resource reservations yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Generate a rescue plan to auto-assign resources.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((res: any) => (
                    <div key={res.id} className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">Reservation #{res.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-400">Status: {res.status}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${res.status === 'APPROVED' ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {res.status}
                          </span>
                          {res.status === 'PENDING' && (
                            <Button size="sm" variant="outline" onClick={() => approveReservation(res.id)}>Approve</Button>
                          )}
                        </div>
                      </div>
                      {res.items && res.items.length > 0 && (
                        <div className="space-y-1.5">
                          {res.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-xs text-slate-500">
                              <Package className="h-3.5 w-3.5 text-slate-400" />
                              <span>{item.item?.name || 'Unknown Item'}</span>
                              <span className="font-medium">× {item.quantity}</span>
                              {item.reason && <span className="text-slate-400">({item.reason})</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Agent Activity */}
            <TabsContent value="activity" className="mt-4">
              <AgentActivityLog incidentId={id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Update Status</h3>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue placeholder="Select new status…" /></SelectTrigger>
              <SelectContent>
                {['REPORTED','ANALYZING','VERIFIED','DISPATCHED','IN_PROGRESS','RESOLVED','CLOSED'].map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <textarea
              className="w-full text-sm bg-white border border-slate-200 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Add officer notes (optional)…"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
            <Button onClick={updateStatus} disabled={!newStatus || updatingStatus} className="w-full" size="sm">
              {updatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Update Status
            </Button>
          </div>

          {incident.latitude && incident.longitude && (
            <WeatherWidget lat={incident.latitude} lon={incident.longitude} />
          )}
        </div>
      </div>
    </div>
  )
}
