'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, MapPin, Radio, Shield, Phone, RefreshCw, CloudRain, CheckCircle, Info } from 'lucide-react';
import { statusColor, statusLabel, incidentTypeIcon, formatDateTime, timeAgo } from '@/lib/utils';

const SEV: Record<string, string> = {
  CRITICAL: 'text-red-600 font-semibold',
  HIGH: 'text-orange-600 font-semibold',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-green-600',
};

// Reviewed safety guidance shown on tracking page — static, not AI-generated
const SAFETY: Record<string, { steps: string[]; calls: string[] }> = {
  FLOOD: {
    steps: ['Move to higher ground immediately.', 'Do not walk through moving water.', 'Turn off electricity at the main switch.', 'Do not drink flood water.'],
    calls: ['112 — National Emergency', '1078 — NDRF Helpline'],
  },
  FIRE: {
    steps: ['Evacuate immediately using stairs, not lifts.', 'Crawl low under smoke.', 'Close doors behind you to slow fire spread.'],
    calls: ['101 — Fire Brigade', '112 — National Emergency'],
  },
  ROAD_ACCIDENT: {
    steps: ['Do not move the injured unless in immediate danger.', 'Apply pressure to wounds with a clean cloth.', 'Keep the injured person still and calm.'],
    calls: ['108 — Ambulance', '1073 — Road Accident Helpline'],
  },
  MEDICAL: {
    steps: ['Call 108 immediately and stay on the line.', 'Start CPR if trained and person is unresponsive.', 'Do not give food or water.'],
    calls: ['108 — Ambulance', '112 — National Emergency'],
  },
  EARTHQUAKE: {
    steps: ['Drop, Cover, Hold On until shaking stops.', 'Stay away from windows and heavy furniture.', 'Do not use lifts after quake. Check for gas leaks.'],
    calls: ['112 — National Emergency', '1078 — NDRF'],
  },
  BUILDING_COLLAPSE: {
    steps: ['If trapped: tap on pipes or walls to signal.', 'Cover mouth with clothing against dust.', 'Do not re-enter damaged structure.'],
    calls: ['112 — National Emergency', '101 — Fire & Rescue'],
  },
  MISSING_PERSON: {
    steps: ['File a police report immediately — do not wait.', 'Note last known location, clothing, and time.', 'Share a recent photograph with authorities.'],
    calls: ['112 — Police', '1094 — Missing Persons Helpline', '1098 — Child Helpline'],
  },
  OTHER: {
    steps: ['Ensure your own safety first.', 'Follow instructions from emergency services.'],
    calls: ['112 — National Emergency', '108 — Ambulance'],
  },
};

export default function TrackPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    fetch(`/api/incidents/${params.id}/track`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d.incident); })
      .catch(() => setError('Failed to load'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, [params.id]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">
      <div className="text-center max-w-sm bg-white border border-black/[0.06] rounded-2xl shadow-sm p-8">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Not Found</h1>
        <p className="text-slate-500 mb-6">{error || 'No incident with this tracking ID.'}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700">Return home</Link>
      </div>
    </div>
  );

  const ai = data.aiAnalyses?.[0];
  const wx = data.weatherObs?.[0];
  const wxAlerts: string[] = wx?.alerts ? JSON.parse(wx.alerts) : [];
  const safety = SAFETY[data.type] || SAFETY['OTHER'];
  const isResolved = ['RESOLVED', 'CLOSED', 'FALSE_ALARM'].includes(data.status);

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <div className="border-b border-black/[0.06] bg-white/90 backdrop-blur-md px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">Back</Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900">Incident Tracking</span>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Emergency Call Action ───────────────────────────────────── */}
        {!isResolved && (
          <div className="bg-red-600 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="text-white">
              <div className="font-bold text-sm">Need immediate help?</div>
              <div className="text-red-100 text-xs">Tap to call national emergency</div>
            </div>
            <a
              href="tel:112"
              className="bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-50 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Call 112
            </a>
          </div>
        )}

        {/* ── Incident Card ────────────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{incidentTypeIcon(data.type)}</span>
                <code className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{data.trackingId}</code>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{data.title}</h1>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border flex-shrink-0 ml-2 ${statusColor(data.status)}`}>
              {statusLabel(data.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={SEV[data.severity] || 'text-slate-700'}>{data.severity}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 flex-shrink-0" />
              {timeAgo(data.createdAt)}
            </div>
            {data.address && (
              <div className="col-span-2 flex items-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600 text-xs">{data.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Safety Guidance (Static — Reviewed) ─────────────────────── */}
        {!isResolved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-700" />
              <span className="font-semibold text-amber-800 text-sm">Reviewed Safety Guidance</span>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-auto">Official</span>
            </div>
            <div className="space-y-1.5 mb-4">
              {safety.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-amber-200 pt-3">
              <div className="text-amber-700 text-xs font-medium mb-2">Emergency Numbers:</div>
              <div className="flex flex-wrap gap-2">
                {safety.calls.map((num, i) => {
                  const digits = num.match(/^\d+/)?.[0] || '112';
                  return (
                    <a key={i} href={`tel:${digits}`}
                      className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                      <Phone className="w-3 h-3" />{num}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 text-amber-600 text-xs">
              Source: NDMA India — these are reviewed guidelines, not AI-generated.
            </div>
          </div>
        )}

        {/* ── Weather Alerts ───────────────────────────────────────────── */}
        {wxAlerts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 text-sm">Weather Alerts at Location</span>
            </div>
            {wxAlerts.map((a: string, i: number) => (
              <div key={i} className="text-blue-700 text-sm">{a}</div>
            ))}
            {wx && <div className="text-blue-500 text-xs mt-2">Source: {wx.source} — {wx.observedAt ? timeAgo(wx.observedAt) : ''}</div>}
          </div>
        )}

        {/* ── AI Analysis ─────────────────────────────────────────────── */}
        {ai?.summary && (
          <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">AI Assessment</span>
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full ml-auto">
                AI-generated
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{ai.summary}</p>
            <div className="flex items-center gap-2 mt-3 text-slate-400 text-xs">
              <Info className="w-3 h-3" />
              AI recommendations are advisory only. Always follow official emergency services guidance.
            </div>
          </div>
        )}

        {/* ── Timeline ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Incident Timeline</h2>
          {(!data.timeline || data.timeline.length === 0) ? (
            <div className="text-slate-400 text-sm text-center py-4">No public updates yet. Updates will appear here as the situation develops.</div>
          ) : (
            <div className="space-y-4">
              {data.timeline.map((e: any, i: number) => (
                <div key={e.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      i === data.timeline.length - 1
                        ? 'bg-blue-500 border-blue-500 ring-2 ring-blue-100'
                        : 'border-slate-300 bg-white'
                    }`} />
                    {i < data.timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(e.status)}`}>
                        {statusLabel(e.status)}
                      </span>
                      <span className="text-slate-400 text-xs">{formatDateTime(e.createdAt)}</span>
                    </div>
                    {e.note && <p className="text-slate-500 text-sm">{e.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Resolved Banner ──────────────────────────────────────────── */}
        {isResolved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <div className="font-semibold text-green-800">Incident Resolved</div>
            <p className="text-green-700 text-sm mt-1">This incident has been marked as resolved by emergency services.</p>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Link href="/report" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl text-center transition-colors shadow-sm text-sm">
            Report Another Emergency
          </Link>
          <Link href="/" className="flex-1 bg-white hover:bg-slate-50 border border-black/[0.06] text-slate-700 font-medium py-3 rounded-xl text-center transition-colors shadow-sm text-sm">
            Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          Auto-refreshes every 30 seconds &bull; Last updated {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
