"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Server, Cpu, Database, Users, Activity, Play, RefreshCw, ChevronRight
} from 'lucide-react';

/**
 * =====================================================================
 * 📊 統計データ (ダミーデータ)
 * =====================================================================
 */
const productStats = [
  { name: 'Mon', pc: 45, adult: 120 },
  { name: 'Tue', pc: 52, adult: 110 },
  { name: 'Wed', pc: 48, adult: 140 },
  { name: 'Thu', pc: 61, adult: 130 },
  { name: 'Fri', pc: 55, adult: 160 },
  { name: 'Sat', pc: 67, adult: 190 },
  { name: 'Sun', pc: 72, adult: 210 },
];

/**
 * 💡 メインコンテンツ
 * Rechartsはブラウザ環境を必要とするため、mounted制御を維持します。
 */
function DashboardContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
        <p className="text-slate-500 text-xs font-mono">LOADING VISUALIZER...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 🛠️ ヘッダーセクション */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 mb-2 font-black text-[10px] tracking-widest uppercase bg-cyan-500/10 w-fit px-2 py-0.5 rounded">
            System <ChevronRight size={10} /> Metrics
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Overview
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">システム稼働状況とデータ統計のリアルタイム監視</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all border border-slate-800 text-xs font-bold text-slate-300 active:scale-95">
            <RefreshCw size={16} className="text-slate-500" /> Refresh
          </button>
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] text-xs text-white active:scale-95">
            <Play size={16} fill="currentColor" /> Run Scrapers
          </button>
        </div>
      </div>

      {/* 📈 ステータスカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Cpu className="text-cyan-400" />} 
          title="Server Load" 
          value="24%" 
          sub="Stable / 0.82 load" 
        />
        <StatCard 
          icon={<Database className="text-purple-400" />} 
          title="Total Products" 
          value="12,840" 
          sub="+420 items added today" 
        />
        <StatCard 
          icon={<Users className="text-emerald-400" />} 
          title="Active Users" 
          value="850" 
          sub="12 users online now" 
        />
        <StatCard 
          icon={<Activity className="text-rose-400" />} 
          title="AI Processing" 
          value="Active" 
          sub="32 tasks in queue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📊 メインチャートエリア */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 p-7 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <Activity size={20} className="text-cyan-500" /> データ増加推移（1週間）
            </h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span> PC
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span> Adult
              </span>
            </div>
          </div>
          
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pc" 
                  stroke="#22d3ee" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#22d3ee' }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="adult" 
                  stroke="#a855f7" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#a855f7' }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#a855f7' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 システムログエリア */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-7 rounded-3xl shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-100">
            <Server size={20} className="text-cyan-500" /> System Logs
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2 custom-scrollbar">
            <LogItem time="14:20:05" type="SUCCESS" msg="FANZA API Sync Completed" />
            <LogItem time="14:15:22" type="INFO" msg="AI Summary generated for #PC-542" />
            <LogItem time="13:50:10" type="ERROR" msg="DMM Scraper: Connection Timeout" />
            <LogItem time="13:45:00" type="INFO" msg="User 'maya' authorized" />
            <LogItem time="12:30:15" type="SUCCESS" msg="Database backup finished" />
            <LogItem time="11:10:44" type="ERROR" msg="NPU Score calculation failed" />
          </div>
          <button className="w-full mt-8 py-3 text-[11px] text-slate-500 hover:text-cyan-400 transition-all font-black uppercase tracking-widest border-t border-slate-800/50 pt-6">
            View All Terminal Logs
          </button>
        </div>

      </div>
    </div>
  );
}

// --- サブコンポーネント: 統計カード ---
function StatCard({ icon, title, value, sub }: { icon: any, title: string, value: string, sub: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:border-cyan-500/30 transition-all group shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 80 })}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-white/5">
          {icon}
        </div>
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        <span className="text-[10px] text-slate-500 mt-1.5 font-bold">{sub}</span>
      </div>
    </div>
  );
}

// --- サブコンポーネント: ログアイテム ---
function LogItem({ time, type, msg }: { time: string, type: 'SUCCESS' | 'ERROR' | 'INFO', msg: string }) {
  const badgeStyles = {
    SUCCESS: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20',
    ERROR: 'text-rose-400 bg-rose-400/5 border-rose-400/20',
    INFO: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/20'
  };

  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-800/20 border border-transparent hover:border-slate-800 hover:bg-slate-800/40 transition-all">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border ${badgeStyles[type]}`}>
          {type}
        </span>
        <span className="text-[10px] text-slate-600 font-mono font-bold tracking-tighter">{time}</span>
      </div>
      <span className="text-xs text-slate-300 font-medium leading-relaxed">{msg}</span>
    </div>
  );
}

/**
 * ✅ ページエントリポイント
 * 他のconsoleページと一貫性を持たせるため Suspense でラップ
 */
export default function ConsoleDashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-xs animate-pulse">CONNECTING TO SYSTEM CORE...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}