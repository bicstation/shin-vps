/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';
import ProductCard from '@/shared/cards/AdultProductCard';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

import { getSiteMainPosts, getWpFeaturedImage } from '@/shared/lib/api/wordpress';
import { getUnifiedProducts } from '@/shared/lib/api/django/adult'; 
import { AdultProduct } from '@/shared/lib/api/types';
import { constructMetadata } from '@/shared/lib/metadata';

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
 * 💡 ユーティリティ: 特殊文字デコード & 日付フォーマット
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

  // --- 1. データ取得 (コンテンツに必要な分だけを最小限に取得) ---
  const [
    wpData, 
    fanzaRes,
    dugaRes,
    dmmRes
  ] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'FANZA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DUGA', ordering: '-release_date' }).catch(() => ({ results: [] })),
    getUnifiedProducts({ limit: 4, api_source: 'DMM', ordering: '-release_date' }).catch(() => ({ results: [] })),
  ]);

  const latestPosts = wpData?.results || [];
  
  const isApiConnected = 
    (fanzaRes?.results?.length || 0) > 0 || 
    (dugaRes?.results?.length || 0) > 0 || 
    (dmmRes?.results?.length || 0) > 0;

  /**
   * 🎬 プラットフォーム別セクションレンダラー
   */
  const renderPlatformSection = (title: string, items: AdultProduct[], source: string) => (
    <section className={styles.platformSection} key={source}>
      <div className={styles.platformTitle}>
        {title} <span className={styles.titleThin}>/LATEST_NODES</span>
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
      {isDebugMode && (
        <SystemDiagnosticHero 
          id="V1.9_FINAL_ZENITH" 
          source="CORE_DATA_STREAM" 
          rawJson={{ 
            fanzaCount: fanzaRes?.results?.length,
            wpCount: latestPosts.length
          }} 
        />
      )}

      {/* 🏗️ コンテンツストリーム (Layout側の grid-area: 1fr に流し込まれる) */}
      <div className={styles.contentStream}>
        
        {/* 📰 Intelligence Reports (WordPress連携) */}
        {latestPosts.length > 0 && (
          <section className={styles.newsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
              <Link href="/news" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
            </div>
            <div className={styles.newsGrid}>
              {latestPosts.slice(0, 3).map((post: any) => (
                <Link key={post.id} href={`/news/${post.slug}`} className={styles.newsCard}>
                  <div className={styles.newsThumbWrap}>
                    <img 
                      src={getWpFeaturedImage(post, 'large')} 
                      alt={decodeHtml(post.title?.rendered)} 
                      className={styles.newsThumb} 
                    />
                  </div>
                  <div className={styles.newsContent}>
                    <span className={styles.newsDate}>{formatDate(post.date)}</span>
                    <h3 className={styles.newsTitle}>
                      {decodeHtml(post.title?.rendered)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 📀 Archive Registry (メインデータストリーム) */}
        <div className={styles.archiveRegistry}>
          <div className={styles.registryHeader}>
            <h1 className={styles.registryMainTitle}>
              UNIFIED_DATA_STREAM
              <span className={styles.titleThin}>ZENITH_REGISTRY_v2.0</span>
            </h1>
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
                <div className={styles.glitchText}>SYNCHRONIZING_DATABASE...</div>
              </div>
            </div>
          )}
        </div>

        {/* 🔘 ターミナル風 CTA */}
        <div className={styles.footerAction}>
          <Link href="/videos" className={styles.megaTerminalBtn}>
            ACCESS_FULL_REGISTRY_DATABASE
          </Link>
        </div>
      </div>
    </div>
  );
}