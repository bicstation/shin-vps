// frontend/src/app/admin/dashboard/page.tsx
"use client";

import React from 'react';
// Rechartsの型定義エラーを回避するため、ビルド時に無視する設定を各所に適用
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Server, Cpu, Database, Users, Activity, Play, RefreshCw, AlertTriangle 
} from 'lucide-react';

// 📊 統計データ（実際には API からフェッチする想定）
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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      
      {/* 🚀 ヘッダーセクション */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-cyan-400">
            BICSTATION COMMAND CENTER
          </h1>
          <p className="text-slate-400 mt-1">システム稼働状況とデータ統計のリアルタイム監視</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all border border-slate-700">
            <RefreshCw size={18} className="text-slate-400" /> 
            <span className="text-sm font-semibold">Refresh</span>
          </button>
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <Play size={18} fill="currentColor" /> 
            <span className="text-sm">Run All Scrapers</span>
          </button>
        </div>
      </div>

      {/* 📈 ステータスカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} className="text-cyan-400" /> データ増加推移（1週間）
            </h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-500 rounded-full"></span> PC Products</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Adult Contents</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            {/* @ts-ignore: ResponsiveContainer type conflict with React 18 */}
            <ResponsiveContainer width="100%" height="100%">
              {/* @ts-ignore */}
              <LineChart data={productStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pc" 
                  stroke="#22d3ee" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0f172a', strokeWidth: 2 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="adult" 
                  stroke="#a855f7" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0f172a', strokeWidth: 2 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 システムログエリア */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Server size={20} className="text-cyan-400" /> System Logs
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-80 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            <LogItem time="14:20:05" type="SUCCESS" msg="FANZA API Sync Completed" />
            <LogItem time="14:15:22" type="INFO" msg="AI Summary generated for #PC-542" />
            <LogItem time="13:50:10" type="ERROR" msg="DMM Scraper: Connection Timeout" />
            <LogItem time="13:45:00" type="INFO" msg="User 'maya' authorized" />
            <LogItem time="12:30:15" type="SUCCESS" msg="Database backup finished" />
            <LogItem time="11:10:44" type="ERROR" msg="NPU Score calculation failed" />
          </div>
          <button className="w-full mt-6 py-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors font-medium border-t border-slate-800 pt-4">
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
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-cyan-500/50 transition-all group shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        {React.cloneElement(icon, { size: 60 })}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-slate-800/80 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-xs text-slate-500 mt-1 font-medium">{sub}</span>
      </div>
    </div>
  );
}

// --- サブコンポーネント: ログアイテム ---

function LogItem({ time, type, msg }: { time: string, type: 'SUCCESS' | 'ERROR' | 'INFO', msg: string }) {
  const badgeStyles = {
    SUCCESS: 'text-emerald-400 bg-emerald-400/10',
    ERROR: 'text-rose-400 bg-rose-400/10',
    INFO: 'text-cyan-400 bg-cyan-400/10'
  };

  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-800/30 border border-transparent hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyles[type]}`}>
          {type}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{time}</span>
      </div>
      <span className="text-sm text-slate-300 leading-snug">{msg}</span>
    </div>
  );
}