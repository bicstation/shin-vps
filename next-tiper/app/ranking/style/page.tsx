// -*- coding: utf-8 -*-
/**
 * AI Gold Ratio Style Ranking Page (v4.6 - Performance Optimized)
 * Location: /app/ranking/style/page.tsx
 */

import React from 'react';
import styles from './StyleRanking.module.css';
import { SpecActressCard } from '@/shared/cards/SpecActressCard';

// 💡 ISR: 1時間キャッシュ（バックグラウンドで更新し、ユーザーには常に高速なページを返す）
// export const revalidate = 3600; 
export const revalidate = 600; 

/**
 * 💡 バックエンド構造準拠インターフェース
 */
interface Actress {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  api_source: string;
  image_url_large: string | null;
  image_url_small: string | null;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  cup: string | null;
  height: number | null;
  birthday: string | null;
  blood_type: string | null;
  prefectures: string | null;
  hobby: string | null;
  ai_power_score: number | null;
  score_visual: number | null;
  score_style: number | null;
  score_performance: number | null;
  score_popularity: number | null;
}

/**
 * サーバーサイドデータフェッチ (フィルタリング最適化版)
 */
async function getStyleRanking(): Promise<{ data: Actress[]; debugInfo: any }> {
  const internalBaseUrl = process.env.API_INTERNAL_URL || "http://django-v3:8000/api";
  
  /**
   * 💡 修正のポイント:
   * 1. profile__isnull=false : プロフィール情報が存在する女優のみ
   * 2. profile__bust__gt=0  : バストデータが0より大きい（実数がある）ものに限定
   * 3. limit=50 : 100件から50件に絞ることで、最初の通信量を半分にし、描画を高速化
   */
  const params = new URLSearchParams({
    type: 'actresses',
    profile__isnull: 'false',
    profile__bust__gt: '0',
    ordering: '-profile__ai_power_score',
    limit: '50' 
  });

  const endpoint = `${internalBaseUrl}/adult/taxonomy/?${params.toString()}`;

  let debugInfo = { 
    endpoint, 
    status: null as number | null, 
    statusText: "", 
    timestamp: new Date().toISOString(),
    count: 0, 
    error: null as string | null,
    duration: 0
  };

  const startTime = Date.now();

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 }, 
      headers: { 'Accept': 'application/json' }
    });

    debugInfo.status = res.status;
    debugInfo.statusText = res.statusText;
    debugInfo.duration = Date.now() - startTime;

    if (!res.ok) {
      debugInfo.error = `HTTP Error: ${res.status}`;
      return { data: [], debugInfo };
    }

    const data = await res.json();
    debugInfo.count = data.results?.length || 0;
    return { data: data.results || [], debugInfo };
  } catch (error: any) {
    debugInfo.error = error.message;
    debugInfo.duration = Date.now() - startTime;
    return { data: [], debugInfo };
  }
}

/**
 * 🛠️ システム診断（デバッグ用）
 */
function SystemDiagnosticHero({ info }: { info: any }) {
  return (
    <div className={styles.debugBox}>
      <div className={styles.debugHeader}>
        <span className={styles.debugPulse}></span>
        <strong>AI ANALYTICS SYSTEM DIAGNOSTIC (v4.6)</strong>
      </div>
      <div className={styles.debugGrid}>
        <div className={styles.debugItem}><span>API Time:</span> {info.duration}ms</div>
        <div className={styles.debugItem}><span>Status:</span> {info.status}</div>
        <div className={styles.debugItem}><span>Count:</span> {info.count} effective records</div>
      </div>
      <div className={styles.debugEndpoint}><code>{info.endpoint}</code></div>
    </div>
  );
}

/**
 * 🏁 メインコンポーネント
 */
export default async function StyleRankingPage(props: {
  searchParams: Promise<{ debug?: string }>;
}) {
  // Next.js 15+ 準拠のparams解決
  const searchParams = await props.searchParams;
  const isDebug = searchParams?.debug === 'true';
  
  // データの取得（フィルタリング済み）
  const { data: actresses, debugInfo } = await getStyleRanking();

  return (
    <main className={styles.container}>
      {isDebug && <SystemDiagnosticHero info={debugInfo} />}

      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.aiBadge}>AI BIOMETRIC ANALYZER v4.6</div>
          <h1 className={styles.title}>黄金比スタイルランキング</h1>
          <div className={styles.titleLine}></div>
        </div>
        <p className={styles.description}>
          AIがB/W/H比率、骨格、曲線の連続性をディープラーニングで解析。<br />
          データが確認されたキャストの中から、科学が証明する「見惚れるスタイル」の頂点を公開。
        </p>
      </header>

      <div className={styles.rankingGrid}>
        {actresses.length > 0 ? (
          actresses.map((actress, index) => (
            <SpecActressCard 
              key={`${actress.id}`} 
              actress={actress} 
              rank={index + 1}
              // 上位はLCP向上のため優先読み込み
              priority={index < 4} 
            />
          ))
        ) : (
          <div className={styles.noData}>
            <div className={styles.loadingSpinner}></div>
            <p>DATABASE LINKING...</p>
          </div>
        )}
      </div>
    </main>
  );
}