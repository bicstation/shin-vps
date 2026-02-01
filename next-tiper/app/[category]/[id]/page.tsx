/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import React from 'react';
// ✅ shared 側の AdultProductCard を使用するようにパスを修正
import ProductCard from '@shared/components/cards/AdultProductCard';
import Link from 'next/link';
import styles from './category.module.css';

/**
 * 💡 API フェッチ関数
 * Django 内部ネットワーク (http://django-v2:8000) を経由してデータを取得します
 */
async function getCategoryProducts(category: string, id: string, page: string = '1', sort: string = '-created_at') {
  const pageSize = 20;

  // 各カテゴリパスを API のクエリパラメータ名にマッピング
  const categoryMap: { [key: string]: string } = {
    'genre': 'genres',
    'genres': 'genres',
    'actress': 'actresses',
    'actresses': 'actresses',
    'maker': 'maker',
    'makers': 'maker',
    'series': 'series',
    'label': 'label',
  };

  const queryKey = categoryMap[category] || category;

  const query = new URLSearchParams({
    [queryKey]: id,
    page: page,
    ordering: sort,
    page_size: pageSize.toString(),
  });

  const baseUrl = process.env.API_URL_INTERNAL || 'http://django-v2:8000/api';
  const apiUrl = `${baseUrl}/adults/?${query.toString()}`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`⚠️ API Response Not OK: ${res.status} for ${apiUrl}`);
      return { results: [], count: 0 };
    }
    const data = await res.json();
    return { results: data.results || [], count: data.count || 0 };
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return { results: [], count: 0 };
  }
}

/**
 * 💡 カテゴリ一覧ページコンポーネント
 */
export default async function CategoryListPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string, id: string }>,
  searchParams: Promise<{ page?: string, sort?: string }>
}) {
  // Next.js 15 以降の Promise 解消対応
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { category, id } = resolvedParams;
  const currentPage = resolvedSearchParams.page || '1';
  const currentSort = resolvedSearchParams.sort || '-created_at'; 

  // データ取得
  const data = await getCategoryProducts(category, id, currentPage, currentSort);
  const products = data.results || [];
  const totalCount = data.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  /**
   * 💡 カテゴリ名称の抽出
   * 1件目のデータから、現在の ID に対応する名称（女優名やジャンル名）を特定します
   */
  let categoryName = "";
  if (products.length > 0) {
    const firstProduct = products[0];
    
    if (category.startsWith('genre')) {
      const g = firstProduct.genres?.find((x: any) => String(x.id) === id);
      if (g) categoryName = g.name;
    } else if (category.startsWith('actress')) {
      const a = firstProduct.actresses?.find((x: any) => String(x.id) === id);
      if (a) categoryName = a.name;
    } else if (category === 'maker' || category === 'makers') {
      if (firstProduct.maker && String(firstProduct.maker.id) === id) {
        categoryName = firstProduct.maker.name;
      }
    } else if (category === 'series') {
      if (firstProduct.series && String(firstProduct.series.id) === id) {
        categoryName = firstProduct.series.name;
      }
    } else if (category === 'label') {
      if (firstProduct.label && String(firstProduct.label.id) === id) {
        categoryName = firstProduct.label.name;
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        {/* ヘッダーエリア：タイトルとソート順 */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.categoryPrefix}>{category.toUpperCase()}:</span>
              <span className={styles.titleMain}> {categoryName || id}</span>
              {categoryName && <span className={styles.titleId}> (ID: {id})</span>}
            </h1>
            <p className={styles.itemCount}>{totalCount.toLocaleString()} items found</p>
          </div>

          <div className={styles.sortList}>
            {[
              { label: '最新順', value: '-created_at' },
              { label: '人気順', value: '-views' },
              { label: '価格安い順', value: 'price' },
            ].map((opt) => (
              <Link
                key={opt.value}
                href={`/${category}/${id}?page=1&sort=${opt.value}`}
                className={`${styles.sortButton} ${currentSort === opt.value ? styles.sortButtonActive : ''}`}
              >
                {opt.label}
              </Link>
            ))}
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
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚫</div>
            <p className="text-xl font-bold text-gray-400">No products found in this category.</p>
            <Link href="/" className="mt-8 inline-block px-8 py-3 rounded-full border border-[#e94560] text-[#e94560] hover:bg-[#e94560] hover:text-white transition-all">
              ← Back to TOP
            </Link>
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <nav className={styles.pagination}>
            {parseInt(currentPage) > 1 ? (
              <Link 
                href={`/${category}/${id}?page=${parseInt(currentPage) - 1}&sort=${currentSort}`} 
                className={styles.pageLink}
              >
                PREV
              </Link>
            ) : (
              <span className={styles.pageDisabled}>PREV</span>
            )}

            <div className={styles.pageInfo}>
                <span className={styles.pageLabel}>PAGE</span>
                <span className={styles.currentPage}>{currentPage}</span>
                <span className={styles.pageSeparator}>/</span>
                <span className={styles.totalPage}>{totalPages}</span>
            </div>

            {parseInt(currentPage) < totalPages ? (
              <Link 
                href={`/${category}/${id}?page=${parseInt(currentPage) + 1}&sort=${currentSort}`} 
                className={styles.pageLink}
              >
                NEXT
              </Link>
            ) : (
              <span className={styles.pageDisabled}>NEXT</span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}