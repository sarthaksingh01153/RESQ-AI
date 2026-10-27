'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, AlertCircle } from 'lucide-react';

const ROLES=[{value:'CITIZEN',label:'Citizen',desc:'Report emergencies, track incidents'},{value:'RESCUE_TEAM',label:'Rescue Team Member',desc:'Respond to assigned incidents'},{value:'INVENTORY_MANAGER',label:'Inventory Manager',desc:'Manage emergency resources'}];

export default function RegisterPage() {
  const router = useRouter();
  const [form,setForm] = useState({name:'',email:'',password:'',role:'CITIZEN',phone:''});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const upd = (k:string,v:string) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if (!res.ok){setError(data.error||'Registration failed');return;}
      router.push(form.role==='CITIZEN'?'/report':'/dashboard');
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
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join the emergency response network</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
          {error&&<div className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3 text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}</div>}
          {[{k:'name',label:'Full Name',type:'text',ph:'Your full name',min:2},{k:'email',label:'Email',type:'email',ph:'your@email.com'},{k:'phone',label:'Phone (optional)',type:'text',ph:'+91 98765 43210'},{k:'password',label:'Password (min 8)',type:'password',ph:'••••••••',min:8}].map(f=>(
            <div key={f.k}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{f.label}</label>
              <input type={f.type} value={(form as Record<string,string>)[f.k]} onChange={e=>upd(f.k,e.target.value)} minLength={f.min} required={f.k!=='phone'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder={f.ph}/>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Role</label>
            <div className="space-y-2">
              {ROLES.map(r=>(
                <label key={r.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.role===r.value?'border-blue-500 bg-blue-900/10':'border-slate-700 bg-slate-800'}`}>
                  <input type="radio" name="role" value={r.value} checked={form.role===r.value} onChange={()=>upd('role',r.value)} className="accent-blue-500"/>
                  <div><div className="text-white text-sm font-medium">{r.label}</div><div className="text-slate-400 text-xs">{r.desc}</div></div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating...</>:<><UserPlus className="w-4 h-4"/>Create Account</>}
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-slate-500">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></div>
      </div>
    </div>
  );
}

