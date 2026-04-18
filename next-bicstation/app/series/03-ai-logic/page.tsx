/* eslint-disable @next/next/no-img-element */
/**
 * 🤖 人工知能・知的自動化・加速するAIライフ (Series Index)
 * 🛡️ Maya's Logic: AI Intelligence Layer V1.2
 */

import React from 'react';
import Link from 'next/link';
import { AI_GUIDE_DATA } from './data';

export const dynamic = 'force-static';

export default function AISeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];
  const safeData = AI_GUIDE_DATA || [];

  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/03-ai/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-slate-950 min-h-screen text-slate-100">
      {/* ヒーローセクション */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 mb-6 tracking-tighter">
          人工知能・知的自動化<br className="hidden md:block" />
          完全攻略ガイド
        </h1>
        <p className="relative text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Copilotによる日常の劇的加速から、自前GPUを駆使したローカルLLMの構築まで。<br className="hidden md:block" />
          進化し続けるAIを「消費」するのではなく、自らの「知能」として統合するための全30講。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            {/* フェーズ見出し */}
            <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-slate-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-cyan-600 mr-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                {phase === "初級編" ? "CopilotとAI対話の基礎" : 
                 phase === "中級編" ? "GPU活用とローカルLLM" : 
                 "Python解析と知的自動化"}
              </h2>
              <span className="text-slate-500 font-mono text-sm mb-1 uppercase tracking-widest hidden sm:block">
                AI_Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
              </span>
            </div>

            {/* 記事グリッド */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => (
                  <Link 
                    key={item.vol} 
                    href={`/series/03-ai-logic/${item.vol}`} 
                    className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all duration-500 shadow-xl flex flex-col h-full"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={getEyeCatchUrl(item.vol)} 
                        alt=""
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-mono font-bold bg-emerald-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          VOL.{String(item.vol).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-32 border-t border-slate-800 pt-10 text-center text-slate-600 text-sm">
        <p>© 2026 SHIN-VPS & BICSTATION. Logical AI Design by Maya.</p>
      </footer>
    </div>
  );
}