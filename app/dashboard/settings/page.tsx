'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Globe, Brain, Map, Wifi, Key } from 'lucide-react'

interface ServiceStatus {
  name: string
  description: string
  icon: React.ReactNode
  status: 'checking' | 'ok' | 'error' | 'demo'
  detail?: string
}

export default function SettingsPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'AI / Gemini', description: 'Google Gemini 1.5 Flash for incident analysis and rescue planning', icon: <Brain className="h-5 w-5" />, status: 'checking' },
    { name: 'Weather API', description: 'Open-Meteo — free, no API key required', icon: <Globe className="h-5 w-5" />, status: 'checking' },
    { name: 'Maps / OpenStreetMap', description: 'Leaflet + OpenStreetMap tiles — free, no API key required', icon: <Map className="h-5 w-5" />, status: 'checking' },
    { name: 'Database', description: 'SQLite via Prisma ORM', icon: <Wifi className="h-5 w-5" />, status: 'checking' },
  ])
  const [demoMode, setDemoMode] = useState<boolean | null>(null)
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const checkServices = async () => {
      // Check weather
      try {
        const wRes = await fetch('/api/weather/current?lat=28.6139&lon=77.209')
        const wData = await wRes.json()
        setServices((prev) => prev.map((s) =>
          s.name === 'Weather API'
            ? { ...s, status: wRes.ok ? 'ok' : 'error', detail: wRes.ok ? `Temperature: ${wData.temperature}°C` : 'Failed to connect' }
            : s
        ))
        if (wData.isDemo !== undefined) setDemoMode(wData.isDemo)
      } catch {
        setServices((prev) => prev.map((s) => s.name === 'Weather API' ? { ...s, status: 'error', detail: 'Connection failed' } : s))
      }

      // Check DB via analytics endpoint
      try {
        const dbRes = await fetch('/api/analytics/overview')
        setServices((prev) => prev.map((s) =>
          s.name === 'Database'
            ? { ...s, status: dbRes.ok ? 'ok' : 'error', detail: dbRes.ok ? 'Connected' : 'Connection error' }
            : s
        ))
      } catch {
        setServices((prev) => prev.map((s) => s.name === 'Database' ? { ...s, status: 'error', detail: 'Cannot reach database' } : s))
      }

      // Check AI config via a minimal analyze call
      try {
        const aiRes = await fetch('/api/incidents?limit=1')
        if (aiRes.ok) {
          const data = await aiRes.json()
          const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
          setGeminiConfigured(!isDemo)
          setServices((prev) => prev.map((s) =>
            s.name === 'AI / Gemini'
              ? { ...s, status: isDemo ? 'demo' : 'ok', detail: isDemo ? 'Using mock AI responses — add GEMINI_API_KEY to .env.local' : 'Gemini API connected' }
              : s
          ))
        }
      } catch {}

      // Maps always available
      setServices((prev) => prev.map((s) =>
        s.name === 'Maps / OpenStreetMap'
          ? { ...s, status: 'ok', detail: 'OpenStreetMap tiles accessible' }
          : s
      ))
    }
    checkServices()
  }, [])

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    if (status === 'ok') return <CheckCircle className="h-5 w-5 text-green-400" />
    if (status === 'demo') return <CheckCircle className="h-5 w-5 text-amber-400" />
    return <XCircle className="h-5 w-5 text-red-400" />
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">API integrations and system status</p>
      </div>

      {/* Demo mode banner */}
      {demoMode && (
        <div className="rounded-lg border border-amber-800 bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">Demo Mode Active</p>
              <p className="text-xs text-amber-400/80 mt-1">
                AI analysis and rescue planning are using mock responses. For real AI-powered features, add your Gemini API key to <code className="bg-amber-950 px-1 rounded">.env.local</code>:
              </p>
              <pre className="mt-2 text-xs bg-amber-950 rounded p-2 text-amber-300">GEMINI_API_KEY=your_key_here</pre>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                Get a free Gemini API key at aistudio.google.com →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Service status */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-300">Service Status</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {services.map((service) => (
            <div key={service.name} className="flex items-center gap-4 px-4 py-4">
              <div className="text-slate-500">{service.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{service.name}</p>
                <p className="text-xs text-slate-500">{service.description}</p>
                {service.detail && (
                  <p className={`text-xs mt-0.5 ${
                    service.status === 'ok' ? 'text-green-400'
                    : service.status === 'demo' ? 'text-amber-400'
                    : service.status === 'error' ? 'text-red-400'
                    : 'text-slate-500'
                  }`}>
                    {service.detail}
                  </p>
                )}
              </div>
              <StatusIcon status={service.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Stack info */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Technology Stack</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Frontend', 'Next.js 14 App Router + TypeScript'],
            ['Styling', 'Tailwind CSS + Radix UI'],
            ['Database', 'SQLite + Prisma ORM'],
            ['Auth', 'JWT (jose) + bcryptjs'],
            ['AI', 'Google Gemini 1.5 Flash'],
            ['Maps', 'Leaflet + OpenStreetMap'],
            ['Weather', 'Open-Meteo (free)'],
            ['Charts', 'Recharts'],
          ].map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="text-slate-500 w-24 flex-shrink-0">{key}</span>
              <span className="text-slate-300">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo credentials */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Demo Credentials</h2>
        <div className="space-y-2 text-xs">
          {[
            ['Admin', 'admin@resqai.demo', 'ADMIN'],
            ['Officer', 'officer@resqai.demo', 'OFFICER'],
            ['Inventory Manager', 'inventory@resqai.demo', 'INVENTORY_MANAGER'],
            ['Rescue Team', 'team@resqai.demo', 'RESCUE_TEAM'],
            ['Citizen', 'citizen@resqai.demo', 'CITIZEN'],
          ].map(([name, email, role]) => (
            <div key={email} className="flex items-center gap-3 p-2 bg-slate-900 rounded">
              <div className="w-24 text-slate-500">{name}</div>
              <code className="flex-1 text-blue-400">{email}</code>
              <span className="text-slate-500">Password: <code className="text-slate-300">demo1234</code></span>
              <span className="text-xs text-slate-600">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

