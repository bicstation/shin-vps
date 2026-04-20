'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Terminal, Activity, Database, Cpu, ChevronRight,
  ShieldCheck, Laptop, Brain, Smartphone, 
  Code2, Briefcase, Zap
} from 'lucide-react';
// data.ts から GUIDE_DATA (GUIDE_STRUCTUREのエイリアス) をインポート
import { GUIDE_DATA } from './data'; 

/**
 * 6大要塞の個性に合わせたカラーとアイコンの定義
 */
const SERIES_THEMES: Record<string, any> = {
  bto: { icon: Cpu, color: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/5' },
  software: { icon: Laptop, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  ai: { icon: Brain, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  lifestyle: { icon: Smartphone, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
  dev: { icon: Code2, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/5' },
  career: { icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
};

const DEFAULT_THEME = { icon: Terminal, color: 'text-zinc-500', border: 'border-zinc-500/30', bg: 'bg-zinc-500/5' };

export default function BtoFortressRootPage() {
  // GUIDE_DATA が undefined の場合に備えて安全にキーを取得
  const seriesKeys = GUIDE_DATA ? Object.keys(GUIDE_DATA) : [];

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-300 font-sans selection:bg-zinc-700 selection:text-white overflow-hidden">
      {/* 背景演出：グリッドとグラデーション */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,10,15,0),#020203)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        {/* システムヘッダー */}
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
              <ShieldCheck size={20} className="text-zinc-500" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            <div className="text-[10px] font-mono text-zinc-600 tracking-[0.4em] uppercase">
              System_Archive: THE_180_LOGS_v1.0
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-6 leading-none uppercase">
            MASTER ARCHIVE<br />
            <span className="text-zinc-800">180_CHAPTERS.</span>
          </h1>

          <div className="max-w-3xl border-l-2 border-zinc-800 pl-8 mt-12">
            <p className="text-xl text-zinc-400 font-medium leading-relaxed">
              44年の叡智を、6つのセクター、180の講義に完全構造化。<br />
              物理基盤からAI、開発、そして人生戦略まで。<br />
              <span className="text-white">「知の要塞」</span>を、あなたの脳内と作業空間にビルドせよ。
            </p>
          </div>
        </header>

        {/* 要塞選択グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesKeys.map((key) => {
            const config = (GUIDE_DATA as any)[key];
            const theme = SERIES_THEMES[key] || DEFAULT_THEME;
            const Icon = theme.icon;

            // タイトル分割ロジック（例: "物理要塞：1円あたりの..." -> "物理要塞" と "1円あたりの..."）
            const displayTitle = config.title?.includes('：') 
              ? config.title.split('：')[0] 
              : (config.title || key.toUpperCase());
            
            const subTitle = config.title?.includes('：') 
              ? config.title.split('：')[1] 
              : '';

            return (
              <Link 
                key={key} 
                href={`/series/00-master-log/${key}`}
                className={`group relative p-8 rounded-xl border ${theme.border} ${theme.bg} transition-all duration-500 hover:-translate-y-2 hover:bg-zinc-900/40`}
              >
                {/* アイコン装飾（背景に透かし） */}
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity ${theme.color}`}>
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${theme.color.replace('text', 'bg')} animate-pulse`} />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      Sector: {key.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform leading-tight">
                    {displayTitle}
                    {subTitle && (
                      <span className={`block text-xs mt-1 font-normal opacity-60 ${theme.color}`}>
                        {subTitle}
                      </span>
                    )}
                  </h2>

                  <p className="text-sm text-zinc-500 leading-relaxed mb-8 h-12 line-clamp-2">
                    {config.concept}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase">
                      Start_Invest: <span className="text-zinc-300 font-bold">
                        {/* 予算表示の安全なパース */}
                        {config.phases?.[0]?.budget?.split('〜')[0] || 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                      ACCESS <ChevronRight size={14} className={theme.color} />
                    </div>
                  </div>
                </div>

                {/* 背景の巨大アルファベットインデックス */}
                <div className="absolute -bottom-4 -left-2 text-9xl font-black italic text-white/[0.02] pointer-events-none group-hover:text-white/[0.03] transition-colors uppercase">
                  {key.charAt(0)}
                </div>
              </Link>
            );
          })}
        </div>

        {/* システムフッター：ステータス表示 */}
        <footer className="mt-32 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Database size={12} className="text-zinc-800" />
              <span>Sectors: {seriesKeys.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-zinc-800" />
              <span>Total_Lessons: 180</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="animate-pulse text-emerald-900" />
              <span>System_Status: Optimal</span>
            </div>
          </div>
          <div className="text-zinc-700">
            © {new Date().getFullYear()} NEXT-BICSTATION ARCHIVE
          </div>
        </footer>
      </div>
    </div>
  );
}