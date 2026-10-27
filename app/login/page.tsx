'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [showPass,setShowPass] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const data = await res.json();
      if (!res.ok){setError(data.error||'Login failed');return;}
      router.push(data.user?.role==='CITIZEN'?'/report':'/dashboard');
    } catch{setError('Network error.');}
    finally{setLoading(false);}
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl">🆘</div>
            <span className="text-xl font-bold text-white">RESQ AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-slate-400">Access the emergency response platform</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 mb-6 text-sm">
          <div className="font-medium text-blue-300 mb-2">Demo Credentials</div>
          <div className="text-slate-400 space-y-1 text-xs">
            <div>Officer: officer@resqai.demo / demo1234</div>
            <div>Inventory: inventory@resqai.demo / demo1234</div>
            <div>Admin: admin@resqai.demo / demo1234</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
          {error&&<div className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3 text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="your@email.com"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <input type={showPass?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-12" placeholder="••••••••"/>
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white">{showPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</>:<><Shield className="w-4 h-4"/>Sign In</>}
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-white">← Home</Link><span className="mx-3">·</span>
          <Link href="/register" className="hover:text-white">Register</Link><span className="mx-3">·</span>
          <Link href="/report" className="text-red-400 hover:text-red-300 font-medium">Report Emergency</Link>
        </div>
      </div>
    </div>
  );
}

