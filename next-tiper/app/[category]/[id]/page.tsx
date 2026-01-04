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

  // 💡 Django側の filterset_fields に対応するキー名へのマッピング
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

  // 💡 環境変数の末尾に / があってもなくても正しく結合するための処理
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';
  // 末尾のスラッシュをすべて削除
  baseUrl = baseUrl.replace(/\/+$/, "");
  
  // スラッシュを1つだけ挟んで結合
  const apiUrl = `${baseUrl}/adults/?${query.toString()}`;
  
  console.log("-----------------------------------------");
  console.log("🚀 Requesting Django API:", apiUrl);
  console.log("-----------------------------------------");

  try {
    const res = await fetch(apiUrl, { 
      cache: 'no-store', 
    });
    
    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`);
      return { results: [], count: 0 };
    }
    
    const data = await res.json();
    console.log(`✅ API Success: Found ${data.count} items`);
    
    return {
      results: data.results || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error("❌ Fetch Error:", error);
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
            <p className="text-xl font-bold">No products found.</p>
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded text-left text-xs font-mono">
              <p className="text-blue-400 font-bold mb-2 underline">DEBUG INFO</p>
              <p><span className="text-gray-400">Category:</span> {category}</p>
              <p><span className="text-gray-400">ID:</span> {id}</p>
              <p><span className="text-gray-400">Request URL:</span> <span className="text-yellow-200">{process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")}/adults/?{category === 'genre' ? 'genres' : category}={id}</span></p>
            </div>
            <Link href="/" className="mt-6 inline-block text-[#00d1b2] hover:underline">
              ← Back to TOP
            </Link>
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