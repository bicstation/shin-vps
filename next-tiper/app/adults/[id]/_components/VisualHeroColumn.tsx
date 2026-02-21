/* /app/brand/[platform]/products/[id]/_components/VisualHeroColumn.tsx */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import MoviePlayerModal from '@shared/product/MoviePlayerModal';
import styles from '../ProductDetail.module.css';

export default function VisualHeroColumn({ product, source }) {
  const isFanza = source === 'FANZA' || source === 'DMM';
  
  // 🎥 動画URLの抽出
  // FANZAの場合は iframe 用の preview ページ、それ以外は direct リンクを想定
  const movieUrl = isFanza 
    ? product.sample_movie_url || product.movie_url // API側でiframe用URLが入っている想定
    : product.sample_url || product.movie_url;

  return (
    <section className={styles.visualHeroSection}>
      <div className={styles.visualGrid}>
        
        {/* 左側：メインジャケット & サンプル再生ポータル */}
        <div className="relative group">
          <div className={styles.jacketWrapper}>
            <div className={styles.scanline} />
            <div className={styles.cornerMarker} />
            <img 
              src={product.image_url_large || product.image_url} 
              alt={product.title} 
              className={styles.jacketImage}
            />
            <div className={styles.jacketOverlay} />
            <div className={styles.jacketLabel}>NEURAL_VISUAL_STREAM</div>
            
            {/* サンプル動画再生ボタン（ホバーで出現） */}
            {movieUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 bg-black/60 backdrop-blur-sm">
                <div className="mb-4 text-[#e94560] font-mono text-[10px] tracking-[0.5em] animate-pulse">
                  READY_TO_STREAM
                </div>
                <div className="transform scale-150">
                  <MoviePlayerModal 
                    videoUrl={movieUrl} 
                    title={product.title} 
                    isIframe={isFanza} // 🛠️ ここで iframe モードを切り替え
                  />
                </div>
                <div className="mt-8 px-4 py-1 border border-white/20 text-[9px] font-mono text-white/50 uppercase italic">
                  Source: {source} // Mode: {isFanza ? 'IFRAME_EMBED' : 'DIRECT_VIDEO'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側：AIサマリー ＆ 価格（Bottom Fixed） */}
        <div className="flex flex-col h-full min-h-[500px]">
          {/* AIサマリーカード */}
          <div className={styles.aiSummaryCard}>
            <div className={styles.aiLabel}>Expert AI_Report</div>
            <div className={styles.aiText}>
              <span className={styles.dropCap}>
                {product.ai_summary || 'No neural summary generated for this node.'}
              </span>
            </div>
            <div className={styles.aiReflection} />
            
            {/* 装飾用ステータスライン */}
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">Integrity</span>
                <span className="text-[10px] text-[#00d1b2] font-mono">STABLE_98%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">Scan_Type</span>
                <span className="text-[10px] text-pink-500 font-mono">DEEP_RECON</span>
              </div>
            </div>
          </div>

          {/* 価格表示セクション（カラムの最下部へ） */}
          <div className="mt-auto pt-10">
            <div className={styles.priceContainer}>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-[#e94560] tracking-[0.6em] uppercase">Market_Exchange_Rate</span>
                  <span className="text-[8px] text-zinc-600 font-mono">SECURE_PAYMENT_ENABLED</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-[#e94560] font-light italic">¥</span>
                  <span className="text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {typeof product.price === 'number' ? product.price.toLocaleString() : '---'}
                  </span>
                  <span className="ml-2 text-xs font-mono text-zinc-500 uppercase">incl_tax</span>
                </div>
              </div>
            </div>
            
            {/* クイックリンク・デコ */}
            <div className="mt-4 flex justify-end gap-2 opacity-30 group">
                <div className="h-1 w-20 bg-zinc-800 group-hover:bg-pink-500 transition-colors"></div>
                <div className="h-1 w-4 bg-zinc-800 group-hover:bg-pink-500 transition-colors"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}