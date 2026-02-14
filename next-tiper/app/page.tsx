/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar'; 
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { 
  getUnifiedProducts, 
  fetchMakers, 
  fetchGenres, 
  fetchSeries,   
  fetchDirectors, 
  fetchAuthors    
} from '@shared/lib/api/django/adult';
import { AdultProduct } from '@shared/lib/api/types';
import { constructMetadata } from '@shared/lib/metadata';

// Next.js 15 最適化設定
export const dynamic = 'force-dynamic';
export const revalidate = 60; 

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
  return constructMetadata(
    "TIPER Live | プレミアム・統合デジタルアーカイブ",
    "AI解析に基づいたFANZA・DUGA・DMMの全件横断アーカイブ。次世代のデジタルコンテンツ・レジストリ。",
    undefined,
    '/'
  );
}

/**
 * 💡 ユーティリティ: HTMLエスケープ解除
 */
const decodeHtml = (html: string) => {
  if (!html) return '';
  const map: { [key: string]: string } = {
    '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>'
  };
  return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
};

/**
 * 🎬 メインホームコンポーネント
 */
export default async function Home() {
  // --- 1. データフェッチの並列実行 (Djangoバックエンドへの集約リクエスト) ---
  const [
    wpData, 
    mRes, 
    gRes,
    sRes, 
    dirRes, 
    autRes, 
    fanzaRes,
    dugaRes,
    dmmRes
  ] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [] })),
    fetchMakers({ limit: 12, ordering: '-product_count' }).catch(() => []),
    fetchGenres({ limit: 12, ordering: '-product_count' }).catch(() => []),
    fetchSeries({ limit: 12, ordering: '-product_count' }).catch(() => []), 
    fetchDirectors({ limit: 12, ordering: '-product_count' }).catch(() => []),
    fetchAuthors({ limit: 12, ordering: '-product_count' }).catch(() => []),
    getUnifiedProducts({ limit: 4, api_source: 'FANZA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DUGA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DMM', ordering: '-release_date' }).catch(() => ({ results: [] })),
  ]);

  // --- 2. データの正規化 (空配列保証) ---
  const normalizeData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.results && Array.isArray(res.results)) return res.results;
    return [];
  };

  const makersData = normalizeData(mRes);
  const genresData = normalizeData(gRes);
  const seriesData = normalizeData(sRes);
  const directorsData = normalizeData(dirRes);
  const authorsData = normalizeData(autRes);
  const latestPosts = normalizeData(wpData);
  
  const fanzaProducts = normalizeData(fanzaRes);
  const dugaProducts = normalizeData(dugaRes);
  const dmmProducts = normalizeData(dmmRes);

  const isApiConnected = fanzaProducts.length > 0 || dugaProducts.length > 0;

  // --- 3. セクションレンダラー (再利用可能なUIパーツ) ---
  const renderPlatformSection = (title: string, items: AdultProduct[], source: string) => (
    <section className={styles.platformSection} key={source}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.pulseDot} />
          <h2 className={styles.platformTitle}>
            {title} <span className={styles.titleThin}>/LATEST_FEED</span>
          </h2>
        </div>
        <Link href={`/videos?source=${source.toUpperCase()}`} className={styles.headerLink}>
          EXPLORE_ARCHIVE →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => (
          <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.pageContainer}>
      <main className={styles.main}>
        <div className={styles.wrapper}>
          
          {/* 🏗️ サイドバー (Djangoから取得した全6カテゴリのマスターデータを注入) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <div className={styles.sidebarMain}>
                <Sidebar 
                  makers={makersData} 
                  genres={genresData}
                  series={seriesData}
                  directors={directorsData}
                  authors={authorsData}
                  recentPosts={latestPosts.map((p: any) => ({
                    id: p.id.toString(),
                    title: decodeHtml(p.title?.rendered || ''),
                    slug: p.slug
                  }))} 
                />
              </div>

              {!isApiConnected && (
                <div className={styles.errorBox}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <div className={styles.errorText}>
                    <strong>CRITICAL_ERROR:</strong>
                    <span>DATA_STREAM_INTERRUPTED. PLEASE_REFRESH.</span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* 🏗️ メインコンテンツエリア */}
          <div className={styles.contentStream}>
            
            {/* 1. Intelligence Reports (WordPress ニュース) */}
            {latestPosts.length > 0 && (
              <section className={styles.newsSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleGroup}>
                    <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
                  </div>
                  <Link href="/news" className={styles.headerLink}>VIEW_ALL_REPORTS →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {latestPosts.slice(0, 3).map((post: any) => (
                    <Link key={post.id} href={`/news/${post.slug}`} className={styles.newsCard}>
                      <div className={styles.newsThumbWrap}>
                        <img
                          src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.jpg'}
                          alt={post.title?.rendered}
                          className={styles.newsThumb}
                        />
                        <div className={styles.newsOverlay} />
                      </div>
                      <div className={styles.newsContent}>
                        <span className={styles.newsDate}>{formatDate(post.date)}</span>
                        <h3 className={styles.newsTitle}>{decodeHtml(post.title?.rendered)}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Unified Data Stream (Django 統合製品) */}
            <div className={styles.archiveRegistry}>
              <div className={styles.registryHeader}>
                <h2 className={styles.registryMainTitle}>UNIFIED_DATA_STREAM</h2>
                <div className={styles.registryLine} />
              </div>

              {isApiConnected ? (
                <div className={styles.registryStack}>
                  {/* 各プラットフォームの最新フィードを表示 */}
                  {fanzaProducts.length > 0 && renderPlatformSection("FANZA", fanzaProducts, "FANZA")}
                  {dugaProducts.length > 0 && renderPlatformSection("DUGA", dugaProducts, "DUGA")}
                  {dmmProducts.length > 0 && renderPlatformSection("DMM", dmmProducts, "DMM")}
                </div>
              ) : (
                <div className={styles.loadingArea}>
                  <div className={styles.glitchBox}>
                    <div className={styles.glitchText}>SYNCHRONIZING_MATRIX_NODES...</div>
                    <div className={styles.scanningLine} />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Footer Action */}
            <div className={styles.footerAction}>
              <Link href="/videos" className={styles.megaTerminalBtn}>
                <span className={styles.btnScanline} />
                <span className={styles.btnText}>ACCESS_FULL_REGISTRY_DATABASE</span>
              </Link>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}