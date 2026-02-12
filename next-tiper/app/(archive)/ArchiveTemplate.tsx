'use client';

import React from 'react';
import Link from 'next/link';
import styles from './VideoArchive.module.css'; // 既存の共通CSS
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

export default function ArchiveTemplate({ 
  products, 
  totalCount, 
  platform, // 'dmm' | 'fanza' | 'duga'
  title, 
  makers, 
  genres,
  recentPosts,
  currentSort, 
  currentOffset, 
  basePath, 
  extraParams = {} 
}: any) {
  
  const limit = 24;
  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;

  return (
    // data-platform 属性を使って、CSS側でテーマカラー（赤/青/緑）を切り替える
    <div className={styles.pageWrapper} data-platform={platform}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* 💡 共通サイドバー */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            <AdultSidebar 
              makers={makers} 
              genres={genres}
              recentPosts={recentPosts}
              product={products[0]} // 解析ロジック用
            />
          </div>
        </aside>

        <main className={styles.mainContent}>
          {/* 💡 共通ヘッダー */}
          <header className={styles.headerSection}>
            <div className={styles.titleGroup}>
              <div className={styles.systemLabel}>
                <span className={styles.pulse} /> ARCHIVE_NODE: {platform?.toUpperCase()}
              </div>
              <h1 className={styles.mainTitle}>
                {title} <span className={styles.titleAccent}>/</span> RECORDS
              </h1>
              <div className={styles.statusInfo}>
                <span>Records: <span className={styles.statusValue}>{totalCount.toLocaleString()}</span></span>
              </div>
            </div>
            
            {/* ソートボタンなどはここに共通化して配置 */}
          </header>

          {/* 💡 作品グリッド */}
          <div className={styles.productGrid}>
            {products.map((product: any) => (
              <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
            ))}
          </div>

          {/* 💡 共通ページネーション */}
          {totalCount > limit && (
            <div className={styles.paginationArea}>
              <Pagination
                currentOffset={currentOffset}
                limit={limit}
                totalCount={totalCount}
                basePath={basePath}
                extraParams={{ ...extraParams, sort: currentSort }}
              />
              <div className={styles.pageStatus}>
                PAGE {displayCurrentPage} OF {displayTotalPages}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}