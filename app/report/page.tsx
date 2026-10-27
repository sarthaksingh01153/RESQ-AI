'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, ChevronLeft, CheckCircle, Copy, Navigation } from 'lucide-react';

const TYPES=[{value:'FLOOD',label:'Flood',icon:'🌊',desc:'Flash flood, river overflow',aid:'Move to higher ground. Do not walk through moving water.'},{value:'FIRE',label:'Fire',icon:'🔥',desc:'Building fire, forest fire',aid:'Evacuate immediately. Stay low in smoke. Do not use lifts.'},{value:'ROAD_ACCIDENT',label:'Road Accident',icon:'🚗',desc:'Vehicle collision',aid:'Do not move injured unless in danger. Secure the scene.'},{value:'MEDICAL',label:'Medical Emergency',icon:'🚑',desc:'Cardiac arrest, stroke',aid:'Keep person calm. Do not give food/water. CPR if trained and unresponsive.'},{value:'EARTHQUAKE',label:'Earthquake',icon:'🌍',desc:'Seismic activity',aid:'Drop, cover, hold on. Check for gas leaks after shaking stops.'},{value:'BUILDING_COLLAPSE',label:'Building Collapse',icon:'🏚️',desc:'Structural failure',aid:'Evacuate if safe. Do not re-enter damaged structure.'},{value:'MISSING_PERSON',label:'Missing Person',icon:'👤',desc:'Missing adult or child',aid:'Note last known location. Alert authorities immediately.'},{value:'OTHER',label:'Other',icon:'⚠️',desc:'Other emergency',aid:'Ensure your safety first. Call emergency services.'}];
const SEV=[{value:'LOW',label:'Low',cls:'border-green-500'},{value:'MEDIUM',label:'Medium',cls:'border-yellow-500'},{value:'HIGH',label:'High',cls:'border-orange-500'},{value:'CRITICAL',label:'Critical',cls:'border-red-500'}];

export default function ReportPage() {
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({type:'',severity:'MEDIUM',title:'',description:'',latitude:'',longitude:'',address:'',reporterName:'',reporterPhone:'',reporterEmail:''});
  const [locating,setLocating] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState<{trackingId:string}|null>(null);
  const [copied,setCopied] = useState(false);
  const upd = (k:string,v:string) => setForm(p=>({...p,[k]:v}));
  const selType = TYPES.find(t=>t.value===form.type);

  const detectGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(p=>{upd('latitude',p.coords.latitude.toFixed(6));upd('longitude',p.coords.longitude.toFixed(6));setLocating(false);},(err)=>{setLocating(false);setError('GPS unavailable. Enter coordinates manually.');},{timeout:10000});
  };

  const canNext = () => {
    if (step===1) return !!form.type;
    if (step===2) return form.title.length>=5&&form.description.length>=10&&form.latitude&&form.longitude;
    return true;
  };

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/incidents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:form.type,severity:form.severity,title:form.title,description:form.description,latitude:parseFloat(form.latitude),longitude:parseFloat(form.longitude),address:form.address||undefined,reporterName:form.reporterName||'Anonymous',reporterPhone:form.reporterPhone||undefined,reporterEmail:form.reporterEmail||undefined})});
      const data = await res.json();
      if (!res.ok){setError(data.error||'Submission failed');return;}
      setSuccess({trackingId:data.incident.trackingId});
    } catch{setError('Network error.');}
    finally{setLoading(false);}
  };

  if (success) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-400"/></div>
        <h1 className="text-2xl font-bold text-white mb-3">Emergency Reported</h1>
        <p className="text-slate-400 mb-6">Your report has been logged. AI analysis is underway and officers have been notified.</p>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="text-slate-400 text-sm mb-2">Tracking ID</div>
          <div className="text-2xl font-bold text-white font-mono mb-3">{success.trackingId}</div>
          <button onClick={()=>{navigator.clipboard.writeText(success.trackingId);setCopied(true);setTimeout(()=>setCopied(false),2000);}} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mx-auto"><Copy className="w-4 h-4"/>{copied?'Copied!':'Copy'}</button>
        </div>
        <div className="flex gap-3">
          <Link href={`/track/${success.trackingId}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-center">Track Incident</Link>
          <Link href="/" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl text-center">Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back</Link>
          <span className="font-bold text-white flex items-center gap-2"><span className="text-red-500">🆘</span>Report Emergency</span>
          <span className="text-sm text-slate-500">Step {step}/3</span>
        </div>
      </div>
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">{[1,2,3].map(s=><div key={s} className={`flex-1 h-1.5 rounded-full ${s<=step?'bg-red-500':'bg-slate-800'}`}/>)}</div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error&&<div className="mb-6 flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3 text-red-400 text-sm"><AlertTriangle className="w-4 h-4 flex-shrink-0"/>{error}</div>}

        {step===1&&(
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What is the emergency?</h2>
            <p className="text-slate-400 text-sm mb-6">Select the type that best describes the situation</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {TYPES.map(t=>(
                <button key={t.value} onClick={()=>upd('type',t.value)} className={`p-4 rounded-xl border-2 text-left transition-all ${form.type===t.value?'border-red-500 bg-slate-800':'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-white font-medium text-sm">{t.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
            {selType&&<div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-4"><div className="text-amber-300 font-medium text-sm mb-1">⚠️ Immediate Safety Guidance</div><div className="text-slate-300 text-sm">{selType.aid}</div></div>}
          </div>
        )}

        {step===2&&(
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white mb-1">Incident details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brief Title *</label>
              <input value={form.title} onChange={e=>upd('title',e.target.value)} maxLength={200} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="e.g. Flood on NH-48 near Gurgaon"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {SEV.map(s=><button key={s.value} type="button" onClick={()=>upd('severity',s.value)} className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.severity===s.value?`${s.cls} bg-slate-800 text-white`:'border-slate-700 text-slate-400'}`}>{s.label}</button>)}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-300">Description *</label><span className="text-xs text-slate-500">{form.description.length}/5000</span></div>
              <textarea value={form.description} onChange={e=>upd('description',e.target.value)} rows={4} maxLength={5000} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none" placeholder="Describe what is happening: people affected, hazards, access routes..."/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
              <button type="button" onClick={detectGPS} disabled={locating} className="w-full mb-2 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/30 text-blue-400 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm">
                {locating?<><div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"/>Detecting...</>:<><Navigation className="w-4 h-4"/>Use My GPS Location</>}
              </button>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input type="number" step="any" value={form.latitude} onChange={e=>upd('latitude',e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" placeholder="Latitude"/>
                <input type="number" step="any" value={form.longitude} onChange={e=>upd('longitude',e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" placeholder="Longitude"/>
              </div>
              <input value={form.address} onChange={e=>upd('address',e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" placeholder="Street address or landmark (optional)"/>
            </div>
          </div>
        )}

        {step===3&&(
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white mb-1">Your details</h2>
            {[{k:'reporterName',label:'Your Name *',type:'text',ph:'Full name',req:true},{k:'reporterPhone',label:'Phone (recommended)',type:'text',ph:'+91 98765 43210',req:false},{k:'reporterEmail',label:'Email (optional)',type:'email',ph:'your@email.com',req:false}].map(f=>(
              <div key={f.k}>
                <label className="block text-sm font-medium text-slate-300 mb-2">{f.label}</label>
                <input type={f.type} value={(form as Record<string,string>)[f.k]} onChange={e=>upd(f.k,e.target.value)} required={f.req} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder={f.ph}/>
              </div>
            ))}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm space-y-2">
              <div className="font-medium text-white">Summary</div>
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white">{selType?.label}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Severity</span><span className="text-white">{form.severity}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white">{form.address||`${form.latitude}, ${form.longitude}`}</span></div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-400">By submitting, you confirm this is a genuine emergency. False reports waste critical resources.</div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step>1&&<button onClick={()=>setStep(s=>s-1)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4"/>Back</button>}
          {step<3
            ?<button onClick={()=>setStep(s=>s+1)} disabled={!canNext()} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">Continue<ChevronRight className="w-4 h-4"/></button>
            :<button onClick={submit} disabled={loading||!form.reporterName} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting...</>:'Submit Emergency Report'}
            </button>
          }
        </div>
      </div>
    </div>
  );
}

