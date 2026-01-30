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
  ChevronRight, LayoutDashboard, User, Settings, LogOut, ShieldCheck,
  TrendingUp, Clock, Shield
} from 'lucide-react';
import { logoutUser } from '../../lib/auth';

// --- 型定義 ---
interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  site_group: string;
}

// 📊 管理者・ユーザー共通の統計ダミーデータ
const statsData = [
  { name: 'Mon', pc: 45, views: 12 },
  { name: 'Tue', pc: 52, views: 45 },
  { name: 'Wed', pc: 48, views: 32 },
  { name: 'Thu', pc: 61, views: 61 },
  { name: 'Fri', pc: 55, views: 55 },
  { name: 'Sat', pc: 67, views: 89 },
  { name: 'Sun', pc: 72, views: 72 },
];

export default function UnifiedDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [basePath, setBasePath] = useState("");
  const router = useRouter();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const prefix = currentPath.startsWith('/bicstation') ? '/bicstation' : '';
    setBasePath(prefix);

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';

      if (!token && !storedUser) {
        router.push(`${prefix}/login`);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user || data);
      } catch (err) {
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono animate-pulse">
      SYSTEM AUTHORIZING...
    </div>
  );
  
  if (!user) return null;

  // ==========================================
  // 🛡️ 管理者用・一般ユーザー用 共通レイアウト
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col lg:flex-row">
      
      {/* サイドバー */}
      <aside className="w-full lg:w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          <span className="text-xl font-black tracking-tighter italic uppercase">BICSTATION</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">
            {user.is_staff ? 'Admin Core' : 'User Menu'}
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LayoutDashboard size={18} /> <span className="text-sm font-bold">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Database size={18} /> <span className="text-sm font-bold">{user.is_staff ? 'Products' : 'My Favorites'}</span>
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
              {user.is_staff ? <ShieldCheck className="text-cyan-400" /> : <User className="text-cyan-400" />}
              {user.is_staff ? 'Command Center' : 'User Terminal'}
            </h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              User: <span className="text-cyan-400 font-bold">{user.username}</span> 
              <span className="ml-3 text-slate-600">[{user.is_staff ? 'STAFF' : 'MEMBER'}]</span>
            </p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {user.is_staff ? (
            <>
              <StatCard icon={<Cpu className="text-cyan-400" />} title="Server Load" value="24%" sub="VPS-Shin Stable" />
              <StatCard icon={<Database className="text-purple-400" />} title="Products" value="12,840" sub="+420 New Items" />
              <StatCard icon={<Users className="text-emerald-400" />} title="Active Sessions" value="85" sub="System Monitor" />
              <StatCard icon={<Activity className="text-rose-400" />} title="AI Queues" value="12" sub="Processing..." />
            </>
          ) : (
            <>
              <StatCard icon={<TrendingUp className="text-cyan-400" />} title="Activity Score" value="1,240" sub="Top 15% of users" />
              <StatCard icon={<Clock className="text-emerald-400" />} title="Total Usage" value="48h" sub="Last 30 days" />
              <StatCard icon={<Shield className="text-purple-400" />} title="Security Level" value="High" sub="2FA Enabled" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* グラフセクション */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Activity size={18} className="text-cyan-400" /> {user.is_staff ? 'Growth Stats' : 'Usage Statistics'}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey={user.is_staff ? "pc" : "views"} stroke="#22d3ee" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 履歴・ログセクション */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Clock size={18} className="text-cyan-400" /> {user.is_staff ? 'Live Logs' : 'Recent History'}
            </h3>
            <div className="space-y-4">
              <LogItem time="Just now" type={user.is_staff ? "SUCCESS" : "LOGIN"} msg={user.is_staff ? "FANZA API Sync Complete" : "New session started"} />
              <LogItem time="2h ago" type="INFO" msg={user.is_staff ? "AI Review generated #88" : "Profile synchronized"} />
              <LogItem time="Yesterday" type={user.is_staff ? "ERROR" : "SECURE"} msg={user.is_staff ? "DMM Scraper Timeout" : "Security verified"} />
            </div>
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
      <div className="text-[10px] text-slate-500 font-medium uppercase">{sub}</div>
    </div>
  );
}

function LogItem({ time, type, msg }: any) {
  const color = type === 'SUCCESS' || type === 'LOGIN' ? 'bg-emerald-500' : type === 'ERROR' ? 'bg-rose-500' : 'bg-cyan-500';
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