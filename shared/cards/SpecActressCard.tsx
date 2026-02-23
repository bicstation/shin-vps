// -*- coding: utf-8 -*-
'use client'; // 👈 これが必須です！
/**
 * SpecActressCard Component (v5.2 - Marketing & Portal Integrated)
 * ポータル遷移(8083)とアフィリエイトリンクを統合した完全版
 */

import React from 'react';
import styles from './SpecActressCard.module.css';
import SpecRadarChart from '@/shared/product/SpecActressRadarChart';

/**
 * 💡 女優データの型定義
 */
export interface Actress {
  id: number;
  name: string;
  slug: string;           // URL生成に使用
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
  // 外部リンク
  x_url?: string | null;
  instagram_url?: string | null;
  wiki_url?: string | null;
  affiliate_url?: string | null; // 公式・販売サイトへのリンク
}

interface SpecActressCardProps {
  actress: Actress;
  rank?: number;
  label?: string;
  priority?: boolean;
}

const calculateAge = (birthday: string | null): string => {
  if (!birthday) return "??";
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age.toString();
};

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
  const rankInfo = getRankData(actress.ai_power_score);
  const age = calculateAge(actress.birthday);
  const baseScore = actress.ai_power_score || 80;

  // リンク先URLの設定
  const portalUrl = `http://tiper-host:8083/actresses/${encodeURIComponent(actress.slug || actress.name)}`;
  const officialUrl = actress.affiliate_url || "#";

  /**
   * 🔗 遷移ハンドラ
   */
  const navigateTo = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // 親要素（カード全体）のイベント発火を防止
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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
          <SpecRadarChart scores={{
            visual: actress.score_visual || 85,
            style: actress.score_style || 90,
            performance: actress.score_performance || 80,
            popularity: actress.score_popularity || 88,
            potential: 90
          }} />
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
              disabled={!actress.affiliate_url}
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