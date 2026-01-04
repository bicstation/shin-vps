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

  // 💡 WSL環境では localhost だと自分自身を指してエラーになることが多いため、
  // 明示的に 127.0.0.1 を優先します。
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8083/api';
  
  // スラッシュの重複を掃除し、localhost を IP に置換して通信の確実性を上げる
  baseUrl = baseUrl.replace(/\/+$/, "").replace('localhost', '127.0.0.1');
  
  const apiUrl = `${baseUrl}/adults/?${query.toString()}`;
  
  console.log("-----------------------------------------");
  console.log("🚀 Requesting Django API:", apiUrl);
  console.log("-----------------------------------------");

  try {
    const res = await fetch(apiUrl, { 
      cache: 'no-store', // 開発時は常に最新を取得
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
    console.error("❌ Fetch Error (Possible Network Issue):", error);
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
  // 💡 Next.jsの最新仕様に合わせ、params と searchParams を await する
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = resolvedParams.category;
  const id = resolvedParams.id;
  const currentPage = resolvedSearchParams.page || '1';
  const currentSort = resolvedSearchParams.sort || '-created_at'; 

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
              <p className="text-blue-400 font-bold mb-2 underline">NETWORK DEBUG INFO</p>
              <p><span className="text-gray-400">Category:</span> {category}</p>
              <p><span className="text-gray-400">ID:</span> {id}</p>
              <p><span className="text-gray-400">Final API URL:</span> 
                <span className="text-yellow-200 ml-1">
                  {process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8083/api'}/adults/?{category === 'genre' ? 'genres' : category}={id}
                </span>
              </p>
              <p className="mt-2 text-gray-500 italic">※ブラウザで上のURLを直接開き、データが出るか確認してください。</p>
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