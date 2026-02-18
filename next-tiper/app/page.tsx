/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar/AdultSidebar'; 
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

import { getSiteMainPosts, getWpFeaturedImage } from '@shared/lib/api/wordpress';
import { 
  getUnifiedProducts, 
  fetchMakers, 
  fetchGenres, 
  fetchActresses, 
  fetchSeries 
} from '@shared/lib/api/django/adult'; // ✅ 共通APIからインポート
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
 * 💡 ユーティリティ: 文字列・日付処理
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
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * 🎬 メインホームコンポーネント
 */
export default async function Home(props: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const searchParams = await props.searchParams;
  const isDebugMode = searchParams.debug === 'true';

  // --- 1. データフェッチの並列実行 (最適化済み) ---
  // lib/api/django/adult.ts で定義した共通関数を使用することで、サイドバー表示の信頼性を確保
  const [
    wpData, 
    genresRes, 
    makersRes, 
    actressesRes,
    seriesRes,
    fanzaRes,
    dugaRes,
    dmmRes
  ] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [] })),
    fetchGenres({ limit: 15 }),
    fetchMakers({ limit: 15 }),
    fetchActresses({ limit: 15 }),
    fetchSeries({ limit: 15 }),
    getUnifiedProducts({ limit: 4, api_source: 'FANZA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DUGA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DMM', ordering: '-release_date' }).catch(() => ({ results: [] })),
  ]);

  const latestPosts = wpData?.results || [];
  
  // --- 2. データの正規化とサイドバーへの注入 ---
  // サイドバーが必要とする型に整形。api_source等の欠損を防ぎます。
  const sidebarProps = {
    genres: genresRes?.results || [],
    makers: makersRes?.results || [],
    actresses: actressesRes?.results || [],
    series: seriesRes?.results || [],
    labels: [], // 必要に応じて追加
    directors: [],
    authors: [],
    recentPosts: latestPosts.map((p: any) => ({
      id: p.id.toString(),
      title: decodeHtml(p.title?.rendered || ''),
      slug: p.slug
    }))
  };

  const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0 || (dmmRes?.results?.length || 0) > 0;

  /**
   * 🎬 プラットフォーム別セクションレンダラー
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
    <>
      <div className={styles.pageContainer}>
        {isDebugMode && (
          <SystemDiagnosticHero 
            id="V1.4_UNIFIED_LIB_INTEGRATED" 
            source="DJANGO_ADULT_LIB" 
            rawJson={{ genresRes, makersRes, actressesRes, seriesRes }} 
          />
        )}

        <main className={styles.main}>
          <div className={styles.wrapper}>
            
            {/* 🏗️ 1. サイドバー (共通ライブラリからのデータを確実に注入) */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <div className={styles.sidebarMain}>
                  <Sidebar {...sidebarProps} />
                </div>

                {!isApiConnected && (
                  <div className={styles.errorBox}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <div className={styles.errorText}>
                      <strong>CORE_OFFLINE:</strong>
                      <span>DATA_STREAM_INTERRUPTED.</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* 🏗️ 2. メインコンテンツストリーム */}
            <div className={styles.contentStream}>
              
              {/* Intelligence Reports (WordPress) */}
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
                            alt={decodeHtml(post.title?.rendered)} 
                            className={styles.newsThumb} 
                          />
                          <div className={styles.newsOverlay} />
                        </div>
                        <div className={styles.newsContent}>
                          <span className={styles.newsDate} suppressHydrationWarning>{formatDate(post.date)}</span>
                          <h3 className={styles.newsTitle} suppressHydrationWarning>
                            {decodeHtml(post.title?.rendered)}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Archive Registry (Django Unified) */}
              <div className={styles.archiveRegistry}>
                <div className={styles.registryHeader}>
                  <h2 className={styles.registryMainTitle}>UNIFIED_DATA_STREAM</h2>
                  <div className={styles.registryLine} />
                </div>

                {isApiConnected ? (
                  <div className={styles.registryStack}>
                    {fanzaRes?.results?.length > 0 && renderPlatformSection("FANZA", fanzaRes.results, "FANZA")}
                    {dugaRes?.results?.length > 0 && renderPlatformSection("DUGA", dugaRes.results, "DUGA")}
                    {dmmRes?.results?.length > 0 && renderPlatformSection("DMM", dmmRes.results, "DMM")}
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
    </>
  );
}