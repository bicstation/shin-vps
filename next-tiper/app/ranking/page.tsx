/* /app/ranking/page.tsx */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import { Flame, BrainCircuit, TrendingUp } from 'lucide-react';

/**
 * 🛠️ インポートセクション (物理構造同期済み)
 */
import { fetchAdultProductRanking } from '@/shared/lib/api/django/adult';
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard.tsx';
import Pagination from '@/shared/components/molecules/Pagination';
import RadarChart from '@/shared/components/atoms/RadarChart';
import styles from './Ranking.module.css';

/**
 * ✅ SEOメタデータ生成
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
  };
}

/**
 * 🔞 ランキングページ メインコンポーネント
 */
export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // 1. データの取得
  const rankingResponse = await fetchAdultProductRanking().catch(() => ({ results: [], count: 0 }));
  const allProducts = Array.isArray(rankingResponse) ? rankingResponse : (rankingResponse.results || []);
  
  // 2. ページネーション用スライス
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 3. 構造化データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "アダルト作品AI解析スコアランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.title || p.name,
      }
    }))
  };

  const getThemeColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#E2E2E2';
    if (rank === 3) return '#CD7F32';
    return '#00d1b2';
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
      </header>
      
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          const themeColor = getThemeColor(rank);
          
          const chartData = [
            { subject: 'VISUAL', value: product.score_visual || 0, fullMark: 100 },
            { subject: 'STORY',  value: product.score_story || 0,  fullMark: 100 },
            { subject: 'COST',   value: product.score_cost || 0,   fullMark: 100 },
            { subject: 'EROTIC', value: product.score_erotic || 0, fullMark: 100 },
            { subject: 'RARITY', value: product.score_rarity || 0, fullMark: 100 },
          ];

          return (
            <AdultProductCard 
              key={product.id || `rank-${rank}`} 
              product={product} 
              rank={rank}
            >
              <div className={styles.analysisSection}>
                <div className={styles.analysisHeader} style={{ color: themeColor }}>
                  <Flame className="w-3 h-3 mr-1" />
                  <span className={styles.analysisLabel}>
                    NEURAL_SCORE: {product.spec_score || 0}%
                  </span>
                </div>

                <div className="flex justify-center items-center py-4 bg-black/40 rounded-xl border border-white/5 transition-transform group-hover:scale-[1.02]">
                  <RadarChart 
                    data={chartData} 
                    color={themeColor} 
                  />
                </div>
              </div>
            </AdultProductCard>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className={styles.paginationSection}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/ranking" 
          />
        </nav>
      )}
    </main>
  );
}