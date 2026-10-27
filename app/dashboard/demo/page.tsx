'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, CheckCircle, AlertTriangle, Loader2, ExternalLink, Info, Zap } from 'lucide-react';

interface DemoStep {
  step: number;
  label: string;
  status: 'real' | 'simulated';
  detail: string;
}

interface DemoResult {
  success: boolean;
  message: string;
  demoDisclaimer: string;
  incidentId: string;
  trackingId: string;
  dashboardLink: string;
  trackLink: string;
  steps: DemoStep[];
  summary: { realSteps: number; simulatedSteps: number; totalSteps: number };
  error?: string;
  detail?: string;
}

export default function FloodDemoPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState('');

  const runDemo = async () => {
    setRunning(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/demo/flood', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Demo failed');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error — check server is running');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agentic Flood Demo</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            End-to-end demonstration of the RESQ AI response pipeline
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 mb-2">What this demo does</div>
            <p className="text-blue-800 text-sm leading-relaxed mb-3">
              Runs a 12-step end-to-end flood response scenario using <strong>real application services and database records</strong>.
              Dispatch actions are clearly labelled as <strong>SIMULATED</strong>. No real emergency services are contacted.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                'Citizen reports flood incident',
                'Static safety guidance delivered instantly',
                'AI analyzes report (Gemini or demo fallback)',
                'Officer sees incident in dashboard',
                'AI queries real inventory database',
                'AI generates resource proposal',
                '[SIMULATED] Officer approves dispatch',
                'Citizen receives status notification',
                'Second report: route blocked',
                'AI reassesses and updates plan',
                'Officer reviews updated recommendation',
                '[SIMULATED] Incident resolved',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-blue-700">
                  <span className="text-blue-400 font-mono text-xs flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Run Button */}
      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Run Demo Scenario</h2>
            <p className="text-slate-400 text-xs mt-0.5">Takes 10–30 seconds depending on AI availability</p>
          </div>
          <button
            onClick={runDemo}
            disabled={running}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
            ) : (
              <><Play className="w-4 h-4" />Run Flood Demo</>
            )}
          </button>
        </div>
        {running && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700 text-sm flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            Running pipeline... AI agents are analyzing the incident and querying inventory. Please wait.
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900 mb-1">Demo Failed</div>
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">Make sure you are logged in as an Officer or Admin.</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-green-900">Demo Completed Successfully</div>
                <div className="text-green-700 text-sm">{result.message}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 text-center border border-green-100">
                <div className="text-2xl font-bold text-slate-900">{result.summary.totalSteps}</div>
                <div className="text-xs text-slate-400">Total Steps</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-600">{result.summary.realSteps}</div>
                <div className="text-xs text-slate-400">Real Services</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">{result.summary.simulatedSteps}</div>
                <div className="text-xs text-slate-400">Simulated</div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href={result.dashboardLink}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View in Officer Dashboard
              </Link>
              <Link
                href={result.trackLink}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-black/[0.06] text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Citizen Tracking View
              </Link>
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>Disclaimer:</strong> {result.demoDisclaimer}
            </div>
          </div>

          {/* Step-by-step log */}
          <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Step-by-Step Execution Log</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {result.steps.map((s) => (
                <div key={s.step} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-slate-800 text-sm">{s.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'real'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {s.status === 'real' ? 'Real' : 'Simulated'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.detail}</p>
                  </div>
                  {s.status === 'real' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

