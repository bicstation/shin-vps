"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Zap, Search } from 'lucide-react';

export default function AIMetaSync() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(35);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [selectedModel, setSelectedModel] = useState("phi-3-mini");

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(isProcessing 
        ? Math.floor(Math.random() * (85 - 70) + 70) 
        : Math.floor(Math.random() * (20 - 10) + 10)
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <>
      {/* ヘッダー */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            AI Meta Sync <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">PC Edition</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium">PCスペック表から魅力的な紹介文とSEOタグを自動生成</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current Model</div>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-cyan-400 outline-none focus:border-cyan-500"
          >
            <option value="phi-3-mini">Phi-3-Mini (Lightweight)</option>
            <option value="llama3-8b">Llama 3 (High Quality)</option>
            <option value="gemma-2b">Gemma 2B (Ultra Fast)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* コントロールパネル */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap size={120} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-white">
              <Play size={20} className="text-cyan-400" /> 実行プロセス管理
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-slate-400 font-bold flex items-center gap-2">
                    <Search size={14} /> 処理対象: <span className="text-white text-sm">48 / 124 PCモデル</span>
                  </span>
                  <span className="text-cyan-400 font-mono text-sm">{progress}% Complete</span>
                </div>
                <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-400 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <button 
                onClick={() => setIsProcessing(!isProcessing)}
                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 ${isProcessing ? 'bg-slate-800 hover:bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_25px_rgba(8,145,178,0.2)]'}`}
              >
                {isProcessing ? <><Pause size={20} fill="currentColor" /> 処理を一時停止</> : <><Zap size={20} fill="currentColor" /> AI紹介文の一括生成を開始</>}
              </button>
            </div>
          </div>

          {/* ログエリア */}
          <div className="bg-black/60 border border-slate-800 p-6 rounded-3xl font-mono text-[11px] h-72 overflow-y-auto">
            <div className="space-y-1.5 text-slate-500">
              <p>[{new Date().toLocaleTimeString()}] システム初期化完了</p>
              <p className="text-cyan-500">[{new Date().toLocaleTimeString()}] Ollamaモデル {selectedModel} をロード中...</p>
              {isProcessing && (
                <div className="text-white mt-4 border-l-2 border-cyan-500 pl-2">
                  <p className="text-emerald-400 font-bold">● PROCESSING: [Model #PC-402] MacBook Pro M3</p>
                  <p className="text-slate-400 ml-4 italic">&gt; スペック解析・紹介文生成中...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* サイド情報 */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
            <h3 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-[0.2em]">Resource Monitor</h3>
            <div className="space-y-6">
              <ResourceGauge label="CPU Usage" value={cpuUsage} color={cpuUsage > 80 ? "text-rose-500" : "text-cyan-400"} />
              <ResourceGauge label="VRAM (Ollama)" value={64} color="text-purple-400" />
              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 items-start text-[10px] text-amber-500/80">
                <AlertTriangle size={16} className="shrink-0" />
                <span>処理中はWebサーバーの応答速度が低下する可能性があります。</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Target Mode</h3>
            <div className="space-y-2">
              <ModeToggle label="初心者向け解説" active />
              <ModeToggle label="テクニカル仕様重視" />
              <ModeToggle label="コスパ比較重視" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResourceGauge({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-2 font-bold tracking-wider uppercase text-slate-500">
        <span>{label}</span><span className={color}>{value}%</span>
      </div>
      <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
        <div className={`h-full bg-current transition-all duration-1000 ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function ModeToggle({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className={`w-full p-3 rounded-xl text-xs font-bold transition-all border ${active ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-transparent text-slate-500 hover:border-slate-700'}`}>
      {label}
    </div>
  );
}