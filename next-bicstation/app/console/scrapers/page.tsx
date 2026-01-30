"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Square, RefreshCcw, 
  Search, ShieldCheck, Zap, Database, Download, AlertCircle
} from 'lucide-react';

// 🧪 ログのダミー生成用
const initialLogs = [
  { id: 1, time: '12:00:01', type: 'SYSTEM', msg: 'Scraper Engine v2.0 initialized.' },
  { id: 2, time: '12:00:05', type: 'INFO', msg: 'Target: DMM.co.jp - Checking for new releases...' },
  { id: 3, time: '12:00:10', type: 'SUCCESS', msg: 'Fetched 12 new product IDs.' },
];

export default function ScraperTerminal() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ログの自動スクロール
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 実行擬似ロジック
  const toggleScraper = () => {
    setIsRunning(!isRunning);
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: isRunning ? 'SYSTEM' : 'PROCESS',
      msg: isRunning ? 'Stopping scraper processes...' : 'Starting scraper engine...'
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 🚀 ヘッダーエリア */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <Terminal className="text-cyan-500" /> Scraper Terminal
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">外部プラットフォームからのデータ取得・同期ステータス</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
          <div className="flex flex-col px-4">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Status</span>
            <span className={`text-xs font-bold ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isRunning ? '● RUNNING' : '○ IDLE'}
            </span>
          </div>
          <button 
            onClick={toggleScraper}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest shadow-lg ${
              isRunning 
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
            }`}
          >
            {isRunning ? <><Square size={16} fill="currentColor" /> Stop Engine</> : <><Play size={16} fill="currentColor" /> Start Scraper</>}
          </button>
        </div>
      </div>

      {/* 📊 ステータスパネル */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TerminalStatCard icon={<Download className="text-cyan-400" />} title="Fetched" value="1,240" sub="Today" />
        <TerminalStatCard icon={<Database className="text-purple-400" />} title="Synced" value="98.2%" sub="DB Integrity" />
        <TerminalStatCard icon={<Zap className="text-amber-400" />} title="NPU Speed" value="24ms" sub="Avg Latency" />
      </div>

      {/* 📟 メインターミナル */}
      <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* ターミナルバー */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">system@bicstation:~ scraper_logs</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-white transition-colors" title="Clear Logs">
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {/* ログ出力エリア */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed custom-scrollbar bg-[#020617]">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 mb-2 group animate-in slide-in-from-left-2 duration-300">
              <span className="text-slate-600 shrink-0">{log.time}</span>
              <span className={`shrink-0 font-black w-16 ${getLogColor(log.type)}`}>[{log.type}]</span>
              <span className="text-slate-300 group-hover:text-cyan-100 transition-colors">{log.msg}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* 入力風インジケーター */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center gap-3">
          <span className="text-cyan-500 font-bold tracking-widest"> {'>'} </span>
          <div className={`w-2 h-4 bg-cyan-500 animate-pulse ${isRunning ? 'visible' : 'invisible'}`} />
          <span className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
            {isRunning ? 'Analyzing target data streams...' : 'System standby.'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- サブコンポーネント ---

function getLogColor(type: string) {
  switch (type) {
    case 'SUCCESS': return 'text-emerald-500';
    case 'ERROR': return 'text-rose-500';
    case 'SYSTEM': return 'text-cyan-500';
    case 'PROCESS': return 'text-purple-500';
    default: return 'text-slate-500';
  }
}

function TerminalStatCard({ icon, title, value, sub }: { icon: any, title: string, value: string, sub: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-4">
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-white">{value}</span>
          <span className="text-[9px] text-slate-600 font-bold">{sub}</span>
        </div>
      </div>
    </div>
  );
}