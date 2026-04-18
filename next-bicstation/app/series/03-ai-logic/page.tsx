// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/03-ai-logic/page.tsx

/* eslint-disable @next/next/no-img-element */
/**
 * 💻 AI & 論理統合ガイド (Series Index)
 * 🛡️ Maya's Logic: AI Integration Layer V12.1
 * 物理パス: app/series/03-ai-logic/page.tsx
 * 修正内容: シリーズ最終章の構築 & ヌルポインタ参照防止の徹底
 */

import React from 'react';
import Link from 'next/link';
// データ実体 (AI_LOGIC_DATA が export されている前提)
import { AI_LOGIC_DATA } from './data';

export const dynamic = 'force-static';

export default function AiLogicSeriesPage() {
  const phases = ["初級編", "中級編", "上級編"];

  // ✅ 安全装置: データが存在しない場合に備える
  const safeData = AI_LOGIC_DATA || [];

  // アイキャッチURLを決定するヘルパー関数
  const getEyeCatchUrl = (vol: number) => {
    const phase = Math.ceil(vol / 10);
    return `/images/series/03-ai-logic/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 bg-gray-900 min-h-screen text-gray-100">
      {/* ヒーローセクション - エメラルド・シアン系のサイバーなグラデーション */}
      <header className="mb-20 text-center relative py-10">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
        <h1 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 mb-6 tracking-tighter">
          AI & 論理統合ガイド
        </h1>
        <p className="relative text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          システムに「意志」を宿す。ローカルLLMの構築から、自動化ロジック、そしてAIと共生する次世代のライフスタイルを定義。
        </p>
      </header>

      <div className="space-y-24">
        {phases.map((phase) => (
          <section key={phase} className="relative">
            {/* フェーズ見出し - エメラルド系のアクセント */}
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md py-6 z-20 mb-10 border-b border-gray-800 flex items-end justify-between">
              <h2 className="text-3xl font-bold flex items-center tracking-tight">
                <span className="w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-cyan-600 mr-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                {phase}
              </h2>
              <span className="text-gray-500 font-mono text-sm mb-1 uppercase tracking-widest">
                AI_Logic_Phase_{phase === "初級編" ? "01" : phase === "中級編" ? "02" : "03"}
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
                      href={`/series/03-ai-logic/${item.vol}`} 
                      className="group relative overflow-hidden bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-emerald-500/50 transition-all duration-500 shadow-xl hover:shadow-emerald-500/10 flex flex-col h-full"
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
                          <span className="text-[10px] font-mono font-bold bg-emerald-600/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                            VOL.{String(item.vol).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* コンテンツエリア */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-100 group-hover:text-emerald-400 transition-colors mb-3 leading-snug">
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
                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-gray-600">Logical Integration Process... Standby.</p>
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