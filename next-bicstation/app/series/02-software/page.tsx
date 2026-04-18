/* eslint-disable @next/next/no-img-element */
/**
 * 💻 PC活用・コンテンツ制作 統合ガイド (Series Index)
 * 🛡️ Maya's Logic: Creator Workflow Edition V12.5
 */

import React from 'react';
import Link from 'next/link';
import { SOFTWARE_GUIDE_DATA } from './data';

export const dynamic = 'force-static';

export default function SoftwareSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];
  const safeData = SOFTWARE_GUIDE_DATA || [];

  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/02-software/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-gray-900 min-h-screen text-gray-100">
      {/* ヒーローセクション */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 mb-6 tracking-tighter">
          PC活用・コンテンツ制作<br className="hidden md:block" />
          徹底ロードマップ
        </h1>
        <p className="relative text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          最強のハードウェアを、最強の表現力へ。OSの最適化から、ブログ執筆、<br className="hidden md:block" />
          そしてYouTubeでの動画発信まで。価値を創造し、世界へ届けるための全30講。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            {/* フェーズ見出し */}
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-gray-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-purple-500 to-violet-600 mr-4 rounded-full shadow-[0_0_15px_rgba(167,139,250,0.5)]"></span>
                {phase === "初級編" ? "OS・基盤環境の最適化" : 
                 phase === "中級編" ? "効率的な執筆と素材制作" : 
                 "動画編集とYouTube発信術"}
              </h2>
              <span className="text-gray-500 font-mono text-sm mb-1 uppercase tracking-widest hidden sm:block">
                Software_Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
              </span>
            </div>

            {/* 記事グリッド */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => (
                  <Link 
                    key={item.vol} 
                    href={`/series/02-software/${item.vol}`} 
                    className="group relative overflow-hidden bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-purple-500/50 transition-all duration-500 shadow-xl flex flex-col h-full"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-gray-800">
                      <img 
                        src={getEyeCatchUrl(item.vol)} 
                        alt=""
                        className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-mono font-bold bg-purple-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          VOL.{String(item.vol).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
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
        <p>© 2026 SHIN-VPS & BICSTATION. Logical Design by Maya.</p>
      </footer>
    </div>
  );
}