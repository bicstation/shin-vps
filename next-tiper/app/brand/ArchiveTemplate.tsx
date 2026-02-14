'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './VideoArchive.module.css'; 
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

/**
 * 🛰️ UNIVERSAL_ARCHIVE_CORE
 * パンくずリスト & データフィルタリング機能を搭載した統合テンプレート
 */
export default function ArchiveTemplate({ 
  products = [], 
  totalCount = 0, 
  platform, // 'fanza' | 'dmm' | 'duga'
  title, 
  makers = [], 
  genres = [],
  recentPosts = [],
  currentSort, 
  currentOffset, 
  basePath, 
  category, // 追加: 'genre' | 'maker' 等
  id,       // 追加: カテゴリID
  extraParams = {} 
}: any) {
  
  const router = useRouter();
  const limit = 24;
  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;
  const [filterText, setFilterText] = useState('');

  // ソート切り替えハンドラ
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    router.push(`${basePath}?ordering=${newSort}`);
  };

  // クライアントサイドでの簡易絞り込み
  const filteredProducts = products.filter((p: any) => 
    p.title.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className={styles.pageWrapper} data-platform={platform}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* 🛡️ サイドバーセクション */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            <AdultSidebar 
              makers={makers} 
              genres={genres}
              recentPosts={recentPosts}
              product={products[0]} 
            />
          </div>
        </aside>

        {/* 🏗️ メインコンテンツセクション */}
        <main className={styles.mainContent}>
          
          {/* 🛰️ パンくずリスト (SYSTEM_PATH) */}
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.bcLink}>ROOT</Link>
            <span className={styles.bcDivider}>/</span>
            <Link href={`/brand/${platform}`} className={styles.bcLink}>{platform?.toUpperCase()}</Link>
            {category && (
              <>
                <span className={styles.bcDivider}>/</span>
                <span className={styles.bcActive}>{category.toUpperCase()}</span>
                <span className={styles.bcDivider}>:</span>
                <span className={styles.bcActive}>{id}</span>
              </>
            )}
          </nav>

          <header className={styles.headerSection}>
            <div className={styles.titleGroup}>
              <div className={styles.systemLabel}>
                <span className={styles.pulse} /> ARCHIVE_NODE: {platform?.toUpperCase()}
              </div>
              <h1 className={styles.mainTitle}>
                {title} <span className={styles.titleAccent}>/</span> RECORDS
              </h1>
              <div className={styles.statusInfo}>
                <span>ENTRIES: <span className={styles.statusValue}>{totalCount.toLocaleString()}</span></span>
              </div>
            </div>

            {/* 🔍 フィルター & ソートバー */}
            <div className={styles.filterControl}>
              <div className={styles.searchField}>
                <label className={styles.fieldLabel}>STREAM_FILTER</label>
                <input 
                  type="text" 
                  placeholder="KEYWORDS..." 
                  className={styles.filterInput}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <div className={styles.sortField}>
                <label className={styles.fieldLabel}>SORT_PROTOCOL</label>
                <select 
                  className={styles.selectInput} 
                  value={currentSort || 'new'} 
                  onChange={handleSortChange}
                >
                  <option value="new">🆕 NEW_RECORDS</option>
                  <option value="popular">🔥 POPULARITY</option>
                  <option value="review">⭐ RATING</option>
                </select>
              </div>
            </div>
          </header>

          {/* 📦 作品グリッド表示 */}
          <div className={styles.productGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <ProductCard 
                  key={`${product.api_source || platform}-${product.id}`} 
                  product={product} 
                />
              ))
            ) : (
              <div className={styles.noData}>[!] DATA_STREAM_NOT_FOUND_IN_CURRENT_FILTER</div>
            )}
          </div>

          {/* 🔢 ページネーションユニット */}
          {totalCount > limit && (
            <div className={styles.paginationArea}>
              <Pagination
                currentOffset={currentOffset}
                limit={limit}
                totalCount={totalCount}
                basePath={basePath}
                extraParams={{ ...extraParams, ordering: currentSort }}
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