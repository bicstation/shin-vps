"use client";

import React from 'react';
import { useParams } from 'next/navigation';
// 統合された180講のデータをインポート
import { GUIDE_DATA } from '../data'; 
import { 
  ArrowLeft, Target, Zap, Shield, Crown, ChevronRight, 
  ShoppingCart, Activity, Factory, Laptop, Brain, 
  Smartphone, Code2, Briefcase, AlertTriangle, Cpu
} from 'lucide-react';
import Link from 'next/link';

export default function SeriesDetailPage() {
  const params = useParams();
  const id = params.id as string;
  // GUIDE_DATA から該当するカテゴリ (id) を抽出
  const config = (GUIDE_DATA as any)[id];

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Node_Not_Found</h1>
        <p className="text-zinc-500 mt-2">指定されたセクターの設計図は存在しません。</p>
        <Link href="/series/00-master-log" className="mt-8 text-blue-500 hover:underline">Return to Archive Hub</Link>
      </div>
    );
  }

  // カテゴリーに応じたメインアイコンとテーマカラーの決定
  const getCategoryTheme = (catId: string) => {
    switch (catId) {
      case 'bto': return { icon: <Cpu size={24} />, color: 'text-orange-500', glow: 'bg-orange-500/10' };
      case 'software': return { icon: <Laptop size={24} />, color: 'text-blue-400', glow: 'bg-blue-400/10' };
      case 'ai': return { icon: <Brain size={24} />, color: 'text-emerald-400', glow: 'bg-emerald-400/10' };
      case 'lifestyle': return { icon: <Smartphone size={24} />, color: 'text-rose-400', glow: 'bg-rose-400/10' };
      case 'dev': return { icon: <Code2 size={24} />, color: 'text-indigo-400', glow: 'bg-indigo-400/10' };
      case 'career': return { icon: <Briefcase size={24} />, color: 'text-amber-400', glow: 'bg-amber-400/10' };
      default: return { icon: <Shield size={24} />, color: 'text-zinc-400', glow: 'bg-zinc-400/10' };
    }
  };

  const theme = getCategoryTheme(id);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-700">
      
      {/* --- 背景装飾（演算の脈動を表現） --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] ${theme.glow} rounded-full blur-[140px]`} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* --- ナビゲーション --- */}
        <Link href="/series/00-master-log" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs tracking-widest uppercase">Back to Archive Hub</span>
        </Link>

        {/* --- ヒーローセクション --- */}
        <header className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-2 bg-white/5 border border-white/10 ${theme.color} rounded-lg`}>
              {theme.icon}
            </div>
            <span className="px-3 py-1 bg-zinc-900 border border-white/10 text-zinc-400 text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              Sector_ID_{id.toUpperCase()}
            </span>
            <div className={`h-[1px] flex-grow bg-gradient-to-r from-white/20 to-transparent`}></div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white italic mb-8 tracking-tighter leading-tight uppercase">
            {config.title.split('：')[0]} <br />
            <span className={`${theme.color} not-italic text-2xl md:text-5xl`}>{config.title.split('：')[1]}</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <p className="text-xl text-zinc-400 leading-relaxed border-l-4 border-white/20 pl-8 py-2">
                {config.concept}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
              <h3 className={`text-[10px] font-mono ${theme.color} uppercase tracking-widest mb-4`}>Priority Stack</h3>
              <div className="flex flex-wrap gap-2">
                {config.priorityDevice.split('・').map((device: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-black border border-white/10 rounded text-xs text-zinc-300 font-bold">
                    {device}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* --- フェーズ & エピソード セクション --- */}
        <div className="space-y-40">
          {config.phases.map((phase: any, pIndex: number) => (
            <section key={pIndex} className="relative">
              
              {/* フェーズヘッダー */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8 relative">
                <div className={`absolute -left-4 top-0 w-1 h-12 ${theme.color.replace('text', 'bg')} rounded-full blur-sm opacity-50`} />
                <div>
                  <div className={`flex items-center gap-2 ${theme.color} mb-2`}>
                    {pIndex === 0 && <Shield size={20} />}
                    {pIndex === 1 && <Zap size={20} />}
                    {pIndex === 2 && <Target size={20} />}
                    <span className="font-mono text-sm font-bold tracking-[0.2em] uppercase">PHASE_0{pIndex + 1}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight">{phase.label}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Target Budget</div>
                  <div className={`text-3xl font-mono font-black ${theme.color} tabular-nums`}>{phase.budget}</div>
                </div>
              </div>

              {/* 戦略カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl">
                  <span className={`text-[10px] font-mono ${theme.color} uppercase block mb-2 tracking-widest`}>Strategic Focus</span>
                  <p className="text-lg font-bold text-zinc-100 leading-snug">{phase.focus}</p>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl">
                  <span className={`text-[10px] font-mono ${theme.color} uppercase block mb-2 tracking-widest`}>Operating Environment</span>
                  <p className="text-lg font-bold text-zinc-100 leading-snug">{phase.environment}</p>
                </div>
              </div>

              {/* --- エピソードリスト --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {phase.episodes?.map((ep: any) => (
                  <Link 
                    key={ep.ep} 
                    href={`/series/00-master-log/${id}/${ep.ep}`}
                    className="group relative flex items-center gap-6 p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-white/20 transition-all hover:bg-zinc-900/50 overflow-hidden"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 group-hover:scale-110 transition-transform group-hover:bg-zinc-100 group-hover:text-black z-10`}>
                      <span className="font-mono text-lg font-black tabular-nums">{ep.ep}</span>
                    </div>
                    
                    <div className="flex-grow z-10">
                      <h4 className="text-[15px] font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase group-hover:text-zinc-400 transition-colors">Data Archive Available</span>
                        <ChevronRight size={10} className="text-zinc-700 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </section>
          ))}
        </div>

        {/* --- フッターエリア --- */}
        <footer className="mt-60 text-center border-t border-white/10 pt-24 pb-12 font-mono">
          <p className="text-zinc-600 text-xs max-w-md mx-auto leading-relaxed uppercase tracking-widest">
            Master Archive Module // Sector: {id.toUpperCase()} <br />
            Next-BicStation Digital Infrastructure
          </p>
        </footer>

      </div>
    </div>
  );
}