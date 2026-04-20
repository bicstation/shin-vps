"use client";

import React from 'react';
import { useParams } from 'next/navigation';
// 既存のBTO_SERIES_CONFIGではなく、Series 20専用の定義を参照するように修正
import { BTO_FORTRESS_CONFIG } from '../data'; 
import { 
  ArrowLeft, Target, Zap, Shield, Crown, ChevronRight, 
  ShoppingCart, Activity, Factory, Truck, GraduationCap, 
  Building2, Landmark, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function SeriesDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const config = BTO_FORTRESS_CONFIG[id];

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Node_Not_Found</h1>
        <p className="text-zinc-500 mt-2">指定された要塞の設計図は存在しません。</p>
        <Link href="/series" className="mt-8 text-blue-500 hover:underline">Return to Hub</Link>
      </div>
    );
  }

  // カテゴリーに応じたメインアイコンの決定
  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'finance': return <Landmark size={24} />;
      case 'public': return <Building2 size={24} />;
      case 'education': return <GraduationCap size={24} />;
      case 'industry': return <Factory size={24} />;
      case 'logistics': return <Truck size={24} />;
      case 'medical': return <Activity size={24} />;
      default: return <Shield size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-blue-600">
      
      {/* --- 背景装飾（演算の脈動を表現） --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* --- ナビゲーション --- */}
        <Link href="/series" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs tracking-widest uppercase">Back to Series Hub</span>
        </Link>

        {/* --- ヒーローセクション --- */}
        <header className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-lg">
              {getCategoryIcon(id)}
            </div>
            <span className="px-3 py-1 bg-zinc-900 border border-white/10 text-zinc-400 text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              Node_Fortress_{id.toUpperCase()}
            </span>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white italic mb-8 tracking-tighter leading-tight">
            {config.title.split('：')[0]} <br />
            <span className="text-blue-500 not-italic text-2xl md:text-5xl">{config.title.split('：')[1]}</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <p className="text-xl text-zinc-400 leading-relaxed border-l-4 border-blue-600 pl-8 py-2 bg-gradient-to-r from-blue-600/5 to-transparent">
                {config.concept}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-4">Priority Devices</h3>
              <div className="flex flex-wrap gap-2">
                {config.priorityDevice.split('・').map((device, idx) => (
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
          {config.phases.map((phase, pIndex) => (
            <section key={pIndex} className="relative">
              
              {/* フェーズヘッダー */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8 relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-blue-500 rounded-full blur-sm opacity-50" />
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
                  <div className="text-3xl font-mono font-black text-blue-400 tabular-nums">{phase.budget}</div>
                </div>
              </div>

              {/* 戦略カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-2xl">
                  <span className="text-[10px] font-mono text-blue-600 uppercase block mb-2 tracking-widest">Strategic Focus</span>
                  <p className="text-lg font-bold text-zinc-100 leading-snug">{phase.focus}</p>
                </div>
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-2xl">
                  <span className="text-[10px] font-mono text-blue-600 uppercase block mb-2 tracking-widest">Operating Environment</span>
                  <p className="text-lg font-bold text-zinc-100 leading-snug">{phase.environment}</p>
                </div>
              </div>

              {/* --- エピソードリスト（2列レイアウト） --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {phase.episodes?.map((ep) => (
                  <Link 
                    key={ep.ep} 
                    href={`/series/20-bto-fortress/${id}/episode/${ep.ep}`}
                    className="group relative flex items-center gap-6 p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-zinc-900/50 overflow-hidden"
                  >
                    {/* ホバー時の背景エフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white z-10">
                      <span className="font-mono text-lg font-black tabular-nums">{ep.ep}</span>
                    </div>
                    
                    <div className="flex-grow z-10">
                      <h4 className="text-[15px] font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase group-hover:text-blue-500 transition-colors">Analysis Log Available</span>
                        <ChevronRight size={10} className="text-zinc-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Amazon関連の特別バッジ */}
                    {ep.title.includes("Amazon") && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-full">
                        <ShoppingCart size={10} className="text-orange-500" />
                        <span className="text-[8px] font-mono text-orange-500/80">AMZ_REL</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

            </section>
          ))}
        </div>

        {/* --- フッターエリア --- */}
        <footer className="mt-60 text-center border-t border-white/10 pt-24 pb-12">
          <div className="inline-block px-4 py-2 bg-blue-600/5 border border-blue-500/10 rounded-full mb-8">
            <p className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase">
              Fortress Architecture V3.0 // Est. 1982
            </p>
          </div>
          <p className="text-zinc-600 font-mono text-xs max-w-md mx-auto leading-relaxed">
            44 years of expertise in hardware evolution. <br />
            Building the unshakeable foundation for Japan's future.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mt-12"></div>
        </footer>

      </div>
    </div>
  );
}