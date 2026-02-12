import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { TrendingUp, Activity, Flame } from 'lucide-react';

/**
 * 🛠️ インポートセクション
 * 指定されたパスのコンポーネントを使用
 */
import { fetchAdultPopularityRanking } from '@shared/lib/api';
import AdultProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import styles from './Popularity.module.css';

/**
 * ✅ SEOメタデータ
 * tiper.live 用に検索エンジン最適化した設定
 */
export const metadata: Metadata = {
  title: '【24時間集計】注目アダルト作品アクセスランキング | Tiper',
  description: '今、最も閲覧されているアダルト作品をリアルタイム集計。過去24時間のアクセスデータに基づいた売れ筋・注目ランキングTOP100を公開中。',
  keywords: ['アダルトランキング', '人気作品', 'Tiper', 'リアルタイムトレンド'],
  robots: {
    index: true,
    follow: true,
  },
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
  // Next.js 15+ の非同期 searchParams 対応
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // DBからランキングデータを取得
  const allProducts = await fetchAdultPopularityRanking();
  
  // ページネーション用にスライス
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  /**
   * 構造化データ (JSON-LD)
   * 商品リストとしてGoogleに認識させ、検索結果での視認性を高める
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": offset + index + 1,
      "url": `https://tiper.live/product/${product.unique_id}`,
      "name": product.name
    }))
  };

  return (
    <>
      {/* 構造化データのレンダリング */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ページヘッダー */}
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

      {/* ランキンググリッド表示 */}
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          return (
            <div key={product.unique_id || product.id} className={styles.cardWrapper}>
              {/* 指定された AdultProductCard を使用 */}
              <AdultProductCard 
                product={product} 
                rank={rank}
              />
              
              {/* 3位以内の場合は「注目」バッジをオーバーレイ表示 */}
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

      {/* 共通 Pagination コンポーネントを使用 */}
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

/**
 * ✅ ページエントリポイント
 * Next.js 15 の「Missing Suspense Boundary」を回避するため、
 * 動的パラメータ（searchParams）を扱うコンテンツを Suspense で保護します。
 */
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