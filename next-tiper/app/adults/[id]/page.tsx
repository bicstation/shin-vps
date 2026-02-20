// @ts-nocheck
export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

import { getAdultProductDetail } from '@shared/lib/api/django/adult';
import SystemDiagnostic from '@shared/ui/SystemDiagnostic';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

// 分割された 3大カラム + 関連
import VisualHeroColumn from './_components/VisualHeroColumn';
import AnalysisColumn from './_components/AnalysisColumn';
import InfoColumn from './_components/InfoColumn';
import RelatedArchives from './RelatedArchives';

const getSafeScore = (val: any) => (typeof val === 'number' ? val : (parseInt(val) || 0));

/**
 * 💡 関連商品のデバッグ表示用ラッパー
 */
async function RelatedArchivesWithDebug({ product, isDebugMode }: { product: any, isDebugMode: boolean }) {
  return (
    <>
      <RelatedArchives product={product} />
      
      {/* 🛠️ 関連商品の RAW JSON デバッグ表示 (debug=true時のみ) */}
      {isDebugMode && (
        <div className="mt-20 p-6 bg-black/40 border border-blue-500/20 rounded-lg font-mono">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <h3 className="text-blue-500 text-[11px] tracking-widest uppercase">Debug: Related_Archives_Raw_Data</h3>
          </div>
          <div className={styles.debugCodeContainer}>
            <pre>
              {JSON.stringify({
                target_product_id: product.product_id_unique,
                actresses: product.actresses?.map(a => a.name) || [],
                note: "RelatedArchives内部で女優全員分の並列フェッチを実行中"
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

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

  // 📡 API 呼び出し
  const product = await getAdultProductDetail(id);

  /**
   * 🚨 404/Error Handling
   */
  if (!product || product._error || product.detail === "Not found.") {
    return (
      <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center relative overflow-hidden">
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
            <div className={styles.debugCodeContainer + " mt-4 max-w-md"}>
              <pre>{JSON.stringify(product || { status: "null_response" }, null, 2)}</pre>
            </div>
          )}
          <Link href="/adults" className="mt-12 px-10 py-3 border border-[#e94560] text-[#e94560] font-mono hover:bg-[#e94560] hover:text-white transition-all duration-500 tracking-widest text-sm">
            « RETURN_TO_CORE_STREAM
          </Link>
        </div>
      </div>
    );
  }

  const source = (product.api_source || querySource || '').toUpperCase();
  const isFanza = source === 'FANZA' || source === 'DMM';

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
       * 🛠️ DEBUG UI (debug=true 時のみ表示)
       */}
      {isDebugMode && (
        <>
          {/* 最上部ステータスバー */}
          <div className="w-full bg-pink-600 text-white text-[10px] font-mono py-1 px-4 flex justify-between items-center shadow-lg z-[9999] sticky top-0">
            <div className="flex gap-4">
              <span>[DEBUG_MODE: ACTIVE]</span>
              <span>NODE: {id}</span>
            </div>
            <div className="opacity-80">
              TRACED: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* 🛰️ 以前常時表示されていたパネルを here (isDebugMode) に移動 */}
          <SystemDiagnosticHero 
            id={id} 
            source={source} 
            data={product} 
            params={props.params}
            rawJson={product} 
          />
        </>
      )}

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
        <VisualHeroColumn product={product} source={source} />

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

        <Suspense fallback={
          <div className="h-60 flex flex-col items-center justify-center font-mono text-gray-600 gap-3">
            <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-[10px] tracking-[0.3em] animate-pulse">RECONSTRUCTING_ARCHIVE...</span>
          </div>
        }>
          <RelatedArchivesWithDebug product={product} isDebugMode={isDebugMode} />
        </Suspense>

        {/* 下部診断パネルも debug=true の時のみ表示するように変更 */}
        {isDebugMode && (
          <SystemDiagnostic 
            id={id} 
            source={source} 
            targetUrl={`/api/adult/products/${id}/`} 
            data={product} 
          />
        )}
      </main>
    </div>
  );
}