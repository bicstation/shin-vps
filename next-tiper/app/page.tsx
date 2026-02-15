/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar/AdultSidebar'; 
import { getSiteMainPosts, getWpFeaturedImage } from '@shared/lib/api/wordpress';
import { 
  getUnifiedProducts, 
  getPlatformAnalysis,
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

/**
 * 💡 ユーティリティ: 日付フォーマット
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

/**
 * 🎬 メインホームコンポーネント
 */
export default async function Home() {
  // --- 1. データフェッチの並列実行 ---
  const [
    wpData, 
    analysisData, 
    fanzaRes,
    dugaRes,
    dmmRes
  ] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [] })),
    getPlatformAnalysis('UNIFIED', { 
      mode: 'summary', 
      limit: 15 
    }).catch((err) => {
      console.error("ANALYSIS_FETCH_FAILED:", err);
      return null;
    }),
    getUnifiedProducts({ limit: 4, api_source: 'FANZA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DUGA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DMM', ordering: '-release_date' }).catch(() => ({ results: [] })),
  ]);

  // --- 2. データの正規化 ---
  const latestPosts = wpData?.results || [];
  const fanzaProducts = fanzaRes?.results || [];
  const dugaProducts = dugaRes?.results || [];
  const dmmProducts = dmmRes?.results || [];

  /**
   * 💡 サイドバー抽出ヘルパー (修正版)
   * Djangoのレスポンスが直下か results 内か、どちらでも対応可能にする
   */
  const extractSidebarItems = (key: string) => {
    if (!analysisData) return [];

    // 直下にある場合、または results 内にある場合を探す
    const data = analysisData[key] || (analysisData.results && analysisData.results[key]);

    // データが配列ならそのまま返し、そうでなければ空配列を返す
    return Array.isArray(data) ? data : [];
  };

  const sidebarProps = {
    makers: extractSidebarItems('makers'),
    genres: extractSidebarItems('genres'),
    series: extractSidebarItems('series'),
    directors: extractSidebarItems('directors'),
    authors: extractSidebarItems('authors'),
    recentPosts: latestPosts.map((p: any) => ({
      id: p.id.toString(),
      title: decodeHtml(p.title?.rendered || ''),
      slug: p.slug
    }))
  };

  const isApiConnected = fanzaProducts.length > 0 || dugaProducts.length > 0 || dmmProducts.length > 0;

  /**
   * 🎬 セクションレンダラー
   */
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
          
          {/* 🏗️ 1. サイドバー (サーバーサイド・プロップス注入) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <div className={styles.sidebarMain}>
                {/* 💡 統計データをスプレッド展開で注入 */}
                <Sidebar {...sidebarProps} />
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

          {/* 🏗️ 2. メインコンテンツストリーム */}
          <div className={styles.contentStream}>
            
            {/* Intelligence Reports (WordPress Posts) */}
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
                          src={getWpFeaturedImage(post, 'large')}
                          alt=""
                          className={styles.newsThumb}
                        />
                        <div className={styles.newsOverlay} />
                      </div>
                      <div className={styles.newsContent}>
                        <span className={styles.newsDate} suppressHydrationWarning>
                          {formatDate(post.date)}
                        </span>
                        <h3 className={styles.newsTitle} suppressHydrationWarning>
                          {decodeHtml(post.title?.rendered)}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Archive Registry (Platform Sections) */}
            <div className={styles.archiveRegistry}>
              <div className={styles.registryHeader}>
                <h2 className={styles.registryMainTitle}>UNIFIED_DATA_STREAM</h2>
                <div className={styles.registryLine} />
              </div>

              {isApiConnected ? (
                <div className={styles.registryStack}>
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

            {/* CTA Final Terminal */}
            <div className={styles.footerAction}>
              <Link href="/videos" className={styles.megaTerminalBtn}>
                <span className={styles.btnText}>ACCESS_FULL_REGISTRY_DATABASE</span>
              </Link>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}