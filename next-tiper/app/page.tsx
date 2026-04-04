/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { headers } from "next/headers";
import styles from './page.module.css';

// ✅ 共通コンポーネント
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import SafeImage from '@/shared/components/atoms/SafeImage';

// ✅ API・判定ロジック
// fetchPostList は最新の django/posts.ts から直結
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getUnifiedProducts } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { UnifiedPost } from '@/shared/lib/api/types';

/**
 * 💡 Next.js 15 レンダリングポリシー
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
        description: `${siteConfig.site_name}のAI解析に基づいた最新アーカイブ。`,
        host: host 
    });
}

/**
 * 🛡️ API通信の安全な実行
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [API_SKIP]:`, e.message);
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
    // --- 🎯 STEP 1: ドメインの特定 ---
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "tiper.live";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_name.toLowerCase(); // 'tiper'

    // --- 🎯 STEP 2: 並列データ同期実行 ---
    const [postResponse, fanzaRes, dugaRes] = await Promise.all([
        // 1. 最新記事 (UnifiedPost) - プロジェクト識別子でフィルタ
        safeFetch(
            fetchPostList(6, 0, siteTag), 
            { results: [], count: 0 }
        ),
        // 2. FANZA 商品
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'FANZA' }), 
            { results: [] }
        ),
        // 3. DUGA 商品
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'DUGA' }), 
            { results: [] }
        ),
    ]);

    const latestPosts: UnifiedPost[] = postResponse?.results || [];
    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentStream}>
                
                {/* 📰 1. INTELLIGENCE_REPORTS (ブログ記事セクション) */}
                <section className={styles.newsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>
                            LATEST_REPORTS <span className={styles.siteHighlight}>[{siteTag.toUpperCase()}]</span>
                        </h2>
                        <Link href="/posts" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post) => {
                                // 🆔 IDかSlugを選択 (URLの一貫性)
                                const identifier = post.slug || post.id;
                                // 🖼️ 画像パスの正規化 (UnifiedPost仕様)
                                const displayImage = post.image || '/img/no-image.png';
                                
                                return (
                                    <Link key={post.id} href={`/posts/${identifier}`} className={styles.newsCard}>
                                        <div className={styles.newsCardThumb}>
                                            <SafeImage 
                                                src={displayImage} 
                                                alt={post.title}
                                                className="object-cover w-full h-full"
                                            />
                                            <div className={styles.newsDate}>
                                                [{new Date(post.created_at).toLocaleDateString('ja-JP')}]
                                            </div>
                                        </div>
                                        <div className={styles.newsCardBody}>
                                            <h3 className={styles.newsCardTitle}>{post.title}</h3>
                                            <p className={styles.newsExcerpt}>
                                                {post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 50) : ""}...
                                            </p>
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

                {/* 📀 2. UNIFIED_DATA_STREAM (FANZA & DUGA) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>/{siteTag.toUpperCase()}_v7.9</span>
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
                                    CONNECTING_TO_{siteTag.toUpperCase()}_DATABASE...
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🚀 フッターアクション */}
                <div className={styles.footerAction}>
                    <Link href="/posts" className={styles.megaTerminalBtn}>
                        ACCESS_FULL_{siteTag.toUpperCase()}_INTELLIGENCE
                    </Link>
                </div>
            </div>
        </div>
    );
}