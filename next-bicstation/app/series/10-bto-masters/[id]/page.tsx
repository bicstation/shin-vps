"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { BTO_SERIES_CONFIG } from '../data'; 
import { ArrowLeft, Target, Zap, Shield, Crown, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function SeriesDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const config = BTO_SERIES_CONFIG[id];

  if (!config) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Node not found.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-blue-600">
      
      {/* --- 背景装飾 --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* --- ナビゲーション --- */}
        <Link href="/series" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs tracking-widest uppercase">Back to Archive Hub</span>
        </Link>

        {/* --- ヒーローセクション --- */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              Node_{id.toUpperCase()}
            </span>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic mb-6 tracking-tighter leading-tight">
            {config.title.split('：')[0]} <br />
            <span className="text-blue-500 not-italic text-2xl md:text-4xl">{config.title.split('：')[1]}</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed border-l-2 border-blue-600 pl-6">
            {config.concept}
          </p>
        </header>

        {/* --- フェーズ & エピソード セクション --- */}
        <div className="space-y-32">
          {config.phases.map((phase, pIndex) => (
            <section key={pIndex} className="relative">
              
              {/* フェーズヘッダー */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                <div>
                  <div className="flex items-center gap-2 text-blue-500 mb-2">
                    {pIndex === 0 && <Shield size={20} />}
                    {pIndex === 1 && <Zap size={20} />}
                    {pIndex === 2 && <Target size={20} />}
                    {pIndex === 3 && <Crown size={20} />}
                    <span className="font-mono text-sm font-bold tracking-[0.2em] uppercase">PHASE_0{pIndex + 1}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight">{phase.label}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Target Budget</div>
                  <div className="text-3xl font-mono font-black text-blue-400">{phase.budget}</div>
                </div>
              </div>

              {/* 重点情報カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-blue-600 uppercase block mb-1">Strategic Focus</span>
                  <p className="text-sm font-bold text-zinc-200">{phase.focus}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] font-mono text-blue-600 uppercase block mb-1">Environment</span>
                  <p className="text-sm font-bold text-zinc-200">{phase.environment}</p>
                </div>
              </div>

              {/* --- エピソードリスト（タイムライン形式） --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {phase.episodes?.map((ep) => (
                  <Link 
                    key={ep.ep} 
                    href={`/series/${id}/episode/${ep.ep}`}
                    className="group relative flex items-center gap-6 p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-zinc-900/50"
                  >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white">
                      <span className="font-mono text-lg font-black">{ep.ep}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase group-hover:text-blue-500">Read Analysis</span>
                        <ChevronRight size={10} className="text-zinc-700 group-hover:text-blue-500" />
                      </div>
                    </div>
                    {ep.title.includes("Amazon") && (
                      <ShoppingCart size={14} className="text-orange-500/50 absolute top-4 right-4" />
                    )}
                  </Link>
                ))}
              </div>

            </section>
          ))}
        </div>

        {/* --- フッターエリア --- */}
        <footer className="mt-40 text-center border-t border-white/5 pt-20">
          <p className="text-zinc-600 font-mono text-[10px] tracking-[0.5em] uppercase mb-4">
            Build Your Legend. Become the Master.
          </p>
          <div className="w-12 h-[1px] bg-blue-600 mx-auto"></div>
        </footer>

      </div>
    </div>
  );
}