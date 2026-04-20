/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
// ✅ 正しいデータソースからインポート
import { BTO_GUIDE_DATA } from './data'; 

// ✅ 分離したCSSをインポート
import './series-index.css';

export const dynamic = 'force-static';

export default function SeriesIndexPage() {
  const phaseConfig = [
    { name: "Step 01: 自分にぴったりのPCを見つける（基礎編）", range: [1, 10], id: "BASIC" },
    { name: "Step 02: 性能を120%引き出す（応用編）", range: [11, 20], id: "ADVANCED" },
    { name: "Step 03: 家中をテクノロジーで繋ぐ（達人編）", range: [21, 30], id: "MASTER" },
  ];

  const safeData = Array.isArray(BTO_GUIDE_DATA) ? BTO_GUIDE_DATA : [];

  const getEyeCatchUrl = (vol: string | number) => {
    const volNum = typeof vol === 'string' ? parseInt(vol, 10) : vol;
    const phase = Math.ceil(volNum / 10) || 1;
    return `/images/series/01-hardware/eye-catch-${phase}.jpg`;
  };

  return (
    <div className="series-index-container selection:bg-emerald-500/30">
      
      <header className="index-hero">
        <div className="index-hero-glow" />
        <h1 className="index-title">
          一生モノのPC選び：<br className="md:hidden" />ゼロから始めるハードウェア構築
        </h1>
        <p className="relative text-gray-500 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
          「スペック表のどこを見ればいいの？」という基本から、家全体を快適なデジタル空間に変えるプロの技術まで。
          44年の経験を、誰にでもわかる言葉で綴ります。
        </p>
      </header>

      <div className="space-y-24">
        {phaseConfig.map((phase) => {
          const filteredItems = safeData.filter(d => {
            const v = typeof d.vol === 'string' ? parseInt(d.vol, 10) : d.vol;
            return v >= phase.range[0] && v <= phase.range[1];
          });

          return (
            <section key={phase.id} className="phase-section">
              <div className="phase-header">
                <h2 className="phase-title">
                  <span className="phase-indicator"></span>
                  {phase.name}
                </h2>
                <span className="text-zinc-600 font-mono text-xs mb-1 uppercase tracking-[0.3em]">
                  {phase.id}
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-12 px-8 border border-dashed border-zinc-800 rounded-3xl text-center">
                  <p className="text-zinc-600 font-mono italic text-sm">
                    {`// NODE_VOL_${phase.range[0]}-${phase.range[1]}: 現在解析中...`}
                  </p>
                </div>
              ) : (
                <div className="article-grid">
                  {filteredItems.map((item) => {
                    const linkVol = typeof item.vol === 'string' ? parseInt(item.vol, 10) : item.vol;
                    
                    return (
                      <Link 
                        key={item.vol} 
                        href={`/series/01-hardware/${linkVol}`} 
                        className="article-card"
                      >
                        <div className="card-image-box">
                          <img 
                            src={getEyeCatchUrl(item.vol)} 
                            alt=""
                            className="card-img"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                          <div className="card-vol-badge">
                            Vol.{item.vol}
                          </div>
                        </div>

                        <div className="p-8 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-zinc-100 hover:text-emerald-400 transition-colors mb-4 leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-6 font-light">
                              {item.description}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800/50">
                            {(item.tags || []).map(tag => (
                              <span key={tag} className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="mt-32 border-t border-zinc-900 pt-12 text-center text-zinc-700 text-xs font-mono tracking-widest">
        © 2026 SHIN-VPS / NEXT-BICSTATION. ALL SYSTEMS OPERATIONAL.
      </footer>
    </div>
  );
}