/**
 * 🔐 BICSTATION 統合ダッシュボード (Hybrid Mode)
 * 🛡️ Maya's Logic: v3 物理構造最適化 + Staff/Member 自動切替版
 * 物理パス: app/dashboard/page.tsx (または app/mypage/page.tsx)
 */

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Server, Cpu, Database, Users, Activity, Play, RefreshCw, 
  ChevronRight, LayoutDashboard, User, Settings, LogOut, ShieldCheck,
  TrendingUp, Clock, Shield
} from 'lucide-react';

/**
 * ✅ 修正ポイント 1: インポートパスの物理構造合わせ
 * 構造: shared/lib/utils/auth.tsx
 */
import { logoutUser } from '@shared/lib/utils/auth';

// --- 型定義 ---
interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  site_group: string;
}

// 📊 統計ダミーデータ
const statsData = [
  { name: 'Mon', pc: 45, views: 12 },
  { name: 'Tue', pc: 52, views: 45 },
  { name: 'Wed', pc: 48, views: 32 },
  { name: 'Thu', pc: 61, views: 61 },
  { name: 'Fri', pc: 55, views: 55 },
  { name: 'Sat', pc: 67, views: 89 },
  { name: 'Sun', pc: 72, views: 72 },
];

/**
 * 💡 ダッシュボードのメインコンテンツ
 */
function DashboardContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [basePath, setBasePath] = useState("");
  const router = useRouter();

  useEffect(() => {
    // クライアントサイドでのベースパス判定
    const currentPath = window.location.pathname;
    const prefix = currentPath.startsWith('/bicstation') ? '/bicstation' : '';
    setBasePath(prefix);

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tiper.live';

      if (!token) {
        // トークンがない場合は即座にログインへリダイレクト
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
        // Django側のレスポンス構造 (userキーの有無) に柔軟に対応
        const userData = data.user || data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error("Auth check failed:", err);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          router.push(`${prefix}/login`);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse tracking-widest">SYSTEM AUTHORIZING...</p>
    </div>
  );
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col lg:flex-row">
      
      {/* サイドバー */}
      <aside className="w-full lg:w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter italic uppercase">BICSTATION</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">
            {user.is_staff ? 'Admin Core' : 'User Menu'}
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LayoutDashboard size={18} /> <span className="text-sm font-bold">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Database size={18} /> <span className="text-sm font-bold">{user.is_staff ? 'Products' : 'My Favorites'}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Settings size={18} /> <span className="text-sm font-bold">Settings</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={() => logoutUser()} 
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-rose-400 transition-colors font-bold text-sm"
          >
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
              Auth_Node: <span className="text-cyan-400 font-bold">{user.username}</span> 
              <span className="ml-3 text-slate-600">[{user.is_staff ? 'STAFF_ACCESS' : 'MEMBER_ACCESS'}]</span>
            </p>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[10px] font-mono">
                <span className="text-slate-500">STATUS:</span> <span className="text-emerald-400 animate-pulse">ONLINE</span>
             </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {user.is_staff ? (
            <>
              <StatCard icon={<Cpu className="text-cyan-400" />} title="Server Load" value="24%" sub="VPS-Shin Stable" />
              <StatCard icon={<Database className="text-purple-400" />} title="Products" value="12,840" sub="+420 New Items" />
              <StatCard icon={<Users className="text-emerald-400" />} title="Sessions" value="85" sub="Active Monitor" />
              <StatCard icon={<Activity className="text-rose-400" />} title="AI Queues" value="12" sub="Processing..." />
            </>
          ) : (
            <>
              <StatCard icon={<TrendingUp className="text-cyan-400" />} title="Activity Score" value="1,240" sub="Top 15% User" />
              <StatCard icon={<Clock className="text-emerald-400" />} title="Total Usage" value="48h" sub="Last 30 days" />
              <StatCard icon={<Shield className="text-purple-400" />} title="Security" value="High" sub="2FA Verified" />
              <StatCard icon={<RefreshCw className="text-rose-400" />} title="Last Sync" value="3m ago" sub="Auto Update" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* グラフセクション */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Activity size={18} className="text-cyan-400" /> {user.is_staff ? 'Traffic Analysis' : 'Usage Stats'}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={user.is_staff ? "pc" : "views"} 
                    stroke="#22d3ee" 
                    strokeWidth={4} 
                    dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 履歴・ログセクション */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Clock size={18} className="text-cyan-400" /> {user.is_staff ? 'System Logs' : 'Activity Log'}
            </h3>
            <div className="space-y-4">
              <LogItem time="Just now" type={user.is_staff ? "SUCCESS" : "LOGIN"} msg={user.is_staff ? "FANZA API Sync Complete" : "User session started"} />
              <LogItem time="2h ago" type="INFO" msg={user.is_staff ? "AI Review #88 Generated" : "Database synced"} />
              <LogItem time="Yesterday" type={user.is_staff ? "ERROR" : "SECURE"} msg={user.is_staff ? "DMM Scraper Timeout" : "Security checkpoint passed"} />
              <LogItem time="Yesterday" type="INFO" msg={user.is_staff ? "Kernel Update applied" : "Session restored"} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * ✅ 統合ダッシュボード エントリポイント
 */
export default function UnifiedDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono">
        <div className="flex flex-col items-center gap-2">
           <RefreshCw className="animate-spin" size={32} />
           <span className="tracking-[0.3em]">INITIALIZING CORE...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

// --- サブコンポーネント ---

function StatCard({ icon, title, value, sub }: any) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:bg-slate-800/80 transition-all border-b-2 hover:border-b-cyan-500 group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform group-hover:bg-slate-700">
          {icon}
        </div>
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium uppercase">{sub}</div>
    </div>
  );
}

function LogItem({ time, type, msg }: any) {
  const color = type === 'SUCCESS' || type === 'LOGIN' ? 'bg-emerald-500' : type === 'ERROR' ? 'bg-rose-500' : 'bg-cyan-500';
  const textColor = type === 'SUCCESS' || type === 'LOGIN' ? 'text-emerald-400' : type === 'ERROR' ? 'text-rose-400' : 'text-cyan-400';
  
  return (
    <div className="flex flex-col gap-1 border-l-2 border-slate-800 pl-4 py-1 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
        <span className="text-[10px] font-mono text-slate-500">{time}</span>
        <span className={`text-[9px] font-bold px-1.5 rounded-sm bg-opacity-10 ${textColor} bg-current`}>
          {type}
        </span>
      </div>
      <p className="text-xs text-slate-400 font-medium">{msg}</p>
    </div>
  );
}