/* eslint-disable @next/next/no-img-element */
/**
 * 🏠 住居・移動・モバイル統合ガイド (Series Index)
 * 🛡️ Maya's Logic: Physical Integration Layer V1.0
 */

import React from 'react';
import Link from 'next/link';
import { LIFESTYLE_GUIDE_DATA } from './data';

export const dynamic = 'force-static';

export default function LifestyleSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];
  const safeData = LIFESTYLE_GUIDE_DATA || [];

  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/04-lifestyle/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-stone-950 min-h-screen text-stone-100">
      {/* ヒーローセクション - 居住空間を感じさせる温かみのあるアンバー・ゴールド系 */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-500 mb-6 tracking-tighter">
          住居・車・スマホ<br className="hidden md:block" />
          物理ライフ統合ガイド
        </h1>
        <p className="relative text-stone-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          デジタルを「持ち歩き」、住居を「演算」させ、車を「電源」にする。<br className="hidden md:block" />
          テクノロジーが肉体と空間に溶け込む、次世代のライフスタイル構築術。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            <div className="sticky top-0 bg-stone-950/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-stone-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-orange-600 mr-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>
                {phase === "初級編" ? "スマホ・モバイルの再定義" : 
                 phase === "中級編" ? "スマートホームと空間OS" : 
                 "EV・V2Hとエネルギーの自給"}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => (
                  <Link 
                    key={item.vol} 
                    href={`/series/04-Life-Integration/${item.vol}`} 
                    className="group relative overflow-hidden bg-stone-900/40 border border-stone-800 rounded-2xl hover:border-amber-500/50 transition-all duration-500 shadow-xl flex flex-col h-full"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-stone-900">
                      <img 
                        src={getEyeCatchUrl(item.vol)} 
                        alt=""
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-mono font-bold bg-amber-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          VOL.{String(item.vol).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-stone-100 group-hover:text-amber-400 transition-colors mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-stone-500 border border-stone-800 px-2 py-0.5 rounded">
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

      <footer className="mt-32 border-t border-stone-800 pt-10 text-center text-stone-600 text-sm">
        <p>© 2026 SHIN-VPS & BICSTATION. Logical Lifestyle Design by Maya.</p>
      </footer>
    </div>
  );
}