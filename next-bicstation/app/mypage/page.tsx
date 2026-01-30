/**
 * 🔐 BICSTATION 統合ダッシュボード
 * 管理者(Staff)と一般ユーザーで表示内容を自動的に切り替えます。
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Server, Cpu, Database, Users, Activity, Play, RefreshCw, 
  ChevronRight, LayoutDashboard, User, Settings, LogOut, ShieldCheck
} from 'lucide-react';
import { logoutUser } from '../../lib/auth';

// --- 型定義 ---
interface UserProfile {
  id: number;
  username: string;
  is_staff: boolean;
  site_group: string;
  email?: string;
}

// 📊 管理者用統計ダミーデータ
const productStats = [
  { name: 'Mon', pc: 45, adult: 120 },
  { name: 'Tue', pc: 52, adult: 110 },
  { name: 'Wed', pc: 48, adult: 140 },
  { name: 'Thu', pc: 61, adult: 130 },
  { name: 'Fri', pc: 55, adult: 160 },
  { name: 'Sat', pc: 67, adult: 190 },
  { name: 'Sun', pc: 72, adult: 210 },
];

export default function UnifiedDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // サブパスの取得（ローカル /bicstation 対応）
  const [basePath, setBasePath] = useState("");

  useEffect(() => {
    const currentPath = window.location.pathname;
    setBasePath(currentPath.startsWith('/bicstation') ? '/bicstation' : '');

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';

      if (!token && !storedUser) {
        router.push(`${basePath}/login`);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me/`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const data = await res.json();
        setUser(data.user || data);
      } catch (err) {
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, basePath]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono animate-pulse">
      SYSTEM AUTHORIZING...
    </div>
  );
  
  if (!user) return null;

  // ==========================================
  // 🛡️ 管理者用画面 (Staff Dashboard)
  // ==========================================
  if (user.is_staff) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex">
        {/* サイドバー */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden lg:flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-cyan-500 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            <span className="text-xl font-black tracking-tighter italic uppercase">BICSTATION</span>
          </div>
          <nav className="flex-1 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Admin Core</div>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <LayoutDashboard size={18} /> <span className="text-sm font-bold">Dashboard</span>
            </a>
            <a href={`${basePath}/admin/products`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <Database size={18} /> <span className="text-sm font-bold">Products</span>
            </a>
            <a href={`${basePath}/admin/scrapers`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <Activity size={18} /> <span className="text-sm font-bold">Scrapers</span>
            </a>
          </nav>
          <div className="pt-6 border-t border-slate-800">
            <button onClick={() => logoutUser()} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-rose-400 transition-colors font-bold text-sm">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter text-white uppercase flex items-center gap-3">
                <ShieldCheck className="text-cyan-400" /> Command Center
              </h1>
              <p className="text-slate-400 text-sm font-mono mt-1">Status: <span className="text-emerald-400">Staff Authenticated</span></p>
            </div>
            <div className="flex gap-3">
              <button className="bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2">
                <Play size={14} fill="currentColor" /> Deploy Scrapers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Cpu className="text-cyan-400" />} title="Server Load" value="24%" sub="VPS-Shin Stable" />
            <StatCard icon={<Database className="text-purple-400" />} title="Products" value="12,840" sub="+420 New Items" />
            <StatCard icon={<Users className="text-emerald-400" />} title="Active Sessions" value="85" sub="System Monitor" />
            <StatCard icon={<Activity className="text-rose-400" />} title="AI Queues" value="12" sub="Processing..." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase"><Activity size={18} className="text-cyan-400" /> Growth Stats</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="pc" stroke="#22d3ee" strokeWidth={4} dot={false} />
                    <Line type="monotone" dataKey="adult" stroke="#a855f7" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase"><Server size={18} className="text-cyan-400" /> Live Logs</h3>
              <div className="space-y-4 pr-2">
                <LogItem time="18:30" type="SUCCESS" msg="FANZA API Sync Complete" />
                <LogItem time="18:25" type="INFO" msg="AI Review generated #88" />
                <LogItem time="18:10" type="ERROR" msg="DMM Scraper Timeout" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // 👤 一般ユーザー用画面 (Simple My Page)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* 簡易ヘッダー */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-cyan-500 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            <span className="font-black italic uppercase tracking-tighter">BICSTATION</span>
          </div>
          <button onClick={() => logoutUser()} className="text-xs font-bold text-slate-500 hover:text-rose-400 flex items-center gap-2 transition-colors">
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">User Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ユーザー情報カード */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-500/30">
                  <User size={40} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                  <p className="text-cyan-500 text-xs font-mono font-bold uppercase tracking-widest">{user.site_group}</p>
                </div>
              </div>
              
              <div className="space-y-4 border-t border-slate-800 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase">Email Address</span>
                  <span className="text-slate-200">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase">Account ID</span>
                  <span className="text-slate-400 font-mono">#ID-{user.id.toString().padStart(5, '0')}</span>
                </div>
              </div>
            </div>

            {/* お気に入り/最近の閲覧（プレースホルダー） */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
                <Database size={24} className="text-slate-600 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-white uppercase">My Favorites</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
                <Settings size={24} className="text-slate-600 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-white uppercase">Settings</span>
              </div>
            </div>
          </div>

          {/* 右サイド：ステータス */}
          <div className="space-y-4">
             <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-3xl">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4">Membership</h3>
                <p className="text-2xl font-bold text-white tracking-tight">Standard</p>
                <p className="text-[10px] text-cyan-500/60 font-medium leading-relaxed mt-2">
                  You are a registered member of {user.site_group}.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- サブコンポーネント (管理者用) ---

function StatCard({ icon, title, value, sub }: any) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:bg-slate-800/80 transition-all border-b-2 hover:border-b-cyan-500 group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium uppercase">{sub}</div>
    </div>
  );
}

function LogItem({ time, type, msg }: any) {
  const color = type === 'SUCCESS' ? 'bg-emerald-500' : type === 'ERROR' ? 'bg-rose-500' : 'bg-cyan-500';
  return (
    <div className="flex flex-col gap-1 border-l-2 border-slate-800 pl-4 py-1">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
        <span className="text-[10px] font-mono text-slate-500">{time}</span>
        <span className={`text-[9px] font-bold px-1.5 rounded-sm ${color} bg-opacity-10 text-opacity-90`}>{type}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium">{msg}</p>
    </div>
  );
}