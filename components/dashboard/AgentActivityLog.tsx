'use client'

import React, { useEffect, useState } from 'react'
import { Bot, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentActivity {
  id: string
  agentName: string
  action: string
  status: string
  toolsUsed: string | null
  result: string | null
  errorMsg: string | null
  duration: number | null
  createdAt: string
}

interface AgentActivityLogProps {
  incidentId: string
  className?: string
}

function fmt(d: string) {
  return new Date(d).toLocaleString()
}

export function AgentActivityLog({ incidentId, className }: AgentActivityLogProps) {
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/incidents/${incidentId}/ai-activity`)
        if (res.ok) {
          const data = await res.json()
          setActivities(data.activities || [])
        }
      } catch { }
      setLoading(false)
    }
    fetchActivities()
  }, [incidentId])

  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-xl border border-black/[0.06]" />
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-black/[0.06] bg-white p-6 text-center shadow-sm', className)}>
        <Bot className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No AI agent activity recorded yet.</p>
        <p className="text-xs text-slate-400 mt-1">Run AI analysis to see activity here.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {activities.map((activity) => {
        const isExpanded = expanded === activity.id
        const tools = activity.toolsUsed
          ? (() => { try { return JSON.parse(activity.toolsUsed) } catch { return [] } })()
          : []

        return (
          <div key={activity.id} className="rounded-xl border border-black/[0.06] bg-white overflow-hidden shadow-sm">
            <button
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : activity.id)}
            >
              <div className="flex-shrink-0">
                {activity.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                  : activity.status === 'FAILED' ? <XCircle className="h-5 w-5 text-red-500" />
                    : activity.status === 'RUNNING' ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      : <Clock className="h-5 w-5 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{activity.agentName}</span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-sm text-slate-500 truncate">{activity.action}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">{fmt(activity.createdAt)}</span>
                  {activity.duration && <span className="text-xs text-slate-400">{(activity.duration / 1000).toFixed(1)}s</span>}
                  {tools.length > 0 && <span className="text-xs text-blue-600 font-medium">{tools.length} tool{tools.length > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 text-slate-400">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50">
                {tools.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Tools Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {tools.map((tool: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
                {activity.result && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Result:</p>
                    <p className="text-xs text-slate-600 bg-white rounded-lg border border-slate-100 p-2 max-h-32 overflow-y-auto">
                      {activity.result.length > 500 ? activity.result.substring(0, 500) + '…' : activity.result}
                    </p>
                  </div>
                )}
                {activity.errorMsg && (
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
                    <p className="text-xs text-red-700 bg-red-50 rounded-lg border border-red-100 p-2">{activity.errorMsg}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
