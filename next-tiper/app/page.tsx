/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ CSS Modules & 共通コンポーネント
import styles from './page.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar'; // ブランドページと同一の高性能Sidebar
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { getUnifiedProducts, fetchMakers, fetchGenres } from '@shared/lib/api/django/adult';
import { WPPost, AdultProduct } from '@shared/lib/api/types';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 60; 

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
  return constructMetadata(
    "TIPER Live | プレミアム・アーカイブ",
    "DUGA・FANZA・DMMの全アーカイブをAI解析。統合デジタルアーカイブ。",
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
  // --- 1. データフェッチの最適化 ---
  // 不安定さを解消するため、各ソースから個別に取得するロジックへアップグレード
  const [
    wpData, 
    mRes, 
    gRes,
    fanzaRes,
    dugaRes,
    dmmRes,
    unifiedStats // 統計用
  ] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [], count: 0 })),
    fetchMakers({ limit: 20, ordering: '-product_count' }).catch(() => []),
    fetchGenres({ limit: 20, ordering: '-product_count' }).catch(() => []),
    // 三種の神器をそれぞれ確実に4件ずつ取得
    getUnifiedProducts({ limit: 4, api_source: 'FANZA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DUGA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DMM', ordering: '-release_date' }).catch(() => ({ results: [] })),
    // 全体件数取得用
    getUnifiedProducts({ limit: 1 }).catch(() => ({ count: 0 }))
  ]);

  // --- 2. データの整形 (ブランドページのロジックを適用) ---
  const makersData = Array.isArray(mRes) ? mRes : (mRes as any)?.results || [];
  const latestPosts = (wpData?.results || []) as WPPost[];
  const totalCount = unifiedStats?.count || 0;

  // 各プラットフォームのデータを抽出
  const fanzaProducts = (fanzaRes?.results || []) as AdultProduct[];
  const dugaProducts = (dugaRes?.results || []) as AdultProduct[];
  const dmmProducts = (dmmRes?.results || []) as AdultProduct[];

  const isApiConnected = fanzaProducts.length > 0 || dugaProducts.length > 0;

  // --- 3. セクションレンダラー ---
  const renderPlatformSection = (title: string, items: AdultProduct[], source: string) => (
    <section className={styles.platformSection} key={source}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.pulseDot} />
          <h2 className={styles.platformTitle}>{title} <span className={styles.titleThin}>/LATEST_FEED</span></h2>
        </div>
        <Link href={`/brand/${source.toLowerCase()}`} className={styles.headerLink}>
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
          {/* 🏗️ 2. サイドバー (ブランドページと統一) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              {/* クイック・ネットワーク・アクセス */}
              <div className={styles.networkSelect}>
                <h3 className={styles.sidebarLabel}>NETWORK_SELECT</h3>
                <div className={styles.networkGrid}>
                  {['FANZA', 'DMM', 'DUGA'].map((b) => (
                    <Link key={b} href={`/brand/${b.toLowerCase()}`} className={styles.networkBtn}>
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* マスターデータ・サイドバー */}
              <div className={styles.sidebarMain}>
                <Sidebar 
                  makers={makersData} 
                  recentPosts={latestPosts.map(p => ({
                    id: p.id.toString(),
                    title: decodeHtml(p.title.rendered),
                    slug: p.slug
                  }))} 
                />
              </div>

              {!isApiConnected && (
                <div className={styles.errorBox}>
                  [!] CRITICAL: DATA_STREAM_INTERRUPTED.
                </div>
              )}
            </div>
          </aside>

          {/* 🏗️ 3. メインコンテンツ・ストリーム */}
          <div className={styles.contentStream}>
            
            {/* A: Intelligence Reports (WP) */}
            {latestPosts.length > 0 && (
              <section className={styles.newsSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
                  <Link href="/news" className={styles.headerLink}>FULL_REPORT →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {latestPosts.slice(0, 3).map((post) => (
                    <Link key={post.id} href={`/news/${post.slug}`} className={styles.newsCard}>
                      <div className={styles.newsThumbWrap}>
                        <img
                          src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/api/placeholder/400/225'}
                          alt={post.title?.rendered}
                          className={styles.newsThumb}
                        />
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

            {/* B: 三種の神器 - 統合アーカイブ (個別取得による安定化) */}
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
                  <div className={styles.glitchText}>SYNCHRONIZING_MATRIX_NODES...</div>
                </div>
              )}
            </div>

            {/* C: 全件エントリー */}
            <div className={styles.footerAction}>
              <Link href="/videos" className={styles.megaTerminalBtn}>
                <span className={styles.btnGlitch}>ACCESS_FULL_REGISTRY</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}