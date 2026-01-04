// app/[category]/[id]/page.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import styles from './category.module.css';

/**
 * カテゴリ別の商品データを取得する関数
 */
async function getCategoryProducts(category: string, id: string, page: string = '1', sort: string = '-created_at') {
  const pageSize = 20;

  // 💡 Django側の filterset_fields に定義されている正確なキー名にマッピング
  // あなたのDjango環境では 'genres=135' でデータが返ることが確認できたので、ここを確実に合わせます
  const categoryMap: { [key: string]: string } = {
    'genre': 'genres',      // URLが genre の時は APIには genres で送る
    'genres': 'genres',
    'actress': 'actresses', // URLが actress の時は APIには actresses で送る
    'actresses': 'actresses',
    'maker': 'maker',
    'makers': 'maker',
    'series': 'series',
    'label': 'label',
  };

  // マップにあれば変換、なければURLの値をそのままクエリキーにする
  const queryKey = categoryMap[category] || category;

  const query = new URLSearchParams({
    [queryKey]: id,
    page: page,
    ordering: sort,
    page_size: pageSize.toString(),
  });

  // 💡 確実に Django が反応する URL を構築
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/adults/?${query.toString()}`;
  
  // ターミナルでこのURLをクリックしてデータが出るか最終確認できます
  console.log("🚀 Calling Django API:", apiUrl);

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return { results: [], count: 0 };
    }
    
    const data = await res.json();
    
    // Djangoの標準的なレスポンス形式 { count: X, results: [...] } を受け取る
    return {
      results: data.results || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { results: [], count: 0 };
  }
}

/**
 * カテゴリ一覧ページ コンポーネント (/[category]/[id])
 */
export default async function CategoryListPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string, id: string }>,
  searchParams: Promise<{ page?: string, sort?: string }>
}) {
  const { category, id } = await params;
  const sParams = await searchParams;
  const currentPage = sParams.page || '1';
  const currentSort = sParams.sort || '-created_at'; 

  const data = await getCategoryProducts(category, id, currentPage, currentSort);
  
  const products = data.results || [];
  const totalCount = data.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        {/* ヘッダーセクション */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category.toUpperCase()}: <span className={styles.titleMain}>{id}</span>
            </h1>
            <p className={styles.itemCount}>{totalCount.toLocaleString()} items found</p>
          </div>

          {/* ソートボタン一覧 */}
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
        </div>

        {/* 商品グリッド */}
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No products found in this category.</p>
            <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
              Checked API for: {category}={id}
            </p>
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
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
            
            <span className={styles.pageInfo}>
                Page <span className={styles.currentPage}>{currentPage}</span> / {totalPages}
            </span>

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
          </div>
        )}
      </div>
    </div>
  );
}