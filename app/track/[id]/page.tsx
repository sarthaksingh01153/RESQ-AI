'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, MapPin, Radio } from 'lucide-react';
import { statusColor, statusLabel, incidentTypeIcon, formatDateTime, timeAgo } from '@/lib/utils';

export default function TrackPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/incidents/${params.id}/track`)
      .then(r=>r.json()).then(d=>{if(d.error)setError(d.error);else setData(d.incident);})
      .catch(()=>setError('Failed to load')).finally(()=>setLoading(false));
  }, [params.id]);

  const SEV: Record<string,string> = { CRITICAL:'text-red-400', HIGH:'text-orange-400', MEDIUM:'text-yellow-400', LOW:'text-green-400' };

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/></div>;
  if (!data) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4"/>
        <h1 className="text-xl font-bold text-white mb-2">Not Found</h1>
        <p className="text-slate-400 mb-6">{error||'No incident with this tracking ID.'}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300">← Return home</Link>
      </div>
    </div>
  );

  const ai = data.aiAnalyses?.[0];
  const wx = data.weatherObs?.[0];
  const wxAlerts: string[] = wx?.alerts ? JSON.parse(wx.alerts) : [];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back</Link>
          <span className="font-bold text-white">🆘 Incident Tracking</span>
          <div/>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{incidentTypeIcon(data.type)}</span>
                <span className="text-slate-400 text-sm font-mono">{data.trackingId}</span>
              </div>
              <h1 className="text-xl font-bold text-white">{data.title}</h1>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColor(data.status)}`}>{statusLabel(data.status)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-slate-500"/><span className={SEV[data.severity]||'text-white'}>{data.severity}</span></div>
            <div className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4"/>{timeAgo(data.createdAt)}</div>
            {data.address&&<div className="col-span-2 flex items-start gap-2 text-slate-400"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0"/><span className="text-slate-300 text-xs">{data.address}</span></div>}
          </div>
        </div>

        {wxAlerts.length>0&&<div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-4">
          <div className="font-medium text-amber-300 text-sm mb-2">⚠️ Weather Alerts at Location</div>
          {wxAlerts.map((a:string,i:number)=><div key={i} className="text-slate-300 text-sm">{a}</div>)}
          {wx&&<div className="text-slate-500 text-xs mt-2">Source: {wx.source}</div>}
        </div>}

        {ai?.summary&&<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Radio className="w-4 h-4 text-blue-400"/><span className="text-sm font-medium text-slate-300">AI Analysis</span></div>
          <p className="text-slate-300 text-sm leading-relaxed">{ai.summary}</p>
          <div className="text-slate-600 text-xs mt-3">{timeAgo(ai.createdAt)}</div>
        </div>}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Incident Timeline</h2>
          {(!data.timeline||data.timeline.length===0)?<div className="text-slate-500 text-sm text-center py-4">No public updates yet</div>:(
            <div className="space-y-4">
              {data.timeline.map((e:any,i:number)=>(
                <div key={e.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${i===data.timeline.length-1?'bg-blue-400 border-blue-400':'border-slate-600 bg-slate-800'}`}/>
                    {i<data.timeline.length-1&&<div className="w-0.5 flex-1 bg-slate-800 mt-1"/>}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(e.status)}`}>{statusLabel(e.status)}</span>
                      <span className="text-slate-500 text-xs">{formatDateTime(e.createdAt)}</span>
                    </div>
                    {e.note&&<p className="text-slate-400 text-sm">{e.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/report" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl text-center">Report Another</Link>
          <Link href="/" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl text-center">Home</Link>
        </div>
      </div>
    </div>
  );
}

