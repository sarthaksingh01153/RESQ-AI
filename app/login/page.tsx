'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(data.user?.role === 'CITIZEN' ? '/report' : '/dashboard');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RESQ <span className="text-red-600">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>
          <p className="text-slate-500">Access the emergency response platform</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm">
          <div className="font-medium text-blue-700 mb-2">Demo Credentials</div>
          <div className="text-slate-600 space-y-1 text-xs">
            <div>Officer: officer@resqai.demo / demo1234</div>
            <div>Inventory: inventory@resqai.demo / demo1234</div>
            <div>Admin: admin@resqai.demo / demo1234</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-black/[0.07] rounded-2xl p-8 space-y-5 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-700">← Home</Link>
          <span className="mx-3">·</span>
          <Link href="/register" className="hover:text-slate-700">Register</Link>
          <span className="mx-3">·</span>
          <Link href="/report" className="text-red-600 hover:text-red-700 font-medium">Report Emergency</Link>
        </div>
      </div>
    </div>
  );
}
