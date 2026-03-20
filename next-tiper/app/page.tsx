/* /app/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ✅ 共通コンポーネント
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';
import SafeImage from '@shared/components/atoms/SafeImage';

// ✅ API・ロジック (整備した bridge を使用)
import { getUnifiedProducts, fetchPostList } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@shared/lib/utils/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function generateMetadata() {
    return constructMetadata({
        title: "TIPER Live | プレミアム・統合デジタルアーカイブ",
        description: "AI解析に基づいたデジタルアーカイブ。最新のインテリジェンスを同期中。",
        canonical: '/'
    });
}

/**
 * 🛰️ API通信の安全な実行
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn("⚠️ [API_SKIP]:", e.message);
        return fallback;
    }
}

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
    // 1. ハイブリッド記事の取得 (Markdown + Django AI記事)
    // 最初の6件をトップに表示
    const { results: latestPosts } = await safeFetch(fetchPostList('post', 6, 0), { results: [], count: 0 });
    
    // 2. Django APIからの商品データ取得 (並列実行)
    const [fanzaRes, dugaRes] = await Promise.all([
        safeFetch(getUnifiedProducts({ site_group: 'tiper', limit: 4 }), { results: [] }),
        safeFetch(getUnifiedProducts({ site_group: 'avflash', limit: 4 }), { results: [] }),
    ]);

    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentStream}>
                
                {/* 📰 1. INTELLIGENCE_REPORTS (ハイブリッド・ニュース) */}
                <section className={styles.newsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
                        <Link href="/news" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.map((post) => {
                            const identifier = post.slug || post.id;
                            return (
                                <Link key={identifier} href={`/news/${identifier}`} className={styles.newsCard}>
                                    <div className={styles.newsCardThumb}>
                                        <SafeImage 
                                            src={post.image || post.main_image_url} 
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
                        })}
                    </div>

                    {latestPosts.length === 0 && (
                        <div className={styles.loadingArea}>
                            <div className={styles.glitchText}>NO_INTELLIGENCE_FOUND_IN_STREAM</div>
                        </div>
                    )}
                </section>

                {/* 📀 2. UNIFIED_DATA_STREAM (商品アーカイブ) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>ZENITH_REGISTRY_v3.6</span>
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
                                <div className={styles.glitchText}>DATABASE_SYNCHRONIZING...</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🚀 フッターアクション */}
                <div className={styles.footerAction}>
                    <Link href="/news" className={styles.megaTerminalBtn}>
                        ACCESS_FULL_INTELLIGENCE_DATABASE
                    </Link>
                </div>
            </div>
        </div>
    );
}