// app/[category]/[id]/page.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import styles from './category.module.css';

async function getCategoryProducts(category: string, id: string, page: string = '1', sort: string = '-created_at') {
  const pageSize = 20;

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

  const baseUrl = 'http://django-v2:8000/api';
  const apiUrl = `${baseUrl}/adults/?${query.toString()}`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return { results: [], count: 0 };
    const data = await res.json();
    return { results: data.results || [], count: data.count || 0 };
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return { results: [], count: 0 };
  }
}

export default async function CategoryListPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string, id: string }>,
  searchParams: Promise<{ page?: string, sort?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { category, id } = resolvedParams;
  const currentPage = resolvedSearchParams.page || '1';
  const currentSort = resolvedSearchParams.sort || '-created_at'; 

  const data = await getCategoryProducts(category, id, currentPage, currentSort);
  const products = data.results || [];
  const totalCount = data.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  /**
   * 💡 カテゴリ名（名称）の抽出ロジック
   * 取得した商品リストの最初の1件から、現在のカテゴリIDに一致する名称を探します。
   */
  let categoryName = "";
  if (products.length > 0) {
    const firstProduct = products[0];
    
    // categoryMapに基づいて、productオブジェクト内のどこに名称があるか探す
    if (category.startsWith('genre')) {
      const g = firstProduct.genres?.find((x: any) => String(x.id) === id);
      if (g) categoryName = g.name;
    } else if (category.startsWith('actress')) {
      const a = firstProduct.actresses?.find((x: any) => String(x.id) === id);
      if (a) categoryName = a.name;
    } else if (category === 'maker' || category === 'makers') {
      if (firstProduct.maker && String(firstProduct.maker.id) === id) categoryName = firstProduct.maker.name;
    } else if (category === 'series') {
      if (firstProduct.series && String(firstProduct.series.id) === id) categoryName = firstProduct.series.name;
    } else if (category === 'label') {
      if (firstProduct.label && String(firstProduct.label.id) === id) categoryName = firstProduct.label.name;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category.toUpperCase()}: 
              {/* 💡 名称があれば名称を表示、なければIDを表示 */}
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

        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="text-xl font-bold">No products found.</p>
            <Link href="/" className="mt-6 inline-block text-[#e94560] hover:underline">
              ← Back to TOP
            </Link>
          </div>
        )}

        {/* ページネーション (省略せずそのまま) */}
        {totalPages > 1 && (
          <nav className={styles.pagination}>
            {parseInt(currentPage) > 1 ? (
              <Link href={`/${category}/${id}?page=${parseInt(currentPage) - 1}&sort=${currentSort}`} className={styles.pageLink}>PREV</Link>
            ) : (
              <span className={styles.pageDisabled}>PREV</span>
            )}
            <span className={styles.pageInfo}>
                Page <span className={styles.currentPage}>{currentPage}</span> / {totalPages}
            </span>
            {parseInt(currentPage) < totalPages ? (
              <Link href={`/${category}/${id}?page=${parseInt(currentPage) + 1}&sort=${currentSort}`} className={styles.pageLink}>NEXT</Link>
            ) : (
              <span className={styles.pageDisabled}>NEXT</span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}