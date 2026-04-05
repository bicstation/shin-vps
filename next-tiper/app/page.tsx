/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { headers } from "next/headers";

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getUnifiedProducts } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { UnifiedPost } from '@/shared/lib/api/types';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 レンダリングポリシー
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "tiper.live";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | プレミアム・デジタルコンテンツアーカイブ`,
        description: `${siteConfig.site_name}のAI解析に基づいた、最新のデジタルコンテンツ・アーカイブ。`,
        host: host 
    });
}

/**
 * 🛡️ 堅牢なフェッチ関数
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

export default async function Home() {
    // --- 🎯 STEP 1: ドメイン特定 ---
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "tiper.live";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag; 
    const ROUTE_BASE = "/post"; 

    // --- 🎯 STEP 2: 並列データ同期実行 ---
    const [postResponse, fanzaRes, dugaRes] = await Promise.all([
        // 1. Django 記事データ
        safeFetch(fetchPostList(6, 0, host), { results: [], count: 0 }),
        // 2. FANZA 商品データ
        safeFetch(getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'FANZA', host: host }), { results: [] }),
        // 3. DUGA 商品データ
        safeFetch(getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'DUGA', host: host }), { results: [] }),
    ]);

    const latestPosts: UnifiedPost[] = postResponse?.results || [];
    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            {/* 🛸 ヒーローヘッダー [PREMIUM_STYLING] */}
            <header className={styles.heroHeader}>
                <div className={styles.heroBadge}>PREMIUM ARCHIVE</div>
                <h1 className={styles.heroTitle}>{siteConfig.site_name}</h1>
                <p className={styles.heroSubtitle}>
                    AI解析による高精度なデータ集積と、最新のデジタルコンテンツ・ストリーム。
                </p>
                <div className={styles.systemPulse}>
                    <span className={styles.pulseDot}></span>
                    NETWORK_STATUS: <span className={styles.statusOnline}>ONLINE</span>
                </div>
            </header>

            <div className={styles.contentStream}>
                {/* 📰 1. INTELLIGENCE_REPORTS (最新記事セクション) */}
                <section className={styles.newsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>LATEST_REPORTS</h2>
                        <Link href={ROUTE_BASE} className={styles.headerLink}>VIEW_ALL →</Link>
                    </div>

                    {latestPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {latestPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyCard}>
                            <p>準備中のレポートを同期しています...</p>
                        </div>
                    )}
                </section>

                {/* 📀 2. UNIFIED_DATA_STREAM (商品アーカイブ) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h2 className={styles.registryTitle}>UNIFIED_DATA_STREAM</h2>
                        <div className={styles.titleLine}></div>
                    </div>

                    {isApiConnected ? (
                        <div className={styles.registryStack}>
                            {/* FANZA SECTION */}
                            {fanzaRes?.results?.length > 0 && (
                                <div className={styles.platformSection}>
                                    <h3 className={styles.platformLabel}>FANZA_NODES</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {fanzaRes.results.slice(0, 4).map((p) => (
                                            <UnifiedProductCard key={`f-${p.id}`} data={p} siteConfig={siteConfig} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* DUGA SECTION */}
                            {dugaRes?.results?.length > 0 && (
                                <div className={styles.platformSection}>
                                    <h3 className={styles.platformLabel}>DUGA_NODES</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {dugaRes.results.slice(0, 4).map((p) => (
                                            <UnifiedProductCard key={`d-${p.id}`} data={p} siteConfig={siteConfig} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <span className={styles.loader}></span>
                            <p className={styles.loadingText}>SYNCHRONIZING_EXTERNAL_DATABASE...</p>
                        </div>
                    )}
                </div>

                {/* 🚀 フッターアクション */}
                <div className={styles.footerAction}>
                    <Link href={ROUTE_BASE} className={styles.megaTerminalBtn}>
                        ACCESS_FULL_INTELLIGENCE_STREAM
                    </Link>
                </div>
            </div>

            {/* 🛡️ サイトフッター [PROD_IDENTITY] */}
            <footer className={styles.footerStatus}>
                <div className={styles.footerInner}>
                    <p>SYSTEM_CORE: V9.5 / ENCRYPTION: AES-256 / STATUS: SECURE</p>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} | SMART_DATA_NETWORK</p>
                </div>
            </footer>
        </div>
    );
}