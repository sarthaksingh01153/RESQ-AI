'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Shield, Zap, MapPin, BarChart3, Users, CheckCircle, Phone, Radio } from 'lucide-react';

const TYPES = [{icon:'🌊',label:'Flood'},{icon:'🔥',label:'Fire'},{icon:'🚗',label:'Road Accident'},{icon:'🚑',label:'Medical'},{icon:'🌍',label:'Earthquake'},{icon:'🏚️',label:'Collapse'},{icon:'👤',label:'Missing Person'},{icon:'⚠️',label:'Other'}];
const STEPS = [{icon:Phone,label:'Citizen Reports'},{icon:Zap,label:'AI Analysis'},{icon:BarChart3,label:'Resource Planning'},{icon:MapPin,label:'Route & Weather'},{icon:Shield,label:'Officer Approval'},{icon:Radio,label:'Dispatch'},{icon:CheckCircle,label:'Resolution'}];

export default function Home() {
  const [trackId, setTrackId] = useState('');
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <nav className="border-b border-slate-800 sticky top-0 bg-[#0f1117]/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">🆘</div>
            <span className="font-bold text-white">RESQ AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white px-3 py-2">Officer Login</Link>
            <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />Report Emergency
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 text-sm text-red-400 mb-8">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"/>AI-Powered Emergency Response System
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Intelligent Emergency<span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Response & Rescue</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">RESQ AI connects citizens, officers, and rescue teams through AI-driven incident analysis, live inventory management, and coordinated dispatch.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg shadow-red-900/30"><AlertTriangle className="w-5 h-5"/>Report Emergency</Link>
          <Link href="/login" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-lg border border-slate-700"><Shield className="w-5 h-5"/>Officer Dashboard</Link>
        </div>
        <div className="flex gap-2 max-w-md mx-auto">
          <input type="text" placeholder="Enter tracking ID (e.g. FL-2026-00123)" value={trackId} onChange={e=>setTrackId(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
          <Link href={trackId?`/track/${trackId}`:'#'} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg whitespace-nowrap">Track Incident</Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {TYPES.map(t=>(
            <div key={t.label} className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs text-slate-400 text-center">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-3">AI-Powered Workflow</h2>
        <p className="text-slate-400 text-center mb-10">Every step AI-assisted, every dispatch officer-authorized.</p>
        <div className="grid grid-cols-7 gap-4">
          {STEPS.map((s,i)=>(
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center"><s.icon className="w-4 h-4 text-blue-400"/></div>
              <span className="text-xs text-slate-300">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{icon:Zap,title:'4 AI Agents',desc:'Incident analysis, resource planning, routing awareness, and response coordination — using real inventory data.',color:'text-yellow-400'},{icon:BarChart3,title:'Live Inventory',desc:'Track vehicles, medical supplies, rescue equipment. AI auto-reserves resources pending officer approval.',color:'text-green-400'},{icon:MapPin,title:'Maps & Weather',desc:'OpenStreetMap incident mapping, GPS location, nearby resources, live Open-Meteo weather alerts.',color:'text-blue-400'}].map((f,i)=>(
              <div key={i} className="bg-[#0f1117] border border-slate-800 rounded-xl p-6">
                <f.icon className={`w-7 h-7 ${f.color} mb-4`}/>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to respond?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4"/>Report Emergency</Link>
          <Link href="/register" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2"><Users className="w-4 h-4"/>Create Account</Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-slate-500">
          <span>🆘 RESQ AI — Emergency Response Platform</span>
          <div className="flex gap-6">
            <Link href="/report" className="hover:text-white">Report</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

