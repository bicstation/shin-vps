// @ts-nocheck
export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

import { getAdultProductDetail } from '@shared/lib/api/django';
import SystemDiagnostic from '@shared/ui/SystemDiagnostic';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

// 分割された 3大カラム + 関連
import VisualHeroColumn from './_components/VisualHeroColumn';
import AnalysisColumn from './_components/AnalysisColumn';
import InfoColumn from './_components/InfoColumn';
import RelatedArchives from './RelatedArchives';

const getSafeScore = (val: any) => (typeof val === 'number' ? val : (parseInt(val) || 0));

export default async function ProductDetailPage(props: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string; debug?: string }>;
}) {
  /**
   * ✅ Next.js 15 Promise 解決
   */
  const { id: rawId } = await props.params;
  const { source: querySource, debug: debugParam } = await props.searchParams;
  
  const id = decodeURIComponent(rawId);
  const isDebugMode = debugParam === 'true';

  // 📡 API 呼び出し (最新エンドポイント: /api/adult/products/{id}/)
  const product = await getAdultProductDetail(id);

  /**
   * 🚨 404/Error Handling (SIGNAL_LOST)
   */
  if (!product || product._error || product.detail === "Not found.") {
    return (
      <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center relative overflow-hidden">
        {/* 背景のノイズ演出 */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
        
        <div className="z-10 flex flex-col items-center p-6 text-center">
          <h1 className="text-[#e94560] font-black text-6xl italic tracking-tighter animate-pulse shadow-pink-500/20">
            SIGNAL_LOST
          </h1>
          <div className="mt-6 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded backdrop-blur-sm">
            <p className="text-red-500 font-mono text-[10px] uppercase tracking-[0.2em]">
              Node_ID: {id} // Status: 404_NOT_FOUND
            </p>
          </div>
          
          {isDebugMode && (
            <div className="mt-4 text-left bg-black/60 p-4 rounded border border-white/5 font-mono text-[9px] text-gray-400 max-w-md overflow-auto">
              <p className="text-pink-500 mb-1">RAW_TRACE:</p>
              {JSON.stringify(product || { status: "null_response" }, null, 2)}
            </div>
          )}

          <Link 
            href="/adults" 
            className="mt-12 px-10 py-3 border border-[#e94560] text-[#e94560] font-mono hover:bg-[#e94560] hover:text-white transition-all duration-500 tracking-widest text-sm shadow-[0_0_15px_rgba(233,69,96,0.1)]"
          >
            « RETURN_TO_CORE_STREAM
          </Link>
        </div>
      </div>
    );
  }

  const source = (product.api_source || querySource || '').toUpperCase();
  const isFanza = source === 'FANZA' || source === 'DMM';

  // 統計データの整形
  const statsData = [
    { label: 'VISUAL', val: getSafeScore(product.score_visual), color: 'from-pink-500 to-rose-500' },
    { label: 'STORY', val: getSafeScore(product.score_story), color: 'from-blue-500 to-indigo-500' },
    { label: 'EROTIC', val: getSafeScore(product.score_erotic || product.score_acting), color: 'from-red-600 to-orange-500' },
    { label: 'RARITY', val: getSafeScore(product.score_rarity || product.score_direction), color: 'from-amber-400 to-yellow-500' },
    { label: 'COST', val: getSafeScore(product.score_cost || product.score_value), color: 'from-emerald-400 to-teal-500' }, 
  ];

  return (
    <div className={`${styles.wrapper} ${isFanza ? styles.fanzaTheme : ''}`}>
      
      {/**
       * 🛠️ DEBUG PANEL (?debug=true の時のみ表示)
       */}
      {isDebugMode && (
        <div className="w-full bg-pink-600 text-white text-[10px] font-mono py-1 px-4 flex justify-between items-center shadow-lg z-[9999] sticky top-0">
          <div className="flex gap-4">
            <span>[DEBUG_MODE: ACTIVE]</span>
            <span>NODE: {id}</span>
            <span>ENDPOINT: /api/adult/products/</span>
          </div>
          <div className="opacity-80">
            TRACED: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* 🛰️ SystemDiagnosticHero へのデータ注入 */}
      <SystemDiagnosticHero 
        id={id} 
        source={source} 
        data={product} 
        params={props.params}
        rawJson={product} 
      />

      <nav className={styles.nav}>
        <div className="max-w-[1440px] mx-auto px-[5%] flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
            <Link href="/adults" className={styles.backLink}>« EXPLORE_STREAM</Link>
            {isDebugMode && (
              <span className="text-pink-500 animate-pulse font-mono text-[10px] border border-pink-500/30 px-2 py-0.5 rounded">
                LIVE_DATA_INJECTED
              </span>
            )}
          </div>
          <div className={isFanza ? styles.sourceBadgeFanza : styles.sourceBadge}>{source}</div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        {/* 1. HERO SECTION (Visuals) */}
        <VisualHeroColumn product={product} source={source} />

        {/* 2. GRID CONTENT (Analysis & Info) */}
        <div className={styles.gridContent}>
          <AnalysisColumn 
            product={product} 
            radarData={statsData.map(s => ({ subject: s.label, A: s.val, fullMark: 100 }))} 
          />
          <InfoColumn 
            product={product} 
            statsData={statsData} 
            isFanza={isFanza} 
            source={source} 
          />
        </div>

        {/* 3. ASYNC SECTION (Related) */}
        <Suspense fallback={
          <div className="h-60 flex flex-col items-center justify-center font-mono text-gray-600 gap-3">
            <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-[10px] tracking-[0.3em] animate-pulse">RECONSTRUCTING_ARCHIVE...</span>
          </div>
        }>
          <RelatedArchives product={product} />
        </Suspense>

        {/* 下部の詳細デバッグパネル (URLパスをDjangoに合わせた) */}
        <SystemDiagnostic id={id} source={source} targetUrl={`/api/adult/products/${id}/`} data={product} />
      </main>
    </div>
  );
}