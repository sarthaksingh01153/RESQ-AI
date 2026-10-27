'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Shield, Zap, MapPin, BarChart3, Users, CheckCircle, Phone, Radio } from 'lucide-react';

const TYPES = [
  {icon:'🌊',label:'Flood'},{icon:'🔥',label:'Fire'},{icon:'🚗',label:'Road Accident'},
  {icon:'🚑',label:'Medical'},{icon:'🌍',label:'Earthquake'},{icon:'🏚️',label:'Collapse'},
  {icon:'👤',label:'Missing Person'},{icon:'⚠️',label:'Other'},
];
const STEPS = [
  {icon:Phone,label:'Citizen Reports'},{icon:Zap,label:'AI Analysis'},
  {icon:BarChart3,label:'Resource Planning'},{icon:MapPin,label:'Route & Weather'},
  {icon:Shield,label:'Officer Approval'},{icon:Radio,label:'Dispatch'},{icon:CheckCircle,label:'Resolution'},
];

export default function Home() {
  const [trackId, setTrackId] = useState('');
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-black/[0.06] sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">RESQ <span className="text-red-600">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors">Officer Login</Link>
            <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
              <AlertTriangle className="w-4 h-4" />Report Emergency
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm text-red-700 mb-8">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>AI-Powered Emergency Response System
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Intelligent Emergency<span className="block text-red-600">Response &amp; Rescue</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">RESQ AI connects citizens, officers, and rescue teams through AI-driven incident analysis, live inventory management, and coordinated dispatch.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-md shadow-red-200 transition-colors">
            <AlertTriangle className="w-5 h-5"/>Report Emergency
          </Link>
          <Link href="/login" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-lg border border-black/[0.09] shadow-sm transition-colors">
            <Shield className="w-5 h-5"/>Officer Dashboard
          </Link>
        </div>
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter tracking ID (e.g. FL-2026-00123)"
            value={trackId}
            onChange={e => setTrackId(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Link href={trackId ? `/track/${trackId}` : '#'} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl whitespace-nowrap shadow-sm transition-colors">Track Incident</Link>
        </div>
      </section>

      {/* Emergency Types */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {TYPES.map(t => (
            <div key={t.label} className="flex flex-col items-center gap-2 p-3 bg-white border border-black/[0.06] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs text-slate-500 text-center">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">AI-Powered Workflow</h2>
        <p className="text-slate-400 text-center mb-10">Every step AI-assisted, every dispatch officer-authorized.</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <s.icon className="w-4 h-4 text-blue-600"/>
              </div>
              <span className="text-xs text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 border-y border-black/[0.05] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:Zap,title:'4 AI Agents',desc:'Incident analysis, resource planning, routing awareness, and response coordination — using real inventory data.',color:'text-yellow-500',bg:'bg-yellow-50',border:'border-yellow-100'},
              {icon:BarChart3,title:'Live Inventory',desc:'Track vehicles, medical supplies, rescue equipment. AI auto-reserves resources pending officer approval.',color:'text-green-600',bg:'bg-green-50',border:'border-green-100'},
              {icon:MapPin,title:'Maps & Weather',desc:'OpenStreetMap incident mapping, GPS location, nearby resources, live Open-Meteo weather alerts.',color:'text-blue-600',bg:'bg-blue-50',border:'border-blue-100'},
            ].map((f, i) => (
              <div key={i} className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
                <div className={`w-10 h-10 ${f.bg} ${f.border} border rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`}/>
                </div>
                <h3 className="text-slate-900 font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to respond?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
            <AlertTriangle className="w-4 h-4"/>Report Emergency
          </Link>
          <Link href="/register" className="bg-white hover:bg-slate-50 border border-black/[0.09] text-slate-700 font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
            <Users className="w-4 h-4"/>Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-slate-400">
          <span>🆘 RESQ AI — Emergency Response Platform</span>
          <div className="flex gap-6">
            <Link href="/report" className="hover:text-slate-700">Report</Link>
            <Link href="/login" className="hover:text-slate-700">Login</Link>
            <Link href="/register" className="hover:text-slate-700">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
