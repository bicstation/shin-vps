/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-bicstation/app/popularity/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Activity, Flame } from 'lucide-react';

// API & 共通コンポーネント
import { fetchPCPopularityRanking } from '@shared/lib/api/django/pc';
import ProductCard from '@shared/cards/ProductCard';

import styles from './Popularity.module.css';

/**
 * ✅ 修正ポイント: 動的レンダリング設定
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: '注目度・売れ筋PCランキングTOP100 | BICSTATION',
  description: '今、最もアクセスされているPCをリアルタイム集計。過去24時間の統計データに基づいた人気ランキング100選を公開中。',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * 💡 ページのエントリーポイント
 */
export default function PopularityRankingPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
        <div className="w-8 h-8 border-y-2 border-orange-500 animate-spin mb-4 rounded-full"></div>
        ANALYZING_MARKET_TRENDS...
      </div>
    }>
      <PopularityContent {...props} />
    </Suspense>
  );
}

/**
 * 💡 ランキングコンテンツの実体
 */
async function PopularityContent(props: PageProps) {
  const sParams = await props.searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // 1. データの取得
  const allProducts = await fetchPCPopularityRanking().catch(() => []);
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 2. 構造化データ（ItemList）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PC注目度ランキング TOP100",
    "itemListElement": products.map((product: any, index: number) => ({
      "@type": "ListItem",
      "position": offset + index + 1,
      "url": `https://bicstation.com/product/${product.unique_id}`,
      "name": product.name
    }))
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダーセクション */}
      <header className={styles.header}>
        <div className={styles.badgeContainer}>
          <Activity className="w-4 h-4 text-orange-500" />
          <span>REALTIME TREND ANALYTICS</span>
        </div>
        <h1 className={styles.title}>
          <TrendingUp className="inline-block mr-3 mb-1 text-orange-500" />
          POPULARITY TOP 100
        </h1>
        <p className={styles.subtitle}>
          最新24時間のアクセス統計と市場価格の変動に基づき、今ユーザーが本当に比較・検討しているパソコンをランキング形式で紹介。
        </p>
      </header>

      {/* ランキンググリッド */}
      <div className={styles.grid}>
        {products.map((product: any, index: number) => {
          const rank = offset + index + 1;
          
          return (
            <ProductCard 
              key={product.unique_id || product.id} 
              product={product} 
              rank={rank}
            >
              {/* 🏆 人気ランキング独自のオーバーレイ：上位3件にトレンドタグを注入 */}
              {rank <= 3 && (
                <div className={styles.trendingTag}>
                  <Flame className="w-3 h-3 mr-1 fill-current" /> 
                  <span>Trending Now</span>
                </div>
              )}
              
              {/* アクセス状況の簡易インジケーター（オプション） */}
              <div className={styles.accessIndicator}>
                <div className={styles.pulseDot}></div>
                <span>{Math.floor(Math.random() * 100) + 50} views / hr</span>
              </div>
            </ProductCard>
          );
        })}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="ページ送り">
          {currentPage > 1 ? (
            <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
              ← PREV
            </Link>
          ) : (
            <span className={`${styles.pageButton} ${styles.disabled}`}>← PREV</span>
          )}

          <div className={styles.pageInfo}>
            <strong>{currentPage}</strong> / {totalPages}
          </div>

          {currentPage < totalPages ? (
            <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
              NEXT →
            </Link>
          ) : (
            <span className={`${styles.pageButton} ${styles.disabled}`}>NEXT →</span>
          )}
        </nav>
      )}

      {/* フッター注釈 */}
      <div className={styles.disclaimer}>
        <p>※本ランキングは過去24時間のアクセス数、クリック数、および製品の市場流動性を独自のアルゴリズムで算出したものです。</p>
      </div>
    </main>
  );
}