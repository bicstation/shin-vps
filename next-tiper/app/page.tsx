/* /app/page.tsx */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';

/**
 * 🛰️ コンポーネント・インポート
 */
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';
import SystemDiagnosticHero from '@shared/components/molecules/SystemDiagnosticHero';

/**
 * 🛰️ API・ロジック・インポート
 * 💡 徹底除去: getWpFeaturedImage はもう存在しないため、インポートリストから削除しました。
 */
import { getSiteMainPosts } from '@shared/lib/api/django-bridge';
import { getUnifiedProducts } from '@shared/lib/api/django/adult'; 
import { constructMetadata } from '@shared/lib/utils/metadata';

// Next.js 15 最適化設定
export const dynamic = 'force-dynamic';
export const revalidate = 60; 

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
    return constructMetadata({
        title: "TIPER Live | プレミアム・統合デジタルアーカイブ",
        description: "AI解析に基づいたFANZA・DUGA・DMMの全件横断アーカイブ。",
        canonical: '/'
    });
}

/**
 * 💡 ユーティリティ
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
    // Next.js 15: searchParams と headers は await が必要
    const searchParams = await props.searchParams;
    const isDebugMode = searchParams.debug === 'true';

    const head = await headers();
    const host = head.get('host') || 'localhost';

    // --- 1. データ取得 (並列実行) ---
    const [
        wpData, 
        fanzaRes,
        dugaRes,
        dmmRes
    ] = await Promise.all([
        getSiteMainPosts(0, 6).catch(() => ({ results: [] })),
        getUnifiedProducts({ api_source: 'FANZA', limit: 4 }).catch(() => ({ results: [] })),
        getUnifiedProducts({ api_source: 'DUGA', limit: 4 }).catch(() => ({ results: [] })),
        getUnifiedProducts({ api_source: 'DMM', limit: 4 }).catch(() => ({ results: [] })),
    ]);

    // Django-Bridge v5.4 以降、MarkdownとAPI両方の結果が results に入ります
    const latestPosts = wpData?.results || [];
    
    const isApiConnected = 
        (fanzaRes?.results?.length || 0) > 0 || 
        (dugaRes?.results?.length || 0) > 0 || 
        (dmmRes?.results?.length || 0) > 0;

    /**
     * 🎬 プラットフォーム別セクションレンダラー
     */
    const renderPlatformSection = (title: string, items: any[], source: string) => (
        <section className={styles.platformSection} key={source}>
            <div className={styles.platformTitle}>
                {title} <span className={styles.titleThin}>/LATEST_NODES</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {items.map((product) => (
                    <AdultProductCard key={`${source}-${product.id}`} product={product} />
                ))}
            </div>
        </section>
    );

    return (
        <div className={styles.pageContainer}>
            {/* 🐞 診断ツール */}
            {isDebugMode && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'CORE_ZENITH',
                        platform: 'HYBRID_CLUSTER',
                        fetchTime: 'Parallel-Async',
                        productCount: (fanzaRes?.results?.length || 0) + (dugaRes?.results?.length || 0) + (dmmRes?.results?.length || 0),
                    }}
                    raw={{ 
                        id: "V3.5_FINAL_PURGE", 
                        wpCount: latestPosts.length,
                        host: host
                    }} 
                />
            )}

            {/* 🏗️ コンテンツストリーム */}
            <div className={styles.contentStream}>
                
                {/* 📰 Intelligence Reports (Markdown / Django News) */}
                {latestPosts.length > 0 && (
                    <section className={styles.newsSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
                            <Link href="/news" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                        </div>
                        <div className={styles.newsGrid}>
                            {latestPosts.slice(0, 3).map((post: any) => {
                                /**
                                 * 💡 インライン画像判定ロジック
                                 * 関数を使わず、データから直接フォールバックチェーンを作成
                                 */
                                const displayImage = post.image || 
                                                     post.featured_image || 
                                                     post.thumbnail_url || 
                                                     post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                                                     '/no-image.jpg';

                                return (
                                    <Link key={post.id} href={`/news/${post.slug}`} className={styles.newsCard}>
                                        <div className={styles.newsThumbWrap}>
                                            <img 
                                                src={displayImage} 
                                                alt={decodeHtml(post.title?.rendered || post.title)} 
                                                className={styles.newsThumb} 
                                            />
                                        </div>
                                        <div className={styles.newsContent}>
                                            <span className={styles.newsDate}>{formatDate(post.date || post.created_at)}</span>
                                            <h3 className={styles.newsTitle}>
                                                {decodeHtml(post.title?.rendered || post.title)}
                                            </h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 📀 Archive Registry */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>ZENITH_REGISTRY_v3.5</span>
                        </h1>
                    </div>

                    {isApiConnected ? (
                        <div className={styles.registryStack}>
                            {fanzaRes?.results?.length > 0 && renderPlatformSection("FANZA", fanzaRes.results, "fanza")}
                            {dugaRes?.results?.length > 0 && renderPlatformSection("DUGA", dugaRes.results, "duga")}
                            {dmmRes?.results?.length > 0 && renderPlatformSection("DMM", dmmRes.results, "dmm")}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <div className={styles.glitchBox}>
                                <div className={styles.glitchText}>SYNCHRONIZING_DATABASE...</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footerAction}>
                    <Link href="/videos" className={styles.megaTerminalBtn}>
                        ACCESS_FULL_REGISTRY_DATABASE
                    </Link>
                </div>
            </div>
        </div>
    );
}