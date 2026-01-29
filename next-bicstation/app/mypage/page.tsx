"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Rechartsの型定義競合（React 18）を回避するためのignore設定を含むインポート
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Server, Cpu, Database, Users, Activity, Play, RefreshCw, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { logoutUser } from '../../lib/auth'; // パスは環境に合わせて調整してください

// --- 型定義 ---
interface UserProfile {
  id: number;
  username: string;
  is_staff: boolean;
  site_group: string;
}

// 📊 統計ダミーデータ（API実装までのプレースホルダー）
const productStats = [
  { name: 'Mon', pc: 45, adult: 120 },
  { name: 'Tue', pc: 52, adult: 110 },
  { name: 'Wed', pc: 48, adult: 140 },
  { name: 'Thu', pc: 61, adult: 130 },
  { name: 'Fri', pc: 55, adult: 160 },
  { name: 'Sat', pc: 67, adult: 190 },
  { name: 'Sun', pc: 72, adult: 210 },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      if (!token && !storedUser) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me/`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const data = await res.json();
        const userData = data.user || data;

        // 🛡️ 管理画面アクセス制限: スタッフ権限がない場合はマイページへ戻す
        if (!userData.is_staff) {
          console.error("⛔ 管理権限がありません");
          router.push('/mypage');
          return;
        }
        setUser(userData);
      } catch (err) {
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono">INITIALIZING SYSTEM...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      
      {/* 📟 サイドナビゲーション */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          <span className="text-xl font-black tracking-tighter italic">BICSTATION</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Main Menu</div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LayoutDashboard size={18} /> <span className="text-sm font-bold">Dashboard</span>
          </a>
          <a href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Database size={18} /> <span className="text-sm font-bold">Products</span>
          </a>
          <a href="/admin/scrapers" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Activity size={18} /> <span className="text-sm font-bold">Scrapers</span>
          </a>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button onClick={() => logoutUser()} className="flex items-center gap-3 px-4 text-slate-500 hover:text-rose-400 transition-colors">
            <Server size={18} /> <span className="text-sm font-bold">System Logout</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ メインパネル */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">Command Center</h1>
            <p className="text-slate-400 text-sm">Welcome back, <span className="text-cyan-400 font-mono">{user.username}</span>. System is operational.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 transition-all text-xs font-bold">
              <RefreshCw size={14} /> Refresh Stats
            </button>
            <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-cyan-900/20 transition-all">
              <Play size={14} fill="currentColor" /> Deploy Scrapers
            </button>
          </div>
        </div>

        {/* ステータスカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Cpu className="text-cyan-400" />} title="Server Load" value="24%" sub="VPS-Shin / Stable" />
          <StatCard icon={<Database className="text-purple-400" />} title="Products" value="12,840" sub="+420 New Items" />
          <StatCard icon={<Users className="text-emerald-400" />} title="Active Sessions" value="85" sub="Staff & Users" />
          <StatCard icon={<Activity className="text-rose-400" />} title="AI Queues" value="12" sub="Processing..." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* チャート */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Activity size={18} className="text-cyan-400" /> Data Ingestion Growth
            </h3>
            <div className="h-80 w-full">
              {/* @ts-ignore */}
              <ResponsiveContainer width="100%" height="100%">
                {/* @ts-ignore */}
                <LineChart data={productStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="pc" stroke="#22d3ee" strokeWidth={4} dot={{ r: 4, fill: '#22d3ee' }} />
                  <Line type="monotone" dataKey="adult" stroke="#a855f7" strokeWidth={4} dot={{ r: 4, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ログステータス */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Server size={18} className="text-cyan-400" /> Live Logs
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              <LogItem time="18:30" type="SUCCESS" msg="FANZA API Sync: 104 items" />
              <LogItem time="18:25" type="INFO" msg="AI Review generated for #PC-88" />
              <LogItem time="18:10" type="ERROR" msg="DMM Scraper: Proxy Timeout" />
              <LogItem time="17:50" type="INFO" msg="System Backup Initiated" />
            </div>
            <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group">
              View Full Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- サブコンポーネント ---

function StatCard({ icon, title, value, sub }: any) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:bg-slate-800/80 transition-all border-b-2 hover:border-b-cyan-500 group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
  );
}

function LogItem({ time, type, msg }: any) {
  const color = type === 'SUCCESS' ? 'bg-emerald-500' : type === 'ERROR' ? 'bg-rose-500' : 'bg-cyan-500';
  return (
    <div className="flex flex-col gap-1 border-l-2 border-slate-800 pl-4 py-1 hover:border-cyan-500 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
        <span className="text-[10px] font-mono text-slate-500">{time}</span>
        <span className={`text-[9px] font-bold px-1.5 rounded-sm ${color} bg-opacity-10 text-opacity-90`}>{type}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{msg}</p>
    </div>
  );
}