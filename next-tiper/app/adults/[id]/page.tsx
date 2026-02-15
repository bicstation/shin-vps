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

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAdultProductDetail(id);

  // 404/Error Handling
  if (!product || product._error) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center">
        <h1 className="text-[#e94560] font-black text-4xl italic">SIGNAL_LOST</h1>
        <p className="text-gray-500 font-mono mt-4 uppercase">Content Not Found</p>
        <Link href="/adults" className="mt-10 px-6 py-2 border border-[#e94560] text-[#e94560]">« BACK_TO_STREAM</Link>
      </div>
    );
  }

  const source = (product.api_source || '').toUpperCase();
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
      {/* 🛰️ SystemDiagnosticHero へのデータ注入
          受け手側の propsに合わせて data={product} を渡すことで JSON表示を有効化 
      */}
      <SystemDiagnosticHero 
        id={id} 
        source={source} 
        data={product} 
        params={params}
      />

      <nav className={styles.nav}>
        <div className="max-w-[1440px] mx-auto px-[5%] flex justify-between items-center w-full">
          <Link href="/adults" className={styles.backLink}>« EXPLORE_STREAM</Link>
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
        <Suspense fallback={<div className="h-60 flex items-center justify-center font-mono text-gray-800 animate-pulse">ESTABLISHING_RELATED_STREAM...</div>}>
          <RelatedArchives product={product} />
        </Suspense>

        {/* 下部の詳細デバッグパネル */}
        <SystemDiagnostic id={id} source={source} targetUrl={`/api/adults/${id}`} data={product} />
      </main>
    </div>
  );
}