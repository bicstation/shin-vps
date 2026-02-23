// -*- coding: utf-8 -*-
/**
 * AI Gold Ratio Style Ranking Page (v4.5 - Component Optimized)
 * Location: /app/ranking/style/page.tsx
 */

import React from 'react';
import styles from './StyleRanking.module.css';
import { SpecActressCard } from '@/shared/cards/SpecActressCard';

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
 * サーバーサイドデータフェッチ
 */
async function getStyleRanking(): Promise<{ data: Actress[]; debugInfo: any }> {
  const internalBaseUrl = process.env.API_INTERNAL_URL || "http://django-v2:8000/api";
  const endpoint = `${internalBaseUrl}/adult/taxonomy/?type=actresses&ordering=-profile__ai_power_score&limit=100`;

  let debugInfo = { 
    endpoint, 
    status: null as number | null, 
    statusText: "", 
    timestamp: new Date().toISOString(),
    count: 0, 
    error: null as string | null 
  };

  try {
    const res = await fetch(endpoint, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    debugInfo.status = res.status;
    debugInfo.statusText = res.statusText;

    if (!res.ok) {
      debugInfo.error = `HTTP Error: ${res.status}`;
      return { data: [], debugInfo };
    }

    const data = await res.json();
    debugInfo.count = data.results?.length || 0;
    return { data: data.results || [], debugInfo };
  } catch (error: any) {
    debugInfo.error = error.message;
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
        <strong>AI ANALYTICS SYSTEM DIAGNOSTIC</strong>
      </div>
      <div className={styles.debugGrid}>
        <div className={styles.debugItem}><span>Endpoint:</span> <code>{info.endpoint}</code></div>
        <div className={styles.debugItem}><span>Status:</span> {info.status} {info.statusText}</div>
        <div className={styles.debugItem}><span>Fetched:</span> {info.count} records</div>
      </div>
    </div>
  );
}

/**
 * 🏁 メインコンポーネント
 */
export default async function StyleRankingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isDebug = searchParams?.debug === 'true';
  const { data: actresses, debugInfo } = await getStyleRanking();

  return (
    <main className={styles.container}>
      {isDebug && <SystemDiagnosticHero info={debugInfo} />}

      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.aiBadge}>AI BIOMETRIC ANALYZER v4.5</div>
          <h1 className={styles.title}>黄金比スタイルランキング</h1>
          <div className={styles.titleLine}></div>
        </div>
        <p className={styles.description}>
          AIがB/W/H比率、骨格、曲線の連続性をディープラーニングで解析。<br />
          科学が証明する「見惚れるスタイル」の頂点を、詳細なパーソナルデータと共に公開。
        </p>
      </header>

      <div className={styles.rankingGrid}>
        {actresses.length > 0 ? (
          actresses.map((actress, index) => (
            <SpecActressCard 
              key={actress.id} 
              actress={actress} 
              rank={index + 1}
              priority={index < 4} // 上位4件は画像読み込みを優先
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