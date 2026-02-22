// -*- coding: utf-8 -*-
// components/StyleRankingPage.tsx (Next.js App Router)

import React from 'react';
import Image from 'next/image';
import styles from './StyleRanking.module.css';

/**
 * 💡 バックエンド (Django) の修正済みシリアライザーに合わせたインターフェース
 */
interface Actress {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  api_source: string;
  // 追加された詳細メタデータ
  image_url_large: string | null;
  image_url_small: string | null;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  cup: string;
  height: number | null;
  // AI 5軸スコア
  ai_power_score: number | null;
  score_visual: number | null;
  score_style: number | null;
  score_performance: number | null;
  score_popularity: number | null;
}

/**
 * スコア数値をランク称号に変換
 */
const getRankLabel = (score: number | null): string => {
  if (!score) return "---";
  if (score >= 95) return "👑 GOD";
  if (score >= 90) return "💎 S-Rank";
  if (score >= 80) return "✨ A-Rank";
  if (score >= 70) return "B-Rank";
  return "C-Rank";
};

/**
 * AIランキングデータをサーバーサイドで取得
 */
async function getStyleRanking(): Promise<{ data: Actress[]; debugInfo: any }> {
  // 内部ネットワーク用URL（dockerなど）
  const internalBaseUrl = process.env.API_INTERNAL_URL || "http://django-v2:8000/api";
  const endpoint = `${internalBaseUrl}/adult/taxonomy/?type=actresses&ordering=-profile__ai_power_score&limit=100`;

  let debugInfo = { endpoint, status: null as number | null, statusText: "", count: 0, error: null as string | null };

  try {
    const res = await fetch(endpoint, {
      cache: 'no-store', // 常に最新のランキングを取得
      headers: { 'Content-Type': 'application/json' }
    });

    debugInfo.status = res.status;
    debugInfo.statusText = res.statusText;

    if (!res.ok) {
      debugInfo.error = await res.text();
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
 * 🛠️ デバッグ用診断コンポーネント
 */
function SystemDiagnosticHero({ info }: { info: any }) {
  return (
    <div className={styles.debugBox}>
      <h3>🛠️ System Diagnostic (API Sync Status)</h3>
      <p>Endpoint: <code>{info.endpoint}</code></p>
      <p>Status: {info.status} / Fetched: {info.count} items</p>
      {info.error && <p style={{ color: '#ff6b6b' }}>Error: {info.error}</p>}
    </div>
  );
}

/**
 * 🏁 メインページコンポーネント
 */
export default async function StyleRankingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isDebug = searchParams.debug === 'true';
  const { data: actresses, debugInfo } = await getStyleRanking();

  return (
    <div className={styles.container}>
      {isDebug && <SystemDiagnosticHero info={debugInfo} />}

      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.aiBadge}>AI DEEP LEARNING</span>
          <h1 className={styles.title}>黄金比スタイルランキング</h1>
        </div>
        <p className={styles.description}>
          ウエスト・ヒップ比「0.7」の黄金比を解析。
          科学的に最も美しい曲線を持つ TOP 100 名をリアルタイム集計。
        </p>
      </header>

      <div className={styles.rankingGrid}>
        {actresses.length > 0 ? (
          actresses.map((actress, index) => {
            const rank = index + 1;
            return (
              <div key={actress.id} className={styles.rankCard} data-rank={rank}>
                {/* 1. 背景画像セクション */}
                <div className={styles.imageWrapper}>
                  {actress.image_url_large ? (
                    <img 
                      src={actress.image_url_large} 
                      alt={actress.name} 
                      className={styles.actressImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.noImage}>NO IMAGE</div>
                  )}
                  <div className={styles.rankOverlay}>{rank}</div>
                  <div className={styles.scoreBadge}>
                    {actress.ai_power_score} <small>pts</small>
                  </div>
                </div>

                {/* 2. プロフィール情報 */}
                <div className={styles.content}>
                  <div className={styles.nameRow}>
                    <h2 className={styles.name}>{actress.name}</h2>
                    <span className={styles.rankLabel}>{getRankLabel(actress.ai_power_score)}</span>
                  </div>

                  <div className={styles.specGrid}>
                    <div className={styles.specItem}>
                      <span className={styles.label}>CUP</span>
                      <span className={styles.value}>{actress.cup || '不明'}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.label}>HEIGHT</span>
                      <span className={styles.value}>{actress.height ? `${actress.height}cm` : '---'}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.label}>3-SIZE</span>
                      <span className={styles.value}>
                        {actress.bust}/{actress.waist}/{actress.hip}
                      </span>
                    </div>
                  </div>

                  {/* 3. AI 5軸ステータスバー */}
                  <div className={styles.aiStats}>
                    <div className={styles.statBar}>
                      <div className={styles.statLabel}>Style Beauty</div>
                      <div className={styles.barBg}>
                        <div className={styles.barFill} style={{ width: `${actress.score_style || 0}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.footer}>
                    <span className={styles.productCount}>出演作品: {actress.product_count}本</span>
                    <button className={styles.detailBtn}>PROFILE</button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noData}>
            <p>ランキングデータを生成中です。しばらくお待ちください。</p>
          </div>
        )}
      </div>
    </div>
  );
}