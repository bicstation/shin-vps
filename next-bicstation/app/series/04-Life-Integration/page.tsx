/* eslint-disable @next/next/no-img-element */
/**
 * 🏠 生活・空間・システム統合ガイド (Series Index)
 * 🛡️ Maya's Logic: Physical Integration Layer V12.1
 * 物理パス: app/series/04-life-integration/page.tsx
 * 修正内容: 最終章（生活統合）の構築 & ビルドエラー防止ガード実装
 */

import React from 'react';
import Link from 'next/link';
// データ実体 (LIFE_INTEGRATION_DATA が export されている前提)
import { LIFE_INTEGRATION_DATA } from './data';

export const dynamic = 'force-static';

export default function LifeIntegrationSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];

  // ✅ 安全装置: データが存在しない場合に備える
  const safeData = LIFE_INTEGRATION_DATA || [];

  // アイキャッチURLを決定するヘルパー関数
  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/04-life-integration/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-gray-900 min-h-screen text-gray-100">
      {/* ヒーローセクション - サンセット・オレンジやゴールド系の温かみと先進性の融合 */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 mb-6 tracking-tighter">
          生活・空間・システム統合ガイド
        </h1>
        <p className="relative text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          システムを「現実」へ解き放つ。スマートホーム、EV連携、モバイル同期を通じて、デジタルとアナログが融合した究極の快適環境を構築。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            {/* フェーズ見出し - オレンジ・アンバー系のアクセント */}
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-gray-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-orange-500 to-amber-600 mr-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>
                {phase}
              </h2>
              <span className="text-gray-500 font-mono text-sm mb-1 uppercase tracking-widest">
                Life_Sync_Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
              </span>
            </div>

            {/* 記事グリッド */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {safeData
                .filter(d => d.category === phase)
                .map((item) => {
                  const eyeCatch = getEyeCatchUrl(item.vol);
                  
                  return (
                    <Link 
                      key={item.vol} 
                      href={`/series/04-life-integration/${item.vol}`} 
                      className="group relative overflow-hidden bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-orange-500/50 transition-all duration-500 shadow-xl hover:shadow-orange-500/10 flex flex-col h-full"
                    >
                      {/* カード内アイキャッチ画像 */}
                      <div className="relative h-32 w-full overflow-hidden">
                        <img 
                          src={eyeCatch} 
                          alt={item.title}
                          className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/no-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="text-[10px] font-mono font-bold bg-orange-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                            VOL.{String(item.vol).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* コンテンツエリア */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-100 group-hover:text-orange-400 transition-colors mb-3 leading-snug">
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
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
            </div>
            
            {/* ゼロ件時のフォールバック */}
            {safeData.filter(d => d.category === phase).length === 0 && (
              <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-gray-600">Physical Integration in progress... Coming soon.</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-32 border-t border-gray-800 pt-10 text-center text-gray-600 text-sm">
        <p>© 2026 SHIN-VPS & BICSTATION. Logical Design by Maya.</p>
      </footer>
    </div>
  );
}