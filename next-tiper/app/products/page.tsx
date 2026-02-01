/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getAdultProducts } from '@shared/lib/api'; 
// ✅ 共通の ProductCard を参照するように修正
import ProductCard from '@shared/components/cards/AdultProductCard';
import styles from './products.module.css'; // スタイルをCSS Modulesに分離

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Next.js 15対応
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 40; // 一覧ページなので多めに表示
  const offset = (currentPage - 1) * limit;

  // 💡 API呼び出し
  const data = await getAdultProducts({ 
    limit, 
    offset, 
    ordering: '-id' 
  }).catch(() => ({ results: [], count: 0 }));

  const products = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        
        {/* ヘッダーエリア */}
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>
              ALL PRODUCTS
            </h1>
            <p className={styles.subtitle}>
              全作品アーカイブ <span className={styles.count}>{totalCount.toLocaleString()} ITEMS</span>
            </p>
          </div>
        </header>
        
        {/* 商品グリッド */}
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyBox}>
            <p>作品データを取得できませんでした。</p>
            <p className={styles.emptySub}>Django APIの稼働状況を確認してください。</p>
          </div>
        )}
        
        {/* ページネーション（簡易版） */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {currentPage > 1 && (
              <a href={`/products?page=${currentPage - 1}`} className={styles.pageBtn}>
                PREV
              </a>
            )}
            
            <div className={styles.pageDisplay}>
              <span className={styles.current}>{currentPage}</span>
              <span className={styles.divider}>/</span>
              <span className={styles.total}>{totalPages}</span>
            </div>

            {currentPage < totalPages && (
              <a href={`/products?page=${currentPage + 1}`} className={styles.pageBtn}>
                NEXT
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}