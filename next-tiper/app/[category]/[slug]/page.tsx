/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// CSSモジュールとコンポーネントのインポート
import styles from './Category.module.css'; 
import ProductCard from '@/shared/cards/AdultProductCard';
import Pagination from '@/shared/common/Pagination';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

import { getSiteMainPosts } from '@/shared/lib/api/wordpress';
import { 
  getUnifiedProducts, 
  fetchMakers, 
  fetchGenres, 
  fetchActresses,
  fetchSeries,
  fetchDirectors,
  fetchAuthors,
  fetchLabels
} from '@/shared/lib/api/django/adult';

export const dynamic = 'force-dynamic';

// 📊 タクティカル・ソートオプション
const SORT_OPTIONS = [
  { label: 'NEW_RELEASE', value: '-release_date' },
  { label: 'PRICE: LOW', value: 'price' },
  { label: 'PRICE: HIGH', value: '-price' },
  { label: 'AVG_RATING', value: '-review_average' },
  { label: 'SPEC_SCORE', value: '-spec_score' },
];

// 💡 厳密なカテゴリ・マッピング
const CATEGORY_MAP: Record<string, string> = {
  'actresses': 'actress',
  'genres': 'genre',
  'makers': 'maker',
  'series': 'series',
  'labels': 'label',
  'directors': 'director',
  'authors': 'author'
};

/**
 * メタデータの生成
 */
export async function generateMetadata(props: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug: rawSlug } = await props.params;
  const slug = decodeURIComponent(rawSlug);
  return { 
    title: `${slug.toUpperCase()} // ${category.toUpperCase()} | SYSTEM_ARCHIVE`,
  };
}

/**
 * カテゴリ詳細ページ メインコンポーネント
 * 🛠️ サイドバーを排除し、コンテンツをメインストリームのみに集中させた構成
 */
export default async function CategoryDetailPage(props: { 
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ page?: string; ordering?: string; debug?: string }>;
}) {
  const { category, slug: rawSlug } = await props.params;
  const slug = decodeURIComponent(rawSlug);
  const searchParams = await props.searchParams;
  
  const currentPage = Number(searchParams.page) || 1;
  const currentOrdering = searchParams.ordering || '-release_date';
  const isDebugMode = searchParams.debug === 'true';
  const pageSize = 24;

  // 💡 正確なフィルタキーの構築
  const baseKey = CATEGORY_MAP[category] || category.replace(/s$/, ''); 
  const isNumberId = /^\d+$/.test(slug);
  const filterKey = isNumberId ? baseKey : `${baseKey}_slug`;

  // --- 📡 データの取得（メインコンテンツのみ） ---
  const [
    productRes,
  ] = await Promise.all([
    getUnifiedProducts({ 
      page: currentPage, 
      limit: pageSize,
      [filterKey]: slug, 
      ordering: currentOrdering
    }).catch(() => ({ results: [], count: 0 })),
  ]);

  const items = productRes?.results || [];
  const totalCount = productRes?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (items.length === 0 && currentPage === 1) return notFound();

  return (
    <div className={styles.container}>
      {/* 📟 シンプルなトップナビ */}
      <nav className={styles.navBar}>
        <div className={styles.navInner}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>CORE_SYSTEM</Link>
            <span className="opacity-20">/</span>
            <Link href={`/${category}`} className={styles.breadcrumbLink}>{category.toUpperCase()}</Link>
          </div>
          <div className={styles.liveDot}></div>
        </div>
      </nav>

      <div className={styles.inner}>
        {/* 🛠️ mainLayout のサイドバー (aside) を削除しました。
            styles.mainLayout で grid を使用している場合は、CSS側で 
            grid-template-columns: 1fr; に修正することをお勧めします。
        */}
        <div className={styles.mainLayout}>
          
          {/* 📺 メインストリーム (全幅展開) */}
          <main className={styles.content}>
            
            <header className={styles.contentHeader}>
              <div className={styles.nodeStatus}>
                <span className="text-pink-500">▶</span> NODE_ACCESS_CONFIRMED / {category.toUpperCase()}
              </div>
              <h1 className={styles.titleMain}>{slug}</h1>
              {isDebugMode && (
                <div className="text-[10px] font-mono text-pink-500 mt-2 bg-pink-500/5 py-1 px-3 border border-pink-500/20 inline-block rounded">
                  DEBUG: {filterKey}="{slug}" | FETCHED: {items.length}
                </div>
              )}
            </header>

            <div className={styles.contentToolbar}>
              <div className={styles.sortGroup}>
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/${category}/${rawSlug}?ordering=${opt.value}${isDebugMode ? '&debug=true' : ''}`}
                    className={`${styles.sortBtn} ${currentOrdering === opt.value ? styles.sortBtnActive : ''}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
              <div className={styles.metrics}>
                <span className="opacity-40 text-[9px] mr-2">ENTRY_TOTAL:</span>
                <span className={styles.metricValue}>{totalCount.toLocaleString()}</span>
              </div>
            </div>

            {isDebugMode && (
              <div className="mb-8">
                <SystemDiagnosticHero status="ACTIVE" moduleName={`STREAM: ${slug}`} />
              </div>
            )}
            
            {/* 商品グリッド - サイドバーがなくなった分、より多くのカラムを表示可能 */}
            <div className={styles.productGrid}>
              {items.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  baseUrl={`/${category}/${rawSlug}?ordering=${currentOrdering}${isDebugMode ? '&debug=true' : ''}`} 
                />
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}