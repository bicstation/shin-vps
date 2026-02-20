/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import styles from '../../videos/videos.module.css'; // 二階層上のCSSを適用
import ProductCard from '@/shared/cards/AdultProductCard';
import Sidebar from '@/shared/layout/Sidebar/AdultSidebar'; 
import Pagination from '@/shared/common/Pagination';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

import { getSiteMainPosts } from '@/shared/lib/api/wordpress';
import { getUnifiedProducts, getPlatformAnalysis } from '@/shared/lib/api/django/adult';

export const dynamic = 'force-dynamic';

/**
 * 💡 メタデータの動的生成
 */
export async function generateMetadata(props: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await props.params;
  return { 
    title: `${slug.toUpperCase()} | ${category.toUpperCase()} | SYSTEM_REGISTRY`,
    description: `${category}「${slug}」に該当する動画アーカイブの解析結果を表示します。`
  };
}

export default async function CategoryDetailPage(props: { 
  params: Promise<{ category: string; slug: string }>; // id ではなく slug に変更
  searchParams: Promise<{ page?: string }>;
}) {
  const { category, slug } = await props.params;
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 24;

  /**
   * 💡 クエリキーの動的変換
   * URLが /genres/oppai の場合:
   * 1. categoryKey = "genre"
   * 2. slug が数字でないなら filterKey = "genre_slug"
   * 3. slug が数字(ID)なら filterKey = "genre" (後方互換性)
   */
  const categoryKey = category.replace(/s$/, ''); // makers -> maker
  const isNumberId = /^\d+$/.test(slug);
  const filterKey = isNumberId ? categoryKey : `${categoryKey}_slug`;

  // --- 1. データ並列取得 (Django & WordPress) ---
  const [productRes, analysisData, wpData] = await Promise.all([
    getUnifiedProducts({ 
      page: currentPage, 
      limit: pageSize,
      [filterKey]: slug, // IDまたはスラッグを自動判定してセット
      ordering: '-release_date'
    }).catch(() => ({ results: [], count: 0 })),
    getPlatformAnalysis('unified', { mode: 'summary' }).catch(() => null),
    getSiteMainPosts(0, 5).catch(() => ({ results: [] })),
  ]);

  const items = productRes?.results || [];
  const totalCount = productRes?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 作品が1件も見つからない場合、且つAPIがエラーだった場合は404（任意で調整）
  if (items.length === 0 && currentPage === 1 && !analysisData) {
    return notFound();
  }

  // サイドバー用データの抽出
  const extract = (key: string) => {
    const data = analysisData?.[key] || analysisData?.results?.[key];
    return Array.isArray(data) ? data : [];
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.wrapper}>
        
        {/* 📊 LEFT_SIDEBAR: 統計・ナビゲーション */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <Sidebar 
              genres={extract('genres')} 
              makers={extract('makers')}
              actresses={extract('actresses')} 
              series={extract('series')}
              directors={extract('directors')} 
              authors={extract('authors')}
              labels={extract('labels')}
              recentPosts={(wpData?.results || []).map((p: any) => ({ 
                id: p.id.toString(), 
                title: p.title.rendered, 
                slug: p.slug 
              }))}
            />
          </div>
        </aside>

        {/* 📺 MAIN_STREAM: 動画一覧 */}
        <main className={styles.contentStream}>
          
          {/* システム診断表示 */}
          <SystemDiagnosticHero 
            status="ACTIVE" 
            moduleName={`REGISTRY_FILTER: ${category.toUpperCase()} / ${slug}`} 
          />
          
          <section className={styles.archiveSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.mainTitle}>
                <span className={styles.titleThin}>REGISTRY //</span> {category.toUpperCase()}: {slug.replace(/-/g, ' ').toUpperCase()}
              </h1>
              <div className={styles.resultCount}>
                TOTAL_POSTS: <span className={styles.countNumber}>{totalCount}</span>
              </div>
            </div>

            {/* 動画カードのグリッド表示 */}
            <div className={styles.videoGrid}>
              {items.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 該当なしの場合の表示 */}
            {items.length === 0 && (
              <div className={styles.emptyState}>
                [!] NO_MATCHING_DATA_FOUND_IN_REGISTRY
              </div>
            )}
          </section>

          {/* ページネーション */}
          {totalPages > 1 && (
            <footer className={styles.paginationFooter}>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl={`/${category}/${slug}`} 
              />
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}