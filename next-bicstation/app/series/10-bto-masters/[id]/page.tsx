"use client";

import React from 'react';
import Link from 'next/link';
// パスはディレクトリ構成に合わせて調整してください
import { BTO_SERIES_CONFIG } from '../data'; 
import { 
  Terminal, Cpu, Zap, ChevronRight, LayoutGrid, 
  Box, Activity, Shield, HardDrive, Cpu as CpuIcon,
  Mic, Microscope, Brain, Briefcase, BarChart3
} from 'lucide-react';

// シリーズIDに応じたアイコンのマッピング
const ICON_MAP: Record<string, React.ReactNode> = {
  build_logic: <CpuIcon size={20} />,
  operation_mastery: <Activity size={20} />,
  gaming: <Zap size={20} />,
  trading: <BarChart3 size={20} />,
  business: <Briefcase size={20} />,
  creative: <Box size={20} />,
  ai_dev: <Brain size={20} />,
  science: <Microscope size={20} />,
  streaming: <Mic size={20} />
};

export default function SeriesHub() {
  const seriesEntries = Object.entries(BTO_SERIES_CONFIG);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans p-6 md:p-16 lg:p-24 selection:bg-blue-600 selection:text-white">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-24 relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            <LayoutGrid size={24} className="text-white" />
          </div>
          <div className="h-[1px] w-12 bg-zinc-800"></div>
          <span className="font-mono text-[11px] tracking-[0.6em] text-blue-500 uppercase font-bold">
            BTO_Masters_Archive_v3
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-8">
          BICSTATION <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            CORE_ARCHIVE
          </span>
        </h1>

        <p className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-[0.15em] max-w-2xl leading-relaxed border-l-2 border-blue-600 pl-6">
          44年の知見を統合。カタログスペックを超越した、<br />
          九つの特化型演算機構築論（BTO Masters Series）。
        </p>
      </header>

      {/* Series Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {seriesEntries.map(([id, config]) => {
          // タイトルの安全な分割
          const [mainTitle, subTitle] = config.title.includes('：') 
            ? config.title.split('：') 
            : [config.title, "SYSTEM_FRAGMENT"];

          return (
            <Link key={id} href={`/series/${id}/1`} className="block group">
              <div className="h-full relative bg-zinc-950/50 border border-white/5 p-8 rounded-[2.5rem] overflow-hidden transition-all duration-500 group-hover:border-blue-500/40 group-hover:bg-zinc-900/40 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                
                {/* ID-based Watermark Icon */}
                <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12 group-hover:text-blue-500">
                  {ICON_MAP[id] || <CpuIcon size={280} />}
                  {/* アイコンサイズを調整するためにラップ */}
                  <div className="scale-[12]">
                     {ICON_MAP[id] || <CpuIcon />}
                  </div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-2.5 px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full group-hover:border-blue-500/30 transition-colors">
                      <div className="text-blue-500">
                        {ICON_MAP[id] || <Terminal size={14} />}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest group-hover:text-blue-400">
                        {id.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-white italic uppercase leading-tight mb-2 group-hover:text-blue-100 transition-colors">
                      {mainTitle}
                    </h2>
                    <div className="h-0.5 w-8 bg-blue-600 mb-3 group-hover:w-16 transition-all duration-500"></div>
                    <p className="text-[10px] font-mono text-blue-500/80 uppercase tracking-wider font-bold">
                      {subTitle}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-500 leading-relaxed mb-8 flex-grow group-hover:text-zinc-300 transition-colors">
                    {config.concept}
                  </p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 mt-auto">
                    <div>
                      <span className="block text-[8px] font-mono text-zinc-600 uppercase mb-1">Priority_Device</span>
                      <span className="text-[10px] text-zinc-400 font-medium truncate block uppercase group-hover:text-blue-300 transition-colors">
                        {config.priorityDevice}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-mono text-zinc-600 uppercase mb-1">Status</span>
                      <span className="text-[10px] text-green-600 font-mono flex items-center justify-end gap-1.5 uppercase">
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-pulse"></span>
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer System Info */}
      <footer className="max-w-7xl mx-auto mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-blue-600" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">System_BIC_v3.7</span>
          </div>
          <div className="w-[1px] h-4 bg-zinc-800"></div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Total_Series: 09</span>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Reconstructing the future of BTO hardware.
        </div>
      </footer>
    </div>
  );
}