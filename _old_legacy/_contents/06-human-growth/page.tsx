/* eslint-disable @next/next/no-img-element */
/**
 * 🚀 エンジニアへの道・終章 (Series Index)
 * 🛡️ Maya's Logic: Professional Path Layer V1.1
 */

import React from 'react';
import Link from 'next/link';
import { CAREER_GUIDE_DATA } from './data';

export const dynamic = 'force-static';

export default function CareerSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];
  const safeData = CAREER_GUIDE_DATA || [];

  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil((vol - 150) / 10);
    return `/images/series/06-career/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-black min-h-screen text-white">
      {/* ヒーローセクション */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-200 to-gray-400 mb-6 tracking-tighter">
          エンジニアへの道<br className="hidden md:block" />
          終章：プロフェッショナルの覚醒
        </h1>
        <p className="relative text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          AIを使いこなし、価値を創出する「選ばれるエンジニア」へ。<br className="hidden md:block" />
          全180講の集大成。技術、ビジネス、そしてAIデバッグという新領域を統合する最終戦略。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            <div className="sticky top-0 bg-black/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-gray-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-gray-400 to-gray-600 mr-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"></span>
                {phase === "初級編" ? "マインドセットと学習の継続" : 
                 phase === "中級編" ? "実戦投入とAIデバッグの技術" : 
                 "キャリア戦略と未来の展望"}
              </h2>
              <span className="text-gray-500 font-mono text-sm mb-1 uppercase tracking-widest hidden sm:block">
                Career_Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => (
                  <Link 
                    key={item.vol} 
                    href={`/series/06-career/${item.vol}`} 
                    className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-white/50 transition-all duration-500 shadow-xl flex flex-col h-full"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
                      <img 
                        src={getEyeCatchUrl(item.vol)} 
                        alt=""
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-mono font-bold bg-white text-black px-2 py-0.5 rounded shadow-lg">
                          VOL.{String(item.vol).padStart(3, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors mb-3 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-gray-500 border border-gray-800 px-2 py-0.5 rounded">
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

      <footer className="mt-32 border-t border-gray-800 pt-10 text-center text-gray-600 text-sm">
        <p>© 2026 SHIN-VPS & BICSTATION. All 180 Lectures Completed.</p>
      </footer>
    </div>
  );
}