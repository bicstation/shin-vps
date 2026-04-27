'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Terminal, Activity, Database, Cpu, ChevronRight,
  ShieldCheck, Landmark, School, Factory, 
  Truck, Stethoscope, Microscope, Building2, ShoppingCart
} from 'lucide-react';
import { BTO_FORTRESS_CONFIG } from './data';

/**
 * 20-BTO-FORTRESS 専用テーマ設定
 * 9大要塞の個性に合わせたカラーとアイコンの定義
 */
const SERIES_THEMES: Record<string, any> = {
  finance: { icon: Landmark, color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  public: { icon: ShieldCheck, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  education: { icon: School, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  industry: { icon: Factory, color: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/5' },
  logistics: { icon: Truck, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  medical: { icon: Stethoscope, color: 'text-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
  research: { icon: Microscope, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/5' },
  enterprise: { icon: Building2, color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/5' },
  commerce: { icon: ShoppingCart, color: 'text-lime-400', border: 'border-lime-500/30', bg: 'bg-lime-500/5' },
};

const DEFAULT_THEME = { icon: Terminal, color: 'text-zinc-500', border: 'border-zinc-500/30', bg: 'bg-zinc-500/5' };

export default function BtoFortressRootPage() {
  // BTO_FORTRESS_CONFIG から全9業種のキーを取得
  const seriesKeys = Object.keys(BTO_FORTRESS_CONFIG);

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-300 font-sans selection:bg-zinc-700 selection:text-white overflow-hidden">
      {/* 背景演出 */}
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
              System_Archive: BTO_FORTRESS_v20
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-6 leading-none uppercase">
            BTO FORTRESS<br />
            <span className="text-zinc-800">INFRASTRUCTURE.</span>
          </h1>

          <div className="max-w-3xl border-l-2 border-zinc-800 pl-8 mt-12">
            <p className="text-xl text-zinc-400 font-medium leading-relaxed">
              44年の叡智が導き出す、日本再起動のための演算基盤。<br />
              一秒の停滞、一円の誤差、情報の漏洩を許さない<br />
              <span className="text-white">「不沈の要塞」</span>を、BTOとAmazonの兵站で構築する。
            </p>
          </div>
        </header>

        {/* 要塞選択グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesKeys.map((key) => {
            const config = BTO_FORTRESS_CONFIG[key];
            const theme = SERIES_THEMES[key] || DEFAULT_THEME;
            const Icon = theme.icon;

            return (
              <Link 
                key={key} 
                href={`/series/20-bto-fortress/${key}`}
                className={`group relative p-8 rounded-xl border ${theme.border} ${theme.bg} transition-all duration-500 hover:-translate-y-2 hover:bg-zinc-900/40`}
              >
                {/* アイコン装飾 */}
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity ${theme.color}`}>
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${theme.color.replace('text', 'bg')} animate-pulse`} />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      Sector: {key}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform leading-tight">
                    {config.title}
                  </h2>

                  <p className="text-sm text-zinc-500 leading-relaxed mb-8 h-12 line-clamp-2">
                    {config.concept}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase">
                      Min_Investment: <span className="text-zinc-300 font-bold">{config.phases[0].budget}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                      ENTER <ChevronRight size={14} className={theme.color} />
                    </div>
                  </div>
                </div>

                {/* 背景の巨大インデックス */}
                <div className="absolute -bottom-4 -left-2 text-9xl font-black italic text-white/[0.02] pointer-events-none group-hover:text-white/[0.03] transition-colors uppercase">
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
              <span>Sectors: {seriesKeys.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-zinc-800" />
              <span>Engine: BTO_Fortress_AI_V4</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="animate-pulse text-emerald-900" />
              <span>Status: All_Systems_Go</span>
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