'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ChevronRight, ChevronLeft, CheckCircle,
  Copy, Navigation, MapPin, User, Phone, Mail,
} from 'lucide-react';

const TYPES = [
  { value: 'FLOOD', label: 'Flood', icon: '🌊', desc: 'Flash flood, river overflow', aid: 'Move to higher ground. Do not walk through moving water.' },
  { value: 'FIRE', label: 'Fire', icon: '🔥', desc: 'Building fire, forest fire', aid: 'Evacuate immediately. Stay low in smoke. Do not use lifts.' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident', icon: '🚗', desc: 'Vehicle collision', aid: 'Do not move injured unless in danger. Secure the scene.' },
  { value: 'MEDICAL', label: 'Medical Emergency', icon: '🚑', desc: 'Cardiac arrest, stroke', aid: 'Keep person calm. Do not give food/water. CPR if trained and unresponsive.' },
  { value: 'EARTHQUAKE', label: 'Earthquake', icon: '🌍', desc: 'Seismic activity', aid: 'Drop, cover, hold on. Check for gas leaks after shaking stops.' },
  { value: 'BUILDING_COLLAPSE', label: 'Building Collapse', icon: '🏚️', desc: 'Structural failure', aid: 'Evacuate if safe. Do not re-enter damaged structure.' },
  { value: 'MISSING_PERSON', label: 'Missing Person', icon: '👤', desc: 'Missing adult or child', aid: 'Note last known location. Alert authorities immediately.' },
  { value: 'OTHER', label: 'Other', icon: '⚠️', desc: 'Other emergency', aid: 'Ensure your safety first. Call emergency services.' },
];

const SEV = [
  { value: 'LOW', label: 'Low', cls: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'MEDIUM', label: 'Medium', cls: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
  { value: 'HIGH', label: 'High', cls: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', cls: 'border-red-500 bg-red-50 text-red-700' },
];

const INPUT = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';

const STEPS = ['Emergency Type', 'Incident Details', 'Your Details'];

type Form = {
  type: string; severity: string; title: string; description: string;
  latitude: string; longitude: string; address: string;
  reporterName: string; reporterPhone: string; reporterEmail: string;
};

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>({
    type: '', severity: 'MEDIUM', title: '', description: '',
    latitude: '', longitude: '', address: '',
    reporterName: '', reporterPhone: '', reporterEmail: '',
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ trackingId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const upd = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const selType = TYPES.find(t => t.value === form.type);

  const detectGPS = () => {
    setLocError('');
    setLocating(true);
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser. Enter coordinates manually.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        upd('latitude', pos.coords.latitude.toFixed(6));
        upd('longitude', pos.coords.longitude.toFixed(6));
        setLocating(false);
        setLocError('');
      },
      err => {
        setLocating(false);
        const msg = err.code === 1
          ? 'Location access denied. Please allow location in browser settings or enter coordinates manually.'
          : "GPS unavailable. Please enter coordinates manually (use Google Maps > right-click > 'What's here?').";
        setLocError(msg);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const locationReady = form.latitude !== '' && form.longitude !== '';

  const canNext = () => {
    if (step === 1) return !!form.type;
    if (step === 2) {
      return form.title.trim().length >= 5 &&
        form.description.trim().length >= 10 &&
        locationReady;
    }
    return true;
  };

  const step2Hints = () => {
    const hints: string[] = [];
    if (form.title.trim().length < 5) hints.push('title (≥ 5 characters)');
    if (form.description.trim().length < 10) hints.push('description (≥ 10 characters)');
    if (!locationReady) hints.push('location coordinates');
    return hints;
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          severity: form.severity,
          title: form.title.trim(),
          description: form.description.trim(),
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          address: form.address.trim() || undefined,
          reporterName: form.reporterName.trim() || 'Anonymous',
          reporterPhone: form.reporterPhone.trim() || undefined,
          reporterEmail: form.reporterEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.');
        return;
      }
      setSuccess({ trackingId: data.incident.trackingId });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Emergency Reported</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Your report has been logged. AI analysis is underway and officers have been notified.
        </p>
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-6 mb-6">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">Tracking ID</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mb-4">{success.trackingId}</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(success.trackingId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2 mx-auto transition-colors"
          >
            <Copy className="w-4 h-4" />{copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/track/${success.trackingId}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-center transition-colors shadow-sm"
          >
            Track Incident
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white hover:bg-slate-50 border border-black/[0.06] text-slate-700 font-medium py-3 rounded-xl text-center transition-colors shadow-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );

  // ─── Main Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <div className="bg-red-600 px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-red-100 hover:text-white transition-colors">← Back</Link>
          <span className="font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />Report Emergency
          </span>
          <span className="text-sm text-red-200">Step {step}/3</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-black/[0.06] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-red-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((label, i) => (
              <span key={i} className={`text-xs ${i + 1 === step ? 'text-red-600 font-semibold' : i + 1 < step ? 'text-slate-400' : 'text-slate-300'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Global error */}
        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Step 1: Emergency Type ─── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">What is the emergency?</h2>
            <p className="text-slate-500 text-sm mb-6">Select the type that best describes the situation</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => upd('type', t.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    form.type === t.value
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-black/[0.06] bg-white hover:border-red-200 hover:shadow-sm shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-slate-900 font-medium text-sm">{t.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
            {selType && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="text-amber-800 font-semibold text-sm mb-1">⚠️ Immediate Safety Guidance</div>
                <div className="text-amber-900 text-sm">{selType.aid}</div>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 2: Incident Details ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Incident details</h2>
              <p className="text-slate-500 text-sm">Fill all required fields to continue</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Brief Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => upd('title', e.target.value)}
                maxLength={200}
                className={INPUT}
                placeholder="e.g. Flood on NH-48 near Gurgaon"
              />
              {form.title.trim().length > 0 && form.title.trim().length < 5 && (
                <p className="text-xs text-amber-600 mt-1">Need at least 5 characters ({form.title.trim().length}/5)</p>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {SEV.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => upd('severity', s.value)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.severity === s.value ? s.cls : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs ${form.description.length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {form.description.length}/5000
                </span>
              </div>
              <textarea
                value={form.description}
                onChange={e => upd('description', e.target.value)}
                rows={4}
                maxLength={5000}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="Describe what is happening: people affected, hazards, access routes"
              />
              {form.description.trim().length > 0 && form.description.trim().length < 10 && (
                <p className="text-xs text-amber-600 mt-1">Need at least 10 characters ({form.description.trim().length}/10)</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={detectGPS}
                disabled={locating}
                className="w-full mb-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {locating
                  ? <><div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" />Detecting location...</>
                  : <><Navigation className="w-4 h-4" />Use My GPS Location</>}
              </button>

              {locError && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{locError}</span>
                </div>
              )}

              {locationReady && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-green-800 text-xs flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Location set: {parseFloat(form.latitude).toFixed(4)}°, {parseFloat(form.longitude).toFixed(4)}°</span>
                </div>
              )}

              <div className="text-xs text-slate-400 mb-2 text-center">-- or enter manually --</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => upd('latitude', e.target.value)}
                    className={INPUT}
                    placeholder="Latitude (e.g. 28.6139)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => upd('longitude', e.target.value)}
                    className={INPUT}
                    placeholder="Longitude (e.g. 77.2090)"
                  />
                </div>
              </div>
              <input
                value={form.address}
                onChange={e => upd('address', e.target.value)}
                className={INPUT}
                placeholder="Street address or landmark (optional)"
              />
            </div>

            {/* Inline hint when continue is blocked */}
            {step2Hints().length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-xs">
                <span className="font-medium text-slate-600">Still needed: </span>
                {step2Hints().join(', ')}
              </div>
            )}
          </div>
        )}

        {/* ─── Step 3: Your Details ─── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Your details</h2>
              <p className="text-slate-500 text-sm">Help responders contact you if needed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.reporterName}
                onChange={e => upd('reporterName', e.target.value)}
                className={INPUT}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />Phone <span className="text-slate-400 font-normal">(recommended)</span>
              </label>
              <input
                type="tel"
                value={form.reporterPhone}
                onChange={e => upd('reporterPhone', e.target.value)}
                className={INPUT}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />Email <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={form.reporterEmail}
                onChange={e => upd('reporterEmail', e.target.value)}
                className={INPUT}
                placeholder="your@email.com"
              />
            </div>

            {/* Summary */}
            <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm p-4 text-sm space-y-2.5">
              <div className="font-semibold text-slate-800 mb-1">Summary</div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type</span>
                <span className="text-slate-800 font-medium">{selType?.icon} {selType?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity</span>
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                  form.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  form.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  form.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>{form.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title</span>
                <span className="text-slate-700 text-xs text-right max-w-[200px] truncate">{form.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-700 text-xs text-right max-w-[200px]">
                  {form.address || `${parseFloat(form.latitude).toFixed(4)}°, ${parseFloat(form.longitude).toFixed(4)}°`}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
              By submitting, you confirm this is a genuine emergency. False reports waste critical resources and are a punishable offence.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => { setError(''); setStep(s => s - 1); }}
              className="flex-1 bg-white hover:bg-slate-50 border border-black/[0.06] text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => { setError(''); setStep(s => s + 1); }}
              disabled={!canNext()}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading || !form.reporterName.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                : 'Submit Emergency Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
