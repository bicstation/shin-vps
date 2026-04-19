'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Gamepad2, TrendingUp, Briefcase, Palette, 
  Bot, Beaker, Radio, ChevronRight, 
  Terminal, Activity, Database, Cpu,
  Wrench, Settings // 新しく追加
} from 'lucide-react';
import { BTO_SERIES_CONFIG } from './data';

/**
 * シリーズIDに基づいた動的テーマ設定
 * data.tsのIDと完全に一致させることで、デザインを自動適用します。
 */
const SERIES_THEMES: Record<string, any> = {
  build_logic: { icon: Wrench, color: 'text-cyan-500', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  operation_mastery: { icon: Settings, color: 'text-zinc-400', border: 'border-zinc-500/30', bg: 'bg-zinc-500/5' },
  gaming: { icon: Gamepad2, color: 'text-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  trading: { icon: TrendingUp, color: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  business: { icon: Briefcase, color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/5' },
  creative: { icon: Palette, color: 'text-purple-500', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
  ai_dev: { icon: Bot, color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  science: { icon: Beaker, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  streaming: { icon: Radio, color: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/5' },
};

// テーマが見つからない場合のフォールバック
const DEFAULT_THEME = { icon: Terminal, color: 'text-zinc-500', border: 'border-zinc-500/30', bg: 'bg-zinc-500/5' };

export default function BtoMastersRootPage() {
  // data.tsのBTO_SERIES_CONFIGから動的にキーを取得
  const seriesKeys = Object.keys(BTO_SERIES_CONFIG);

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-300 font-sans selection:bg-zinc-700 selection:text-white overflow-hidden">
      {/* 背景演出：グリッドと環境光 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,25,0),#020203)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        {/* システムヘッダー */}
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
              <Terminal size={20} className="text-zinc-500" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            <div className="text-[10px] font-mono text-zinc-600 tracking-[0.4em] uppercase">
              Auth: Administrator_Maya
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white italic tracking-tighter mb-6 leading-none uppercase">
            BTO Masters<br />
            <span className="text-zinc-700">Project.</span>
          </h1>

          <div className="max-w-2xl border-l-2 border-zinc-800 pl-8 mt-12">
            <p className="text-lg text-zinc-400 font-medium leading-relaxed">
              44年に及ぶ自作・BTOの知見を結集。
              演算機本体に予算を全振りし、環境を「後から」構築する、
              ストイックなまでの「マシン・ファースト」構築論。
            </p>
          </div>
        </header>

        {/* シリーズ選択グリッド：data.tsの定義数に合わせて動的に生成 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesKeys.map((key) => {
            const config = BTO_SERIES_CONFIG[key];
            const theme = SERIES_THEMES[key] || DEFAULT_THEME;
            const Icon = theme.icon;

            return (
              <Link 
                key={key} 
                href={`/series/10-bto-masters/${key}`}
                className={`group relative p-8 rounded-xl border ${theme.border} ${theme.bg} transition-all duration-500 hover:-translate-y-2 hover:bg-zinc-900/40`}
              >
                {/* アイコン装飾 */}
                <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity ${theme.color}`}>
                  <Icon size={40} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${theme.color.replace('text', 'bg')} animate-pulse`} />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      Class: {key}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform">
                    {config.title}
                  </h2>

                  <p className="text-sm text-zinc-500 leading-relaxed mb-8 h-12 line-clamp-2">
                    {config.concept}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase">
                      {/* data.tsの1つ目のフェーズ予算を表示 */}
                      Entry: <span className="text-zinc-400 font-bold">{config.phases[0].budget}</span>
                    </div>
                    <ChevronRight size={16} className={`${theme.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                  </div>
                </div>

                {/* 背景の巨大なインデックス文字 */}
                <div className="absolute -bottom-4 -left-2 text-9xl font-black italic text-white/[0.02] pointer-events-none group-hover:text-white/[0.04] transition-colors uppercase">
                  {key.charAt(0)}
                </div>
              </Link>
            );
          })}
        </div>

        {/* システムフッター */}
        <footer className="mt-32 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Database size={12} className="text-zinc-800" />
              <span>Total Series: {seriesKeys.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-zinc-800" />
              <span>Core: Maya_V3_Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="animate-pulse text-emerald-900" />
              <span>Status: Active</span>
            </div>
          </div>
          <div>
            © {new Date().getFullYear()} NEXT-BICSTATION ARCHIVE
          </div>
        </footer>
      </div>
    </div>
  );
}