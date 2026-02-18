'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Archive.module.css'; 
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

// 💡 診断用コンポーネントのインポート
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export default function ArchiveTemplate({ 
  products = [], 
  totalCount = 0, 
  platform, 
  title, 
  officialHierarchy = [], 
  makers = [], 
  genres = [],
  series = [],
  directors = [],
  authors = [],
  recentPosts = [],
  currentSort = '-release_date', 
  currentPage = 1, 
  basePath, 
  category, 
  id,
  extraParams = {} 
}: any) {
  
  const router = useRouter();
  const limit = 24;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;
  const [filterText, setFilterText] = useState('');

  // 🐞 デバッグモード判定
  const isDebug = extraParams.debug === true;

  const platformColors: Record<string, string> = {
    fanza: '#ff3366',
    dmm: '#ff9900',
    duga: '#00d1b2',
    video: '#e94560'
  };

  const accentColor = platformColors[platform] || platformColors.video;
  const filteredProducts = products.filter((p: any) => 
    (p.title || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ '--accent': accentColor, '--accent-glow': `${accentColor}33` } as any}
      data-platform={platform}
    >
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            {/* 💡 AdultSidebarにデータを流し込む */}
            <AdultSidebar 
              officialHierarchy={officialHierarchy}
              makers={makers} 
              genres={genres}
              series={series}
              directors={directors}
              authors={authors}
              recentPosts={recentPosts}
              product={products[0]} 
            />
          </div>
        </aside>

        <main className={styles.mainContent}>
          {/* パンくず・ヘッダー・グリッド・ページネーション等は既存のまま維持 */}
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.bcLink}>ROOT</Link>
            <span className={styles.bcDivider}>/</span>
            <Link href={`/brand/${platform}`} className={styles.bcLink}>{platform?.toUpperCase()}</Link>
            {category && (
              <>
                <span className={styles.bcDivider}>/</span>
                <Link href={`/brand/${platform}/cat/${category}`} className={styles.bcLink}>{category.toUpperCase()}</Link>
                <span className={styles.bcDivider}>:</span>
                <span className={styles.bcActive}>{id ? decodeURIComponent(id) : 'ALL'}</span>
              </>
            )}
          </nav>

          <header className={styles.headerSection}>
            <div className={styles.titleGroup}>
              <h1 className={styles.titleMain}>{title}</h1>
              <div className={styles.statusInfo}>
                <span className={styles.statusLabel}>RECORDS:</span>
                <span className={styles.statusValue}>{totalCount.toLocaleString()}</span>
              </div>
            </div>
          </header>

          <div className={styles.productGrid}>
            {filteredProducts.map((product: any) => (
              <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
            ))}
          </div>

          {totalCount > limit && (
            <div className={styles.paginationArea}>
              <Pagination
                currentPage={currentPage}
                totalPages={displayTotalPages}
                baseUrl={basePath}
                query={{ sort: currentSort, ...extraParams }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}