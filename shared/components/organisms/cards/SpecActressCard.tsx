/* eslint-disable @next/next/no-img-element */
// -*- coding: utf-8 -*-
/**
 * /home/maya/shin-vps/shared/components/organisms/cards/SpecActressCard.tsx
 * * SpecActressCard Component (v5.5 - Shared Library Physical Sync)
 * 🛡️ Maya's Logic: 物理構造 [STRUCTURE] v3.2 完全同期
 * 🚀 修正: 8083ポートのハードコードを排除し、VPS/ローカル環境を完全自動判定
 */

'use client'; 

import React from 'react';
import styles from './SpecActressCard.module.css';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

/**
 * ✅ 修正: 物理構造に基づいたインポートパス
 */
import SpecRadarChart from '@/shared/components/atoms/RadarChart'; 

/**
 * 💡 女優データの型定義
 */
export interface Actress {
  id: number;
  name: string;
  slug: string;           
  image_url_large: string | null;
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
  ai_description?: string | null;
  ai_catchcopy?: string | null;
  score_visual: number | null;
  score_style: number | null;
  score_performance: number | null;
  score_popularity: number | null;
  product_count?: number;
  x_url?: string | null;
  instagram_url?: string | null;
  wiki_url?: string | null;
  affiliate_url?: string | null; 
}

interface SpecActressCardProps {
  actress: Actress;
  rank?: number;
  label?: string;
  priority?: boolean;
}

const getRankData = (score: number | null) => {
  const s = score || 0;
  if (s >= 98) return { label: "👑 GOD", class: styles.rankGod };
  if (s >= 95) return { label: "💎 S-Rank", class: styles.rankS };
  if (s >= 85) return { label: "✨ A-Rank", class: styles.rankA };
  if (s >= 75) return { label: "B-Rank", class: styles.rankB };
  return { label: "C-Rank", class: styles.rankC };
};

export const SpecActressCard: React.FC<SpecActressCardProps> = ({ 
  actress, 
  rank, 
  label, 
  priority = false 
}) => {
  // --- 🛰️ [DYNAMIC_PORT_RESOLUTION] ---
  const site = getSiteMetadata();
  const isLocal = site?.is_local_env ?? false;
  
  /**
   * 🔗 リンク先URLの動的解決
   * 1. 本番: https://tiper.live
   * 2. VPS: http://tiper-host:8000 (django-api-host経由)
   * 3. ローカル: http://tiper-host:8083
   */
  let portalUrl = "";
  if (isLocal) {
    // ホスト名に 'django-api-host' が含まれる場合はVPS環境(8000)、それ以外はローカル(8083)
    const port = site.origin_domain?.includes('django-api-host') ? '8000' : '8083';
    portalUrl = `http://tiper-host:${port}/actress/${encodeURIComponent(actress.slug || actress.id.toString())}`;
  } else {
    portalUrl = `https://tiper.live/actress/${encodeURIComponent(actress.slug || actress.id.toString())}`;
  }

  const rankInfo = getRankData(actress.ai_power_score);
  const baseScore = actress.ai_power_score || 80;
  const officialUrl = actress.affiliate_url || "#";

  /**
   * 🚀 遷移ハンドラ
   */
  const navigateTo = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); 
    }
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // レーダーチャート用データ整形
  const radarData = [
    { subject: 'Visual', value: actress.score_visual || 85, fullMark: 100 },
    { subject: 'Style', value: actress.score_style || 90, fullMark: 100 },
    { subject: 'Act', value: actress.score_performance || 80, fullMark: 100 },
    { subject: 'Trend', value: actress.score_popularity || 88, fullMark: 100 },
    { subject: 'Poten', value: 90, fullMark: 100 },
  ];

  return (
    <article 
      className={styles.rankCard} 
      onClick={() => navigateTo(portalUrl)}
      style={{ cursor: 'pointer' }}
    >
      {/* 1. ビジュアルセクション */}
      <section className={styles.visualSection}>
        <div className={styles.imageWrapper}>
          {rank && <div className={styles.rankNumber}>#{rank}</div>}
          {label && <div className={styles.specialLabel}>{label}</div>}
          
          <img 
            src={actress.image_url_large || '/no-image.jpg'} 
            alt={actress.name} 
            className={styles.actressImage}
            loading={priority ? "eager" : "lazy"}
          />
          
          <div className={styles.scoreBadge}>
            <div className={styles.scoreValue}>{baseScore}</div>
            <div className={styles.scoreLabel}>AI INDEX</div>
          </div>
        </div>
        
        <div className={styles.chartArea}>
          <div className={styles.chartTitle}>ANALYSIS MATRIX</div>
          <div className={styles.radarContainer}>
            <SpecRadarChart data={radarData} hideAxis />
          </div>
        </div>
      </section>

      {/* 2. プロフィール詳細 */}
      <section className={styles.infoSection}>
        <header className={styles.headerRow}>
          <div className={styles.nameBlock}>
            <h2 className={styles.name}>{actress.name}</h2>
            {actress.ai_catchcopy && (
              <p className={styles.catchcopy}>“{actress.ai_catchcopy}”</p>
            )}
          </div>
          <span className={`${styles.rankTag} ${rankInfo.class}`}>{rankInfo.label}</span>
        </header>

        <div className={styles.bioBox}>
          <span className={styles.bioLabel}>AI SOMMELIER BIO</span>
          <p className={styles.bioText}>
            {actress.ai_description || "解析中... この女優の魅力的な特徴をデータから抽出しています。"}
          </p>
        </div>

        <div className={styles.specTable}>
          <div className={styles.specCell}><label>身長</label><div className={styles.specVal}>{actress.height || '--'}<span>cm</span></div></div>
          <div className={styles.specCell}><label>カップ</label><div className={styles.specVal}>{actress.cup || '??'}<span>cup</span></div></div>
          <div className={styles.specCell}><label>3-Size</label><div className={styles.specVal}>{actress.bust || '??'}/{actress.waist || '??'}/{actress.hip || '??'}</div></div>
        </div>

        {/* 3. アクション＆アフィリエイトリンク */}
        <div className={styles.actionGrid}>
          <div className={styles.snsLinks}>
            <button className={styles.snsBtn} onClick={(e) => navigateTo(actress.x_url || `https://x.com/search?q=${encodeURIComponent(actress.name)}`, e)}>𝕏</button>
            <button className={styles.snsBtn} onClick={(e) => navigateTo(actress.instagram_url || `https://www.instagram.com/explore/tags/${encodeURIComponent(actress.name)}/`, e)}>📷</button>
          </div>
          
          <div className={styles.mainActions}>
            <button 
              className={styles.officialBtn} 
              onClick={(e) => navigateTo(officialUrl, e)}
              disabled={!actress.affiliate_url || actress.affiliate_url === "#"}
            >
              公式サイト
            </button>
            <button className={styles.analyzeBtn} onClick={(e) => navigateTo(portalUrl, e)}>
              作品一覧
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <footer className={styles.cardFooter}>
        <div className={styles.productStatus}>
          <span className={styles.statusDot}></span>
          出演: <strong>{actress.product_count || 0}</strong> titles
        </div>
      </footer>
    </article>
  );
};