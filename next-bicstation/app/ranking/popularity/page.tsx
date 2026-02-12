export const dynamic = "force-dynamic";

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Activity } from 'lucide-react';
import { fetchPCPopularityRanking } from '@shared/lib/api';

/**
 * ✅ 修正ポイント: インポートパスの変更
 * @shared/product/ProductCard から @shared/cards/ProductCard へ
 */
import ProductCard from '@shared/cards/ProductCard';

import styles from './Popularity.module.css';

export const metadata: Metadata = {
  title: '注目度・売れ筋PCランキングTOP100 | BICSTATION',
  description: '今、最もアクセスされているPCをリアルタイム集計。過去24時間のアクセスデータに基づいた人気ランキング100選を公開中。',
};

export default async function PopularityRankingPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; // 1ページ20件に制限
  const offset = (currentPage - 1) * limit;

  // サーバーサイドで全データ取得（100件程度ならメモリ上でスライスしてOK）
  const allProducts = await fetchPCPopularityRanking();
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
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

      {/* ヘッダーエリア：他ページとトーンを合わせつつ独自色を出す */}
      <header className={styles.header}>
        <div className={styles.badgeContainer}>
          <Activity className="w-4 h-4" />
          <span>REALTIME TREND</span>
        </div>
        <h1 className={styles.title}>
          <TrendingUp className="inline-block mr-2 mb-1" />
          POPULARITY TOP 100
        </h1>
        <p className={styles.subtitle}>
          最新のアクセス統計に基づき、今ユーザーが本当に注目しているパソコンをランキング。
        </p>
      </header>

      {/* 共通 ProductCard を使用したグリッド表示 */}
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          return (
            <ProductCard 
              key={product.unique_id || product.id} 
              product={product} 
              rank={rank}
            >
              {/* 注目度ランキング独自の追加要素があればここに children として渡す */}
              {rank <= 3 && (
                <div className={styles.trendingTag}>
                  <Activity className="w-3 h-3 mr-1" /> Trending Now
                </div>
              )}
            </ProductCard>
          );
        })}
      </div>

      {/* ページネーション */}
      <nav className={styles.pagination}>
        {currentPage > 1 && (
          <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
            ← PREV
          </Link>
        )}
        <div className={styles.pageInfo}>
          <strong>{currentPage}</strong> / {totalPages}
        </div>
        {currentPage < totalPages && (
          <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
            NEXT →
          </Link>
        )}
      </nav>
    </main>
  );
}