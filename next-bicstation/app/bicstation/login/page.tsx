"use client";

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 🧪 簡易的なデモ認証
    if (email === 'admin@bicstation.com' && password === 'admin123') {
      document.cookie = "bicstation_auth=true; path=/";
      window.location.href = '/bicstation/console/dashboard';
    } else {
      setError('アクセス権限がありません。認証情報を確認してください。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-slate-900 border border-slate-800 rounded-3xl mb-4 shadow-2xl">
            <ShieldCheck size={48} className="text-cyan-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Access Denied</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Bicstation Admin OS v2.0</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in shake duration-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="email" required placeholder="Admin ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" required placeholder="Security Key"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.3)] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs">
            Authenticate <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
          Restricted Area / Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}