/* /app/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { headers } from "next/headers"; // ✅ Next.js 15: ドメイン特定に必須
import styles from './page.module.css';

// ✅ 共通コンポーネント
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import SafeImage from '@/shared/components/atoms/SafeImage';

// ✅ API・判定ロジック
import { getUnifiedProducts, fetchPostList } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

/**
 * 💡 Next.js 15 レンダリングポリシー
 * 各ドメインのリクエストを即座に反映させるため force-dynamic を採用
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

/**
 * 🛰️ メタデータ生成 (Async Metadata)
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "tiper.live";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | プレミアム・統合デジタルアーカイブ`,
        description: `${siteConfig.site_name}のAI解析に基づいた最新アーカイブ。インテリジェンス・データストリームを同期中。`,
        canonical: '/',
        host: host // constructMetadata内部での判定用
    });
}

/**
 * 🛡️ API通信の安全な実行（Django停止時でもフロントを落とさない）
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [${new Date().toISOString()}] API_SKIP:`, e.message);
        return fallback;
    }
}

/**
 * 🧱 プラットフォーム別セクションのレンダリング
 */
const renderPlatformSection = (title: string, items: any[], source: string) => (
    <section className={styles.platformSection} key={source}>
        <div className={styles.platformTitle}>
            {title} <span className={styles.titleThin}>/LATEST_NODES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {items.slice(0, 4).map((product) => (
                <AdultProductCard key={`${source}-${product.id}`} product={product} />
            ))}
        </div>
    </section>
);

export default async function Home() {
    // --- 🎯 STEP 1: ドメインの特定 (Next.js 15 Server Component) ---
    const headerList = await headers();
    const host = headerList.get('host') || "tiper.live";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag; // 'tiper', 'avflash' など

    // --- 🎯 STEP 2: Django Bridge 経由でのデータ同期 ---
    
    // 1. ハイブリッド記事の取得 (siteTag をフィルタとして渡す)
    const postResponse = await safeFetch(
        fetchPostList('post', 6, 0, siteTag), 
        { results: [], count: 0 }
    );
    const latestPosts = postResponse?.results || [];
    
    // 2. 商品データ取得 (site_group = siteTag でドメイン専用データを抽出)
    const [fanzaRes, dugaRes] = await Promise.all([
        safeFetch(getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'FANZA' }), { results: [] }),
        safeFetch(getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'DUGA' }), { results: [] }),
    ]);

    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentStream}>
                
                {/* 📰 1. INTELLIGENCE_REPORTS (ドメイン特化型) */}
                <section className={styles.newsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>
                            INTELLIGENCE_REPORTS <span className={styles.siteHighlight}>[{siteConfig.site_name.toUpperCase()}]</span>
                        </h2>
                        <Link href="/post" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post) => {
                                const identifier = post.slug || post.id;
                                const displayImage = post.image || post.main_image_url || '/no-image.jpg';
                                return (
                                    <Link key={identifier} href={`/post/${identifier}`} className={styles.newsCard}>
                                        <div className={styles.newsCardThumb}>
                                            <SafeImage 
                                                src={displayImage} 
                                                alt={post.title}
                                                fallback="/no-image.jpg"
                                                className="object-cover w-full h-full"
                                            />
                                            <div className={styles.newsDate}>[{post.date || 'RECENT'}]</div>
                                        </div>
                                        <div className={styles.newsCardBody}>
                                            <h3 className={styles.newsCardTitle}>{post.title}</h3>
                                            <div className={styles.newsCardCategory}>#{post.category || 'AI_ANALYSIS'}</div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-lg">
                                <p className={styles.glitchText}>NO_INTELLIGENCE_DATA_IN_STREAM</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 📀 2. UNIFIED_DATA_STREAM (商品アーカイブ) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>{siteConfig.site_name}_ZENITH_v3.6</span>
                        </h1>
                    </div>

                    {isApiConnected ? (
                        <div className={styles.registryStack}>
                            {fanzaRes?.results?.length > 0 && renderPlatformSection("FANZA", fanzaRes.results, "fanza")}
                            {dugaRes?.results?.length > 0 && renderPlatformSection("DUGA", dugaRes.results, "duga")}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <div className={styles.glitchBox}>
                                <div className={styles.glitchText}>
                                    CONNECTING_TO_{siteConfig.site_tag.toUpperCase()}_DB...
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🚀 フッターアクション */}
                <div className={styles.footerAction}>
                    <Link href="/post" className={styles.megaTerminalBtn}>
                        ACCESS_FULL_{siteConfig.site_name.toUpperCase()}_DATABASE
                    </Link>
                </div>
            </div>
        </div>
    );
}