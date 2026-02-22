// -*- coding: utf-8 -*-
// components/StyleRankingPage.tsx

'use client'; // チャート描画のためクライアントコンポーネント化

import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import styles from './StyleRanking.module.css';

/**
 * 💡 インターフェース定義 (趣味・出身地等を追加)
 */
interface Actress {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  image_url_large: string | null;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  cup: string;
  height: number | null;
  hobby?: string;       // 追加
  prefecture?: string;  // 追加
  // AI 5軸スコア
  ai_power_score: number | null;
  score_visual: number | null;
  score_style: number | null;
  score_performance: number | null;
  score_popularity: number | null;
}

const SNS_LINKS = [
  { label: 'Official', icon: '🌐' },
  { label: '𝕏 (Twitter)', icon: '' },
  { label: 'Wikipedia', icon: '' }
];

const getRankLabel = (score: number | null): string => {
  if (!score) return "---";
  if (score >= 95) return "👑 GOD";
  if (score >= 90) return "💎 S-Rank";
  if (score >= 80) return "✨ A-Rank";
  return "B-Rank";
};

export default function StyleRankingPage({
  actresses, // 親のServer Componentから渡される想定、またはここでFetch
  isDebug = false
}: {
  actresses: Actress[];
  isDebug?: boolean;
}) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.aiBadge}>AI ANALYTICS ENGINE v3.0</span>
          <h1 className={styles.title}>黄金比スタイルランキング</h1>
        </div>
        <p className={styles.description}>
          AIがウエスト・ヒップ比 0.7 を中心とした「科学的スタイル」を多角的に解析。
          上位 100 名の能力値をレーダーチャートで可視化。
        </p>
      </header>

      <div className={styles.rankingGrid}>
        {actresses.map((actress, index) => {
          const rank = index + 1;
          
          // レーダーチャート用データ (5軸)
          const radarData = [
            { subject: 'Visual', A: actress.score_visual || 60 },
            { subject: 'Style', A: actress.score_style || 60 },
            { subject: 'Performance', A: actress.score_performance || 50 },
            { subject: 'Popularity', A: actress.score_popularity || 50 },
            { subject: 'Potential', A: 75 },
          ];

          return (
            <div key={actress.id} className={styles.rankCard} data-rank={rank}>
              
              {/* --- 上段: スプリットビュー (画像 & チャート) --- */}
              <div className={styles.visualSection}>
                <div className={styles.imageWrapper}>
                  <div className={styles.rankBadge}>#{rank}</div>
                  <img src={actress.image_url_large || ''} alt={actress.name} className={styles.actressImage} />
                </div>
                
                <div className={styles.chartOverlay}>
                  <div className={styles.chartTitle}>AI 5-AXIS ANALYSIS</div>
                  <div className={styles.radarWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 9 }} />
                        <Radar
                          name="Actress"
                          dataKey="A"
                          stroke="#00f2fe"
                          fill="#00f2fe"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* --- 中段: メインプロフィール --- */}
              <div className={styles.content}>
                <div className={styles.nameRow}>
                  <h2 className={styles.name}>{actress.name}</h2>
                  <span className={styles.rankLabelText}>{getRankLabel(actress.ai_power_score)}</span>
                </div>

                <div className={styles.personalMeta}>
                  <span>📍 {actress.prefecture || '東京都'}</span>
                  <span>🎨 {actress.hobby || '映画鑑賞・旅行'}</span>
                </div>

                <div className={styles.specGrid}>
                  <div className={styles.specItem}>
                    <span className={styles.label}>T/B/W/H</span>
                    <span className={styles.value}>
                      {actress.height || '--'}/{actress.bust}/{actress.waist}/{actress.hip}
                    </span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.label}>CUP</span>
                    <span className={styles.value}>{actress.cup}</span>
                  </div>
                </div>

                {/* --- 下段: 将来的なSNS/Wikiリンク枠 (ダミー) --- */}
                <div className={styles.linkGrid}>
                  {SNS_LINKS.map(link => (
                    <div key={link.label} className={styles.linkBox}>
                      <span className={styles.linkIcon}>{link.icon}</span>
                      <span className={styles.linkText}>{link.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- フッター: 合計スコア --- */}
              <div className={styles.footerScore}>
                <div className={styles.scoreInfo}>
                  <span className={styles.scoreValue}>{actress.ai_power_score}</span>
                  <span className={styles.scoreUnit}>pts</span>
                </div>
                <div className={styles.productCount}>作品数: {actress.product_count}</div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}