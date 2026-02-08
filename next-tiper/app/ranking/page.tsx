import React from 'react';
import { Metadata } from 'next';
import { Flame, BrainCircuit } from 'lucide-react';

/**
 * 🛠️ インポートセクション
 */
import { fetchAdultProductRanking } from '@shared/lib/api';
import AdultProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import RadarChart from '@shared/ui/RadarChart';
import styles from './Ranking.module.css';

/**
 * ✅ SEOメタデータ生成
 * tiper.live のドメインとアダルトコンテンツに最適化
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const page = sParams.page || '1';
  return {
    title: `【AI解析】アダルト作品徹底比較ランキング 第${page}ページ | Tiper`,
    description: `最新のAI解析スコアに基づいたアダルト作品ランキング。ルックス・演技・没入感を5軸チャートで徹底比較。`,
    alternates: {
      canonical: `https://tiper.live/ranking/?page=${page}`,
    },
  };
}

/**
 * ページコンポーネント
 */
export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // アダルト作品解析データの取得
  const allProducts = await fetchAdultProductRanking();
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 構造化データ (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "アダルト作品AI解析スコアランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image_url?.replace('http://', 'https://'),
      }
    }))
  };

  // ランキング順位に応じたチャート色の取得
  const getChartColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#E91E63'; // Default Pink/Red
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダーエリア */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <BrainCircuit className="w-4 h-4 mr-1" />
          AI ANALYSIS
        </div>
        <h1 className={styles.title}>🔞 作品スペック解析ランキング</h1>
        <p className={styles.subtitle}>
          AIソムリエが全作品を独自のアルゴリズムで数値化。真の満足度を可視化しました。
        </p>
      </div>
      
      {/* グリッドレイアウト */}
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          
          /**
           * チャートデータの整形
           * PCスペック(CPU等)からアダルト解析軸へ変更
           */
          const chartData = product.radar_chart || [
            { subject: 'ルックス', value: 0, fullMark: 100 },
            { subject: '演技力', value: 0, fullMark: 100 },
            { subject: 'コスパ', value: 0, fullMark: 100 },
            { subject: '没入感', value: 0, fullMark: 100 },
            { subject: '希少性', value: 0, fullMark: 100 },
          ];

          return (
            <AdultProductCard 
              key={product.unique_id || product.id} 
              product={product} 
              rank={rank}
            >
              {/* 🚩 AdultProductCardのchildrenとして解析チャートを注入 */}
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  <Flame className="w-3 h-3 text-orange-500 mr-1" />
                  <span className={styles.analysisLabel}>AI解析スコア詳細</span>
                </div>
                <RadarChart 
                  data={chartData} 
                  color={getChartColor(rank)} 
                />
              </div>
            </AdultProductCard>
          );
        })}
      </div>

      {/* 共通 Pagination コンポーネントを使用 */}
      <div className={styles.paginationSection}>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          baseUrl="/ranking" 
        />
      </div>
    </main>
  );
}