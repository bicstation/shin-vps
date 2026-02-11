/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ スタイル分離
import styles from './VideoArchive.module.css';

// ✅ 共通API・コンポーネント
import { getUnifiedProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import Sidebar from '@shared/layout/Sidebar';
import { AdultProduct } from '@shared/lib/api/types';

export const dynamic = 'force-dynamic';
export const revalidate = 60;
const LIMIT = 24;

const SORT_OPTIONS = [
  { label: 'LATEST', value: '-release_date' },
  { label: 'AI_SCORE', value: '-spec_score' },
  { label: 'POPULAR', value: '-review_count' },
  { label: 'PRICE_ASC', value: 'price' },
  { label: 'PRICE_DESC', value: '-price' },
];

const SOURCE_OPTIONS = [
  { label: 'ALL_SYSTEMS', value: '' },
  { label: 'FANZA', value: 'FANZA' },
  { label: 'DMM', value: 'DMM' },
  { label: 'DUGA', value: 'DUGA' },
];

export async function generateMetadata(props: {
  searchParams: Promise<{ offset?: string; ordering?: string; api_source?: string }>
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const pageNum = Math.floor((Number(searchParams.offset) || 0) / LIMIT) + 1;
  const sourceLabel = SOURCE_OPTIONS.find(o => o.value === searchParams.api_source)?.label || '全ブランド';
  const title = `${sourceLabel} アーカイブ | PAGE_${pageNum} | TIPER LIVE`;
  return { title, description: `TIPER LIVE ${sourceLabel}の動画アーカイブ。` };
}

export default async function VideoArchivePage(props: {
  searchParams: Promise<{ 
    offset?: string; 
    ordering?: string; 
    api_source?: string;
    maker__slug?: string;
  }>
}) {
  const searchParams = await props.searchParams;
  const currentOffset = Number(searchParams.offset) || 0;
  const currentOrdering = searchParams.ordering || '-release_date';
  const currentSource = searchParams.api_source || '';
  const currentMakerSlug = searchParams.maker__slug || '';

  const [productData, makersRes, postsRes] = await Promise.all([
    getUnifiedProducts({ 
      limit: LIMIT, offset: currentOffset, ordering: currentOrdering,
      api_source: currentSource, maker_slug: currentMakerSlug
    }).catch(() => ({ results: [], count: 0 })),
    fetchMakers().catch(() => []),
    fetchPostList(5).catch(() => ({ results: [] }))
  ]);

  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = Number(productData?.count) || 0;
  const makersData = Array.isArray(makersRes) ? makersRes : (makersRes as any)?.results || [];
  const wpPosts = Array.isArray(postsRes) ? postsRes : (postsRes as any)?.results || [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* 💡 Sidebar Node */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            <Sidebar 
                makers={makersData} 
                recentPosts={wpPosts.map((p: any) => ({
                    id: p.id?.toString(),
                    title: p.title?.rendered || p.title,
                    slug: p.slug
                }))} 
            />
          </div>
        </aside>

        {/* 💡 Main Archive Node */}
        <main className={styles.mainContent}>
          
          <header className={styles.headerSection}>
            <div className={styles.titleGroup}>
              <div className={styles.systemLabel}>
                <span className={styles.pulse} /> System_Archive_Node
              </div>
              <h1 className={styles.mainTitle}>
                {currentSource || 'GLOBAL'} <span className={styles.titleAccent}>/</span> ARCHIVE
              </h1>
              <div className={styles.statusInfo}>
                <span>Status: <span className={styles.statusOnline}>Online</span></span>
                <span>Records: <span className={styles.statusValue}>{totalCount.toLocaleString()} Units</span></span>
              </div>
            </div>

            <div className={styles.controls}>
              <nav className={styles.filterNav}>
                {SOURCE_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={{ pathname: '/videos', query: { ...searchParams, api_source: opt.value, offset: 0 } }}
                    className={`${styles.navLink} ${currentSource === opt.value ? styles.navLinkActive : ''}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </nav>

              <nav className={styles.filterNav}>
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={{ pathname: '/videos', query: { ...searchParams, ordering: opt.value, offset: 0 } }}
                    className={`${styles.navLink} ${currentOrdering === opt.value ? styles.navLinkSortActive : ''}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <Suspense fallback={<VideoGridSkeleton />}>
            <div className={styles.productGrid}>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-40 text-center border border-dashed border-white/5 bg-white/[0.01]">
                  <p className="text-gray-700 font-black tracking-[0.5em] uppercase text-xs">Signal_Lost: No_Records_Found</p>
                </div>
              )}
            </div>
          </Suspense>

          {totalCount > LIMIT && (
            <div className={styles.paginationArea}>
              <Pagination
                currentOffset={currentOffset}
                limit={LIMIT}
                totalCount={totalCount}
                basePath="/videos"
                extraParams={{ ordering: currentOrdering, api_source: currentSource, maker__slug: currentMakerSlug }}
              />
              <div className={styles.pageStatus}>
                Synchronizing Node: Page {Math.floor(currentOffset / LIMIT) + 1}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function VideoGridSkeleton() {
  return (
    <div className={styles.productGrid}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] bg-white/[0.02] border border-white/5 animate-pulse" />
          <div className="h-2 w-full bg-white/[0.02] animate-pulse" />
        </div>
      ))}
    </div>
  );
}