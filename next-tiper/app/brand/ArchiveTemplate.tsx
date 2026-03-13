'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Archive.module.css'; 

/**
 * ✅ STRUCTURE v3.2 物理パス準拠
 * shared/components/organisms/cards/AdultProductCard.tsx
 * shared/components/molecules/Pagination.tsx
 * shared/layout/Sidebar/AdultSidebar.tsx
 */
import ProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import AdultSidebar from '@/shared/layout/Sidebar/AdultSidebar';

/**
 * 💡 翻訳・表示設定
 */
const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  actress: '出演者',
  genre: 'ジャンル',
  series: 'シリーズ',
  maker: 'メーカー',
  director: '監督',
  author: '著者',
};

const WORD_TRANSLATE_MAP: Record<string, string> = {
  'nikkatsu': '日活ロマンポルノ',
  'videoa': 'ビデオ',
  'videoc': '素人',
  'digital': 'デジタル',
  'anime': 'アニメ',
  'pc': 'PCソフト',
  'book': '電子書籍',
};

interface ArchiveTemplateProps {
  products?: any[];
  totalCount?: number;
  platform?: string;
  title?: string;
  currentSort?: string;
  currentPage?: number;
  basePath?: string;
  category?: string;
  id?: string;
  extraParams?: Record<string, any>;
  officialHierarchy?: any[];
  makers?: any[];
  genres?: any[];
  actresses?: any[];
  authors?: any[];
  series?: any[];
  directors?: any[];
  labels?: any[];
  recentPosts?: any[];
}

export default function ArchiveTemplate({ 
  products = [], 
  totalCount = 0, 
  platform = 'video', 
  title = '', 
  currentSort = '-release_date', 
  currentPage = 1, 
  basePath = '', 
  category = '', 
  id = '',
  extraParams = {},
  officialHierarchy = [],
  makers = [],
  genres = [],
  actresses = [],
  authors = [],
  series = [],
  directors = [],
  labels = [],
  recentPosts = []
}: ArchiveTemplateProps) {
  
  const limit = 24;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;
  const [filterText, setFilterText] = useState('');

  /**
   * 🚨 LAYOUT_HACK_PROTOCOL (Next.js App Router Sidebar Isolation)
   * 既存のグローバルサイドバーが干渉する場合、それを非表示にしてアーカイブ専用空間を確保します。
   */
  useEffect(() => {
    const restoreTargets: {
      parent: HTMLElement;
      aside: HTMLElement;
      originalDisplay: string;
      originalGrid: string;
      originalWidth: string;
    }[] = [];
    
    const mainTags = document.querySelectorAll('main');

    mainTags.forEach((main) => {
      // 自身のコンポーネント（Archive_mainContent）以外を対象にする
      if (!main.className.includes('mainContent')) {
        const parent = main.parentElement;
        const aside = main.previousElementSibling;

        if (parent && aside && aside.tagName === 'ASIDE') {
          const asideHtml = aside as HTMLElement;
          restoreTargets.push({
            parent,
            aside: asideHtml,
            originalDisplay: parent.style.display,
            originalGrid: parent.style.gridTemplateColumns,
            originalWidth: parent.style.width
          });

          // レイアウトの上書き
          parent.style.display = 'block';
          parent.style.gridTemplateColumns = 'none';
          parent.style.width = '100%';
          asideHtml.style.display = 'none';
          asideHtml.style.width = '0';
          asideHtml.style.visibility = 'hidden';
        }
      }
    });

    return () => {
      restoreTargets.forEach((t) => {
        t.parent.style.display = t.originalDisplay;
        t.parent.style.gridTemplateColumns = t.originalGrid;
        t.parent.style.width = t.originalWidth;
        t.aside.style.display = '';
        t.aside.style.width = '';
        t.aside.style.visibility = '';
      });
    };
  }, []);

  // アクセントカラーの動的解決
  const platformKey = platform.toLowerCase();
  const accentColor = {
    fanza: '#ff3366',
    dmm: '#ff9900',
    duga: '#00d1b2',
    video: '#e94560'
  }[platformKey as keyof typeof accentColor] || '#e94560';

  // タイトル翻訳
  let translatedTitle = title;
  Object.entries(WORD_TRANSLATE_MAP).forEach(([en, jp]) => {
    translatedTitle = translatedTitle.replace(new RegExp(en, 'gi'), jp);
  });

  const breadcrumbName = translatedTitle.includes(':') 
    ? translatedTitle.split(':')[1].trim() 
    : (id ? decodeURIComponent(id) : 'ALL');

  const categoryLabel = CATEGORY_DISPLAY_LABELS[category] || (category ? category.toUpperCase() : '');

  // クライアントサイドフィルタリング
  const filteredProducts = products.filter((p: any) => 
    (p.title || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ '--accent': accentColor, '--accent-glow': `${accentColor}33` } as React.CSSProperties}
    >
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* --- 🛰️ SIDEBAR (アーカイブ専用) --- */}
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

        {/* --- 🚀 MAIN STREAM --- */}
        <main className={styles.mainContent}>
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.bcLink}>ROOT</Link>
            <span className={styles.bcDivider}>/</span>
            <Link href={`/brand/${platform}`} className={styles.bcLink}>{platform?.toUpperCase()}</Link>
            {category && (
              <>
                <span className={styles.bcDivider}>/</span>
                <Link href={`/brand/${platform}/cat/${category}`} className={styles.bcLink}>{categoryLabel}</Link>
                <span className={styles.bcDivider}>/</span>
                <span className={styles.bcActive}>{breadcrumbName}</span>
              </>
            )}
          </nav>

          <header className={styles.headerSection}>
            <div className={styles.titleGroup}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase opacity-80">
                  Matrix Stream: {platform}
                </span>
              </div>
              <h1 className={styles.titleMain}>{translatedTitle}</h1>
              <div className={styles.statusInfo}>
                <span className={styles.statusLabel}>RECORDS:</span>
                <span className={styles.statusValue}>{totalCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <div className={styles.filterContainer}>
                <input 
                  type="text"
                  placeholder="FILTER_NODES..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
            </div>
          </header>

          {/* 🖼️ アーカイブグリッド */}
          
          <div className={styles.productGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <ProductCard key={`${product.api_source || 'adult'}-${product.id}`} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-30 font-mono italic">
                -- NO_MATCHING_NODES_FOUND --
              </div>
            )}
          </div>

          {/* 💡 ページネーション */}
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