'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import styles from './VideoArchive.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import Sidebar from '@shared/layout/Sidebar';
import { AdultProduct } from '@shared/lib/api/types';

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

export default function VideoArchiveView({ 
  productData, makersRes, postsRes, searchParams, 
  currentOffset, currentOrdering, currentSource, currentMakerSlug, limit 
}: any) {
  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = Number(productData?.count) || 0;
  const makersData = Array.isArray(makersRes) ? makersRes : (makersRes as any)?.results || [];
  const wpPosts = Array.isArray(postsRes) ? postsRes : (postsRes as any)?.results || [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
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

          {totalCount > limit && (
            <div className={styles.paginationArea}>
              <Pagination
                currentOffset={currentOffset}
                limit={limit}
                totalCount={totalCount}
                basePath="/videos"
                extraParams={{ ordering: currentOrdering, api_source: currentSource, maker__slug: currentMakerSlug }}
              />
              <div className={styles.pageStatus}>
                Synchronizing Node: Page {Math.floor(currentOffset / limit) + 1}
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