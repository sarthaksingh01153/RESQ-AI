'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, MapPin, Radio, Shield } from 'lucide-react';
import { statusColor, statusLabel, incidentTypeIcon, formatDateTime, timeAgo } from '@/lib/utils';

export default function TrackPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/incidents/${params.id}/track`)
      .then(r => r.json()).then(d => { if (d.error) setError(d.error); else setData(d.incident); })
      .catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, [params.id]);

  const SEV: Record<string, string> = {
    CRITICAL: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-green-600',
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">
      <div className="text-center max-w-sm bg-white border border-black/[0.06] rounded-2xl shadow-sm p-8">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4"/>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Not Found</h1>
        <p className="text-slate-500 mb-6">{error || 'No incident with this tracking ID.'}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700">← Return home</Link>
      </div>
    </div>
  );

  const ai = data.aiAnalyses?.[0];
  const wx = data.weatherObs?.[0];
  const wxAlerts: string[] = wx?.alerts ? JSON.parse(wx.alerts) : [];

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <div className="border-b border-black/[0.06] bg-white/90 backdrop-blur-md px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">← Back</Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900">Incident Tracking</span>
          </div>
          <div/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Main incident card */}
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{incidentTypeIcon(data.type)}</span>
                <code className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{data.trackingId}</code>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{data.title}</h1>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColor(data.status)}`}>{statusLabel(data.status)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400"/>
              <span className={SEV[data.severity] || 'text-slate-700'}>{data.severity}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4"/>
              {timeAgo(data.createdAt)}
            </div>
            {data.address && (
              <div className="col-span-2 flex items-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                <span className="text-slate-600 text-xs">{data.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Weather alerts */}
        {wxAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="font-medium text-amber-800 text-sm mb-2">⚠️ Weather Alerts at Location</div>
            {wxAlerts.map((a: string, i: number) => <div key={i} className="text-amber-700 text-sm">{a}</div>)}
            {wx && <div className="text-amber-600 text-xs mt-2">Source: {wx.source}</div>}
          </div>
        )}

        {/* AI Analysis */}
        {ai?.summary && (
          <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-blue-500"/>
              <span className="text-sm font-medium text-slate-700">AI Analysis</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{ai.summary}</p>
            <div className="text-slate-400 text-xs mt-3">{timeAgo(ai.createdAt)}</div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Incident Timeline</h2>
          {(!data.timeline || data.timeline.length === 0) ? (
            <div className="text-slate-400 text-sm text-center py-4">No public updates yet</div>
          ) : (
            <div className="space-y-4">
              {data.timeline.map((e: any, i: number) => (
                <div key={e.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${i === data.timeline.length - 1 ? 'bg-blue-500 border-blue-500 ring-2 ring-blue-100' : 'border-slate-300 bg-white'}`}/>
                    {i < data.timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1"/>}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(e.status)}`}>{statusLabel(e.status)}</span>
                      <span className="text-slate-400 text-xs">{formatDateTime(e.createdAt)}</span>
                    </div>
                    {e.note && <p className="text-slate-500 text-sm">{e.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/report" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl text-center transition-colors shadow-sm">Report Another</Link>
          <Link href="/" className="flex-1 bg-white hover:bg-slate-50 border border-black/[0.06] text-slate-700 font-medium py-3 rounded-xl text-center transition-colors shadow-sm">Home</Link>
        </div>
      </div>
    </div>
  );
}
