'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Archive.module.css'; 
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

/**
 * ArchiveTemplate
 * 物理的なレイアウトハック機能を搭載し、二重サイドバーを強制排除。
 * さらに、ページ遷移時に元のレイアウトへ「復元」する安全装置付き。
 */
export default function ArchiveTemplate({ 
  products = [], 
  totalCount = 0, 
  platform, 
  title, 
  currentSort = '-release_date', 
  currentPage = 1, 
  basePath, 
  category, 
  id,
  extraParams = {},
  // --- サイドバーへの指令データ ---
  officialHierarchy = [],
  makers = [],
  genres = [],
  actresses = [],
  authors = [],
  series = [],
  directors = [],
  labels = [],
  recentPosts = []
}: any) {
  
  const limit = 24;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;
  const [filterText, setFilterText] = useState('');

  // ---------------------------------------------------------------------------
  // 🚨 LAYOUT_HACK_PROTOCOL: ページ表示時に消し、離れる時に必ず「復元」する
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // 復元のために変更前の要素と値を保持しておく配列
    const restoreTargets: {
      parent: HTMLElement;
      aside: HTMLElement;
      originalDisplay: string;
      originalGrid: string;
      originalWidth: string;
    }[] = [];

    // 1. 共通レイアウトが生成している「外側のサイドバー」を特定して非表示にする
    const mainTags = document.querySelectorAll('main');
    mainTags.forEach((main) => {
      // Archive.module.css の中身ではない「外側の枠」を探す
      if (!main.className.includes('Archive_mainContent')) {
        const parent = main.parentElement;
        const aside = main.previousElementSibling;

        if (parent && aside && aside.tagName === 'ASIDE') {
          const asideHtml = aside as HTMLElement;

          // 復元用データをバックアップ
          restoreTargets.push({
            parent,
            aside: asideHtml,
            originalDisplay: parent.style.display,
            originalGrid: parent.style.gridTemplateColumns,
            originalWidth: parent.style.width
          });

          // 🛠️ アーカイブページ専用：親のGridを破壊して全幅化
          parent.style.display = 'block';
          parent.style.gridTemplateColumns = 'none';
          parent.style.width = '100%';

          // 🛠️ 外側のサイドバーを物理的に隠す
          asideHtml.style.display = 'none';
          asideHtml.style.width = '0';
          asideHtml.style.visibility = 'hidden';
        }
      }
    });

    // 2. 🚨 重要：ページを離れる（アンマウント）時に実行されるクリーンアップ
    // これによりトップページに戻った時にサイドバーが復活します
    return () => {
      restoreTargets.forEach((target) => {
        target.parent.style.display = target.originalDisplay;
        target.parent.style.gridTemplateColumns = target.originalGrid;
        target.parent.style.width = target.originalWidth;

        target.aside.style.display = '';
        target.aside.style.width = '';
        target.aside.style.visibility = '';
      });
    };
  }, []);

  // デバッグモード判定
  const isDebug = extraParams.debug === 'true' || extraParams.debug === true;

  // プラットフォームごとのアクセントカラー設定
  const platformColors: Record<string, string> = {
    fanza: '#ff3366',
    dmm: '#ff9900',
    duga: '#00d1b2',
    video: '#e94560'
  };

  const accentColor = platformColors[platform] || platformColors.video;

  // クライアントサイドでの簡易フィルタリング
  const filteredProducts = products.filter((p: any) => 
    (p.title || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ 
        '--accent': accentColor, 
        '--accent-glow': `${accentColor}33` 
      } as React.CSSProperties}
      data-platform={platform}
    >
      <div className={styles.ambientGlow} />

      {/* 🛠️ DEBUG BAR */}
      {isDebug && (
        <div className="w-full bg-black/90 text-[10px] font-mono py-1 px-4 flex justify-between items-center border-b border-[var(--accent)] sticky top-0 z-[9999] backdrop-blur-md">
          <div className="flex gap-4 items-center">
            <span className="text-[var(--accent)] animate-pulse">● ARCHIVE_SCAN_ACTIVE</span>
            <span className="text-gray-400">PATH: {basePath}</span>
          </div>
        </div>
      )}

      {/* 🏗️ 構造の要: styles.container (Flexbox) */}
      <div className={styles.container}>
        
        {/* --- 🛰️ LEFT SIDEBAR AREA (このテンプレート自前のサイドバー) --- */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.stickySidebar}>
            <AdultSidebar 
              officialHierarchy={officialHierarchy}
              makers={makers}
              genres={genres}
              actresses={actresses}
              authors={authors}
              series={series}
              directors={directors}
              labels={labels}
              recentPosts={recentPosts}
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
                <Link href={`/brand/${platform}/cat/${category}`} className={styles.bcLink}>
                  {category.toUpperCase()}
                </Link>
                <span className={styles.bcDivider}>:</span>
                <span className={styles.bcActive}>
                  {id ? decodeURIComponent(id) : 'ALL'}
                </span>
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
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="FILTER_IN_PAGE..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="bg-black/40 border border-white/10 px-4 py-1.5 text-[11px] font-mono focus:outline-none focus:border-[var(--accent)] transition-all w-64 text-gray-300 outline-none"
                />
              </div>
            </div>
          </header>

          <div className={styles.productGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <div key={`${product.api_source}-${product.id}`}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-lg">
                <p className="font-mono text-gray-500 tracking-widest uppercase">
                  No data nodes found.
                </p>
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
        </main>
      </div>
    </div>
  );
}