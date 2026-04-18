/* eslint-disable @next/next/no-img-element */
/**
 * 🛠️ モダン開発・サイト構築の裏側 (Series Index)
 * 🛡️ Maya's Logic: Development Layer V1.0
 */

import React from 'react';
import Link from 'next/link';
import { DEV_GUIDE_DATA } from './data';

export const dynamic = 'force-static';

export default function DevelopmentSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];
  const safeData = DEV_GUIDE_DATA || [];

  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/05-dev/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-zinc-950 min-h-screen text-zinc-100">
      {/* ヒーローセクション - コードの深淵を感じるインディゴ・バイオレット系 */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 mb-6 tracking-tighter">
          Python + Next.js<br className="hidden md:block" />
          サイト構築の裏側と開発術
        </h1>
        <p className="relative text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          このサイトはどう作られているのか？<br className="hidden md:block" />
          Pythonによる知能とNext.jsによる表現を融合させ、独自のプラットフォームをゼロから生み出す。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-zinc-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-indigo-500 to-blue-600 mr-4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
                {phase === "初級編" ? "開発環境とNext.jsの基礎" : 
                 phase === "中級編" ? "PythonロジックとAI連携" : 
                 "サイトの実装暴露とデプロイ"}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => (
                  <Link 
                    key={item.vol} 
                    href={`/series/05-development/${item.vol}`} 
                    className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-all duration-500 shadow-xl flex flex-col h-full"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono font-bold bg-indigo-600/80 text-white px-2 py-0.5 rounded">
                          VOL.{String(item.vol).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors mb-3 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
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

      <footer className="mt-32 border-t border-zinc-800 pt-10 text-center text-zinc-600 text-sm">
        <p>© 2026 SHIN-VPS & BICSTATION. Logical Architecture by Maya.</p>
      </footer>
    </div>
  );
}