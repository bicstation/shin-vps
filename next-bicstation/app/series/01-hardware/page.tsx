/* eslint-disable @next/next/no-img-element */
/**
 * 💻 BTOパソコン選定・統合ガイド (Series Index)
 * 🛡️ Maya's Logic: Series Orchestration V12.1
 * 物理パス: app/series/bto-guide/page.tsx
 * 修正内容: 空配列ガードの追加 & Next.js 15 準拠の最適化
 */

import React from 'react';
import Link from 'next/link';
// データ実体 (BTO_GUIDE_DATA が export されている前提)
import { BTO_GUIDE_DATA } from './data';

export const dynamic = 'force-static'; // インデックスページは静的生成で高速化

export default function SeriesIndexPage() {
  const phases = ["初級編", "中級編", "上級編"];

  // ✅ 安全装置: データが存在しない場合に備える
  const safeData = BTO_GUIDE_DATA || [];

  // アイキャッチURLを決定するヘルパー関数
  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    // 画像が存在しない場合のフォールバックを考慮
    return `/images/series/bto-guide/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-gray-900 min-h-screen text-gray-100">
      {/* ヒーローセクション */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 mb-6 tracking-tighter">
          BTOパソコン選定・統合ガイド
        </h1>
        <p className="relative text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          単なるPC選びで終わらせない。デバイス、車、ネットワーク、そして住まいを一つのシステムへと統合する全30回の技術録。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            {/* フェーズ見出し */}
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-gray-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 mr-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
                {phase}
              </h2>
              <span className="text-gray-500 font-mono text-sm mb-1 uppercase tracking-widest">
                Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
              </span>
            </div>

            {/* 記事グリッド - filter 前に safeData を使用 */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => {
                  const eyeCatch = getEyeCatchUrl(item.vol);
                  
                  return (
                    <Link 
                      key={item.vol} 
                      href={`/series/bto-guide/${item.vol}`} 
                      className="group relative overflow-hidden bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/10 flex flex-col h-full"
                    >
                      {/* カード内アイキャッチ画像 */}
                      <div className="relative h-32 w-full overflow-hidden">
                        <img 
                          src={eyeCatch} 
                          alt={item.title}
                          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/no-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="text-[10px] font-mono font-bold bg-blue-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                            VOL.{String(item.vol).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* コンテンツエリア */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors mb-3 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* タグ表示 */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(item.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 装飾用の矢印 */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
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