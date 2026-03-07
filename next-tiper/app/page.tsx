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
 * 🛰️ API・ロジック・インポート (完全直通化)
 * 💡 修正: 中継所 (@shared/lib/api) を使わず、実体ファイルを直接参照します。
 * これにより TypeError: ... is not a function を物理的に封殺します。
 */
import { getSiteMainPosts, getWpFeaturedImage } from '@shared/lib/api/django-bridge';
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
    const searchParams = await props.searchParams;
    const isDebugMode = searchParams.debug === 'true';

    // Next.js 15 headers 対策
    const head = await headers();
    const host = head.get('host') || 'localhost';

    // --- 1. データ取得 (並列実行) ---
    // 直通インポートされた getUnifiedProducts を使用
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
                        id: "V3.2_FINAL_ZENITH", 
                        wpCount: latestPosts.length,
                        host: host
                    }} 
                />
            )}

            {/* 🏗️ コンテンツストリーム */}
            <div className={styles.contentStream}>
                
                {/* 📰 Intelligence Reports */}
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

                {/* 📀 Archive Registry */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>ZENITH_REGISTRY_v3.2</span>
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