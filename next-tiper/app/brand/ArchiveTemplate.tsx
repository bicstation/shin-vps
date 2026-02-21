'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Archive.module.css'; 
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

// 💡 診断用コンポーネント
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
  actresses = [], // 💡 女優リスト
  authors = [],   // 💡 著者リスト
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
  const isDebug = extraParams.debug === 'true' || extraParams.debug === true;

  const platformColors: Record<string, string> = {
    fanza: '#ff3366', // PINK
    dmm: '#ff9900',   // ORANGE
    duga: '#00d1b2',  // TEAL
    video: '#e94560'  // CRIMSON
  };

  const accentColor = platformColors[platform] || platformColors.video;

  // 💡 ページ内フィルタリング
  const filteredProducts = products.filter((p: any) => 
    (p.title || '').toLowerCase().includes(filterText.toLowerCase())
  );

  // 🚀 【修正ポイント】
  // 代用ロジックを削除し、それぞれ独立したデータとして扱います。
  // サイドバー側（AdultSidebar）が actresses と authors の両方を受け取れるよう調整。
  // もし AdultSidebar が一つしか受け取れない古い設計の場合は、明示的に区別して渡します。

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ '--accent': accentColor, '--accent-glow': `${accentColor}33` } as any}
      data-platform={platform}
    >
      <div className={styles.ambientGlow} />

      {/* 🛠️ DEBUG TOP BAR (?debug=true 時のみ) */}
      {isDebug && (
        <div className="w-full bg-black/80 text-[10px] font-mono py-1 px-4 flex justify-between items-center border-b border-[var(--accent)] sticky top-0 z-[9999] backdrop-blur-md">
          <div className="flex gap-4 items-center">
            <span className="text-[var(--accent)] animate-pulse">● ARCHIVE_SCAN_ACTIVE</span>
            <span className="text-gray-400">PATH: {basePath}</span>
            <span className="text-gray-400">CATEGORY: {category || 'ALL'}</span>
          </div>
          <div className="text-[var(--accent)] opacity-70">
            LOADED_NODES: {products.length} / {totalCount}
          </div>
        </div>
      )}

      {/* 📡 システム診断パネル (debug=true時のみ表示) */}
      {isDebug && (
        <div className="bg-black/40 border-b border-white/5">
          <SystemDiagnosticHero 
            id={id || platform} 
            source={platform} 
            data={{ 
              totalCount, 
              currentPage, 
              productsCount: products.length,
              actressesIn: actresses.length,
              authorsIn: authors.length,
              seriesIn: series.length
            }} 
            rawJson={{
              first_product: products[0],
              hierarchy_sample: officialHierarchy[0],
              actress_sample: actresses[0],
              author_sample: authors[0]
            }}
          />
        </div>
      )}

      <div className={styles.container}>
        {/* --- 🛰️ SIDEBAR AREA --- */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            <AdultSidebar 
              officialHierarchy={officialHierarchy}
              makers={makers} 
              genres={genres}
              series={series}
              directors={directors}
              // 🚀 修正: それぞれ正しいデータを渡す
              actresses={actresses} 
              authors={authors} 
              recentPosts={recentPosts}
              product={products[0]} 
            />
          </div>
        </aside>

        {/* --- 🚀 MAIN CONTENT AREA --- */}
        <main className={styles.mainContent}>
          
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
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase opacity-80">
                  Data Stream: {platform}
                </span>
              </div>
              <h1 className={styles.titleMain}>{title}</h1>
              <div className={styles.statusInfo}>
                <span className={styles.statusLabel}>RECORDS_DETECTED:</span>
                <span className={styles.statusValue}>{totalCount.toLocaleString()}</span>
                <div className="ml-4 h-4 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                <span className={styles.statusLabel + " hidden md:inline"}>STATUS:</span>
                <span className={styles.statusValue + " hidden md:inline text-green-500"}>SYNCED</span>
              </div>
            </div>

            {/* クイックフィルタ */}
            <div className="mt-8 flex justify-end">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="FILTER_IN_PAGE..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="bg-black/40 border border-white/10 px-4 py-1.5 text-[11px] font-mono focus:outline-none focus:border-[var(--accent)] transition-all w-64 text-gray-300"
                />
                <div className="absolute bottom-0 left-0 h-[1px] bg-[var(--accent)] w-0 group-focus-within:w-full transition-all duration-300"></div>
              </div>
            </div>
          </header>

          {/* 商品グリッド */}
          <div className={styles.productGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <div key={`${product.api_source}-${product.id}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-lg">
                <p className="font-mono text-gray-500 tracking-widest uppercase">No matching data nodes found.</p>
              </div>
            )}
          </div>

          {/* ページネーション */}
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

          {/* デバッグ用 RAWデータ（最下部） */}
          {isDebug && (
            <div className="mt-20 p-4 bg-black/20 border border-white/5 rounded font-mono text-[9px] text-gray-600">
              <p className="mb-2 text-[var(--accent)] opacity-50">// RAW_QUERY_PARAMS</p>
              <pre>{JSON.stringify({ basePath, category, id, extraParams, actresses_count: actresses.length, authors_count: authors.length }, null, 2)}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}