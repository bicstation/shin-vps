/* /app/ranking/popularity/page.tsx */
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { TrendingUp, Activity, Flame } from 'lucide-react';

/**
 * 🛠️ インポートセクション (物理構造同期済み)
 */
import { fetchAdultPopularityRanking } from '@/shared/lib/api';
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard.tsx';
import Pagination from '@/shared/components/molecules/Pagination';
import styles from './Popularity.module.css';

/**
 * ✅ SEOメタデータ
 */
export const metadata: Metadata = {
  title: '【24時間集計】注目アダルト作品アクセスランキング | Tiper',
  description: '今、最も閲覧されているアダルト作品をリアルタイム集計。過去24時間のアクセスデータに基づいた売れ筋・注目ランキングTOP100を公開中。',
  keywords: ['アダルトランキング', '人気作品', 'Tiper', 'リアルタイムトレンド'],
  robots: { index: true, follow: true },
  openGraph: {
    title: '注目アダルト作品アクセスランキング | Tiper',
    description: '今、最も閲覧されているアダルト作品をリアルタイム集計。',
    url: 'https://tiper.live/popularity',
    siteName: 'Tiper',
    type: 'website',
  },
};

/**
 * 💡 実際のコンテンツを描画する非同期コンポーネント
 */
async function RankingContent({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // DBからランキングデータを取得 (エラーハンドリング追加)
  const allProducts = await fetchAdultPopularityRanking().catch(() => []);
  
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": offset + index + 1,
      "url": `https://tiper.live/product/${product.unique_id || product.id}`,
      "name": product.name || product.title
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={styles.header}>
        <div className={styles.badgeContainer}>
          <Flame className="w-4 h-4 text-orange-500" />
          <span>ADULT TRENDING NOW</span>
        </div>
        <h1 className={styles.title}>
          <TrendingUp className="inline-block mr-2 mb-1" />
          POPULARITY RANKING 100
        </h1>
        <p className={styles.subtitle}>
          最新のアクセス統計に基づき、今ユーザーが熱狂している人気作品をランキング形式で紹介します。
        </p>
      </header>

      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          return (
            <div key={product.unique_id || product.id || `rank-${rank}`} className={styles.cardWrapper}>
              <AdultProductCard 
                product={product} 
                rank={rank}
              />
              
              {rank <= 3 && (
                <div className={styles.trendingTag}>
                  <Activity className="w-3 h-3 mr-1" />
                  <span>HOT</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.paginationSection}>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          baseUrl="/ranking/popularity" 
        />
      </div>
    </>
  );
}

export default function AdultPopularityRankingPage(props: { 
  searchParams: Promise<{ page?: string }> 
}) {
  return (
    <main className={styles.container}>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500 font-medium">RANKING DATA LOADING...</p>
        </div>
      }>
        <RankingContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}