import React from 'react';
import styles from './StyleRanking.module.css';

/**
 * 💡 バックエンド (Django) のシリアライザーから渡されるデータ構造を定義
 */
interface Actress {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  ai_power_score: number | null;
  score_style: number | string | null; // 数値でも文字列でも受け取れるように許容
  cup: string;
}

/**
 * スコア数値をランク称号に変換するヘルパー関数
 */
const getRankLabel = (score: number | null): string => {
  if (!score) return "---";
  if (score >= 92) return "👑 GOD";
  if (score >= 85) return "💎 S-Rank";
  if (score >= 78) return "✨ A-Rank";
  if (score >= 70) return "B-Rank";
  return "C-Rank";
};

/**
 * AIによる黄金比ランキングデータを取得
 * サーバーサイド(Next.js)から Djangoコンテナへ内部通信を行います。
 */
async function getStyleRanking(): Promise<Actress[]> {
  // 内部通信用のURL設定。コンテナ名とポートを環境に合わせて調整
  const internalBaseUrl = process.env.API_INTERNAL_URL || "http://django-v2:8000/api";
  
  // 順序を明確にするため ordering パラメータを付与
  const endpoint = `${internalBaseUrl}/adult/taxonomy/?type=actresses&ordering=-profile__ai_power_score&limit=100`;

  try {
    const res = await fetch(endpoint, {
      // 💡 開発・データ更新直後は 'no-store' でキャッシュを無効化して最新データを強制取得
      cache: 'no-store', 
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      const errorDetail = await res.text();
      console.error(`[Ranking Fetch Error] Status: ${res.status}`, errorDetail);
      return [];
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("[getStyleRanking Connection Error]:", error);
    return [];
  }
}

/**
 * ランキングページ コンポーネント
 */
export default async function StyleRankingPage() {
  const actresses = await getStyleRanking();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.aiBadge}>AI ANALYSIS</span>
          黄金比スタイルランキング
        </h1>
        <p className={styles.description}>
          最新のAIアルゴリズムが8,698名のデータを解析。ウエスト・ヒップ比 0.7 を基準とした
          「科学的に美しい」とされる黄金比スタイル TOP 100。
        </p>
      </header>

      <div className={styles.rankingGrid}>
        {actresses.length > 0 ? (
          actresses.map((actress, index) => (
            <div key={actress.id} className={styles.rankCard} data-rank={index + 1}>
              {/* 順位表示 */}
              <div className={styles.rankBadge}>{index + 1}</div>
              
              {/* 女優基本情報 */}
              <div className={styles.info}>
                <h2 className={styles.name}>{actress.name}</h2>
                <div className={styles.spec}>
                  <span className={styles.cup}>{actress.cup || '?'} Cup</span>
                  <span className={styles.count}>出演作品: {actress.product_count}</span>
                </div>
              </div>

              {/* AI スコアセクション (円形プログレス) */}
              <div className={styles.scoreSection}>
                <div className={styles.scoreCircle}>
                  <svg viewBox="0 0 36 36" className={styles.circularChart}>
                    <path 
                      className={styles.circleBg} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                    <path 
                      className={styles.circle} 
                      strokeDasharray={`${actress.ai_power_score || 0}, 100`} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div className={styles.scoreText}>
                    <span className={styles.scoreNum}>{actress.ai_power_score || 0}</span>
                    <span className={styles.scoreUnit}>pt</span>
                  </div>
                </div>
                {/* AI ランク称号を数値からラベルに変換して表示 */}
                <div className={styles.rankText}>
                  {getRankLabel(Number(actress.ai_power_score))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
            解析データが見つからないか、キャッシュを読み込んでいます。<br />
            ブラウザを強制更新（Ctrl+F5）するか、しばらくお待ちください。
          </div>
        )}
      </div>
    </div>
  );
}