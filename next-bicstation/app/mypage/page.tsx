/**
 * 🏠 マイページ・完全版（統計・グラフ・ログ含む）
 * /home/maya/dev/shin-vps/next-bicstation/app/mypage/page.tsx
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Rechartsのインポート
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  User, Mail, Shield, LogOut, Settings, LayoutDashboard, 
  Activity, Database, Clock, ChevronRight, TrendingUp 
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

// 📊 ユーザー用ダミーデータ（閲覧履歴やアクティビティの推移）
const activityStats = [
  { name: 'Mon', views: 12, points: 10 },
  { name: 'Tue', views: 45, points: 25 },
  { name: 'Wed', views: 32, points: 15 },
  { name: 'Thu', views: 61, points: 40 },
  { name: 'Fri', views: 55, points: 30 },
  { name: 'Sat', views: 89, points: 55 },
  { name: 'Sun', views: 72, points: 45 },
];

export default function MyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sitePrefix, setSitePrefix] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // 1. 環境判別（リダイレクト用プレフィックス）
    const path = window.location.pathname;
    const prefix = path.includes('/bicstation') ? '/bicstation' : '';
    setSitePrefix(prefix);

    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      // APIベースURLの決定
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || (prefix ? `${window.location.origin}${prefix}/api` : `${window.location.origin}/api`);

      if (!token && !storedUser) {
        window.location.href = `${prefix}/login`;
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
        const userData = data.user || data;
        setUser(userData);
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-cyan-500 font-mono animate-pulse uppercase tracking-widest">Accessing Secure Profile...</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col lg:flex-row">
      
      {/* 📟 サイドナビゲーション（マイページ専用） */}
      <aside className="w-full lg:w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
          <span className="text-xl font-black tracking-tighter italic uppercase">BicStation</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">User Menu</div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition-all">
            <User size={18} /> <span className="text-sm font-bold">Profile Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Database size={18} /> <span className="text-sm font-bold">My Favorites</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Settings size={18} /> <span className="text-sm font-bold">Account Settings</span>
          </a>
        </nav>

        {user.is_staff && (
          <div className="mt-4 pt-4 border-t border-slate-800">
             <a href={`${sitePrefix}/admin`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
              <LayoutDashboard size={18} /> <span className="text-sm font-bold">Open Admin Panel</span>
            </a>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button onClick={() => logoutUser()} className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-rose-400 transition-colors font-bold text-sm">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 🖥️ メインコンテンツ */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">User Terminal</h1>
            <p className="text-slate-400 text-sm">
              Logged in as: <span className="text-cyan-400 font-mono font-bold">{user.username}</span> 
              <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500 uppercase tracking-widest">{user.site_group}</span>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identity</p>
              <p className="text-sm font-bold text-slate-200">{user.email || 'No Email Linked'}</p>
            </div>
          </div>
        </div>

        {/* 統計カードセクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<TrendingUp className="text-cyan-400" />} title="Activity Score" value="1,240" sub="Top 15% of users" />
          <StatCard icon={<Clock className="text-emerald-400" />} title="Total Usage" value="48h" sub="Last 30 days" />
          <StatCard icon={<Shield className="text-purple-400" />} title="Security Level" value="High" sub="2FA Enabled" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* アクティビティチャート（Recharts） */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Activity size={18} className="text-cyan-400" /> Usage Statistics
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#22d3ee" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#22d3ee' }} 
                    activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 最近の通知/ログ */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Clock size={18} className="text-cyan-400" /> Recent History
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              <HistoryItem time="Just now" type="LOGIN" msg="New session started from Tokyo" />
              <HistoryItem time="2h ago" type="UPDATE" msg="Profile information synchronized" />
              <HistoryItem time="Yesterday" type="INFO" msg="Premium features activated" />
              <HistoryItem time="3 days ago" type="SECURE" msg="Password verified successfully" />
            </div>
            <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group">
              View Activity Log <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- サブコンポーネント（AdminDashboardと同様のスタイルを維持） ---

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

function HistoryItem({ time, type, msg }: any) {
  const color = type === 'LOGIN' ? 'bg-emerald-500' : type === 'SECURE' ? 'bg-purple-500' : 'bg-cyan-500';
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