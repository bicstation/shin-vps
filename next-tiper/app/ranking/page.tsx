/* /app/ranking/page.tsx */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import { Flame, BrainCircuit, TrendingUp } from 'lucide-react';

/**
 * 🛠️ インポートセクション
 */
import { fetchAdultProductRanking } from '@shared/lib/api/django/adult';
import AdultProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import RadarChart from '@shared/ui/RadarChart';
import styles from './Ranking.module.css';

/**
 * ✅ SEOメタデータ生成
 * ページ番号に応じた動的なタイトルとカノニカルURLを設定します。
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const page = sParams.page || '1';
  
  return {
    title: `【AI解析】アダルト作品徹底比較ランキング 第${page}ページ | Tiper`,
    description: `最新のAI解析スコアに基づいたアダルト作品ランキング。ルックス・演技・没入感を5軸チャートで徹底比較し、真の満足度を可視化。`,
    alternates: {
      canonical: `https://tiper.live/ranking/?page=${page}`,
    },
    openGraph: {
      title: `AIスペック解析ランキング 第${page}ページ`,
      description: `AIが全作品を独自のアルゴリズムで数値化した次世代ランキング。`,
      type: 'website',
    },
  };
}

/**
 * 🔞 ランキングページ メインコンポーネント
 * サーバーコンポーネントとして動作し、APIからデータを直接取得します。
 */
export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // searchParams の解決
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // 1. アダルト作品解析データの取得
  // 💡 fetchAdultProductRanking は内部でキャッシュまたは最新データを取得することを想定
  const rankingResponse = await fetchAdultProductRanking();
  
  // 2. APIレスポンスの正規化
  // レスポンスが { results: [], count: 0 } か、単純な配列 [{}, {}] かを判定して処理
  const allProducts = Array.isArray(rankingResponse) ? rankingResponse : (rankingResponse.results || []);
  
  // 3. ページネーション用スライス
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 4. 構造化データ (JSON-LD) の生成
  // 検索エンジンにランキング形式であることを正しく伝えます
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "アダルト作品AI解析スコアランキング",
    "description": "AIによる5軸スペック解析に基づいた作品ランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.title || p.name,
        "image": (p.image_url_list?.[0] || p.image_url || '').replace('http://', 'https://'),
        "description": p.description || `${p.title}のAI解析スコア`,
        "brand": {
          "@type": "Brand",
          "name": p.maker?.name || "Original"
        }
      }
    }))
  };

  /**
   * 🎨 ランキング順位に応じたテーマカラーの取得
   * 上位3位までは特別なメタルカラー、それ以降はサイバーピンクを返します。
   */
  const getThemeColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold (🥇)
    if (rank === 2) return '#E2E2E2'; // Silver (🥈)
    if (rank === 3) return '#CD7F32'; // Bronze (🥉)
    return '#00d1b2'; // Cyber Neon Green (4位以降)
  };

  return (
    <main className={styles.container}>
      {/* 検索エンジン用 JSON-LD 注入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🚀 ヘッダーエリア：サイトの「解析」コンセプトを強調 */}
      <header className={styles.header}>
        <div className={styles.topDecoration}>
          <div className={styles.badge}>
            <BrainCircuit className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            <span>AI_NEURAL_ANALYSIS_STREAM</span>
          </div>
          <div className={styles.liveIndicator}>
            <span className={styles.dot}></span>
            LIVE_RANKING
          </div>
        </div>

        <h1 className={styles.title}>
          <TrendingUp className="inline-block mr-3 text-[#e94560]" />
          作品スペック解析ランキング
        </h1>
        
        <p className={styles.subtitle}>
          AIソムリエが全作品を独自のアルゴリズムで数値化。<br className="hidden md:block" />
          単なる人気順ではない「真の満足度」を5軸チャートで可視化しました。
        </p>
      </header>
      
      {/* 📊 メイングリッド：AdultProductCard をループ表示 */}
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          const themeColor = getThemeColor(rank);
          
          /**
           * 📈 レーダーチャートデータの整形
           * APIの各スコアフィールドをマッピングします。
           */
          const chartData = [
            { subject: 'VISUAL', value: product.score_visual || 0, fullMark: 100 },
            { subject: 'STORY',  value: product.score_story || 0,  fullMark: 100 },
            { subject: 'COST',   value: product.score_cost || 0,   fullMark: 100 },
            { subject: 'EROTIC', value: product.score_erotic || 0, fullMark: 100 },
            { subject: 'RARITY', value: product.score_rarity || 0, fullMark: 100 },
          ];

          return (
            <AdultProductCard 
              key={product.product_id_unique || product.id || `rank-${rank}`} 
              product={product} 
              rank={rank}
            >
              {/* 🚩 カード内部に注入する追加の解析セクション */}
              <div className={styles.analysisSection}>
                <div className={styles.analysisHeader} style={{ color: themeColor }}>
                  <Flame className="w-3 h-3 mr-1" />
                  <span className={styles.analysisLabel}>
                    NEURAL_SCORE: {product.spec_score || 0}%
                  </span>
                </div>

                {/* RadarChart 描画エリア */}
                <div className="flex justify-center items-center py-4 bg-black/40 rounded-xl border border-white/5 shadow-inner transition-transform group-hover:scale-[1.02]">
                  <RadarChart 
                    data={chartData} 
                    color={themeColor} 
                  />
                </div>

                {/* 簡易タグ (任意) */}
                <div className="mt-3 flex flex-wrap gap-1 opacity-60">
                  {product.genres?.slice(0, 3).map((g, i) => (
                    <span key={i} className="text-[8px] border border-white/20 px-1 rounded uppercase font-mono">
                      #{g.name}
                    </span>
                  ))}
                </div>
              </div>
            </AdultProductCard>
          );
        })}
      </div>

      {/* 🔄 ページネーションエリア */}
      {totalPages > 1 && (
        <nav className={styles.paginationSection} aria-label="ページ選択">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/ranking" 
          />
        </nav>
      )}

      {/* 背景装飾：走査線エフェクト */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </main>
  );
}