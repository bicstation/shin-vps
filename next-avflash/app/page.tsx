/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

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
    const host = headerList.get('x-django-host') || headerList.get('host') || "avflash.xyz";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | AI解析・最新アダルトアーカイブ`,
        description: `${siteConfig.site_name}のAI解析に基づいたDUGA最新アーカイブ。`,
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

export default async function Page() {
    // --- 🎯 STEP 1: サイトアイデンティティの自動特定 ---
    const headerList = await headers();
    
    // Middlewareが焼成した識別子を最優先
    const host = headerList.get('x-django-host') || headerList.get('host') || "avflash.xyz";
    const siteConfig = getSiteMetadata(host); 
    
    // 🛡️ サイトタグの洗浄 (スラッシュ混入をここでも念のためガード)
    const siteTag = (siteConfig.site_tag || 'avflash').replace(/\/+$/, ''); 
    const ROUTE_BASE = "/post"; 

    // 🚀 サーバーログ
    console.log("⚓ --- AVFLASH_DEPLOY_REPORT ---");
    console.log("HOSTNAME:", host);
    console.log("SITE_NAME:", siteConfig.site_name);
    console.log("SITE_TAG:", siteTag);
    console.log("---------------------------------");

    // --- 🎯 STEP 2: 並列データ取得実行 ---
    // client.ts v8.3 の恩恵により、ここでの引数 siteTag は 400エラー を起こしません
    const [postResponse, dugaRes] = await Promise.all([
        // 1. 最新記事 (Django API)
        safeFetch(
            fetchPostList(6, 0, host), // プロジェクト識別として host または siteTag を渡す
            { results: [], count: 0 }
        ),
        // 2. DUGA 商品
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 12, brand: 'DUGA', host: host }), 
            { results: [], count: 0 }
        ),
    ]);

    const latestPosts: UnifiedPost[] = postResponse?.results || [];
    const products = dugaRes?.results || [];
    const totalCount = dugaRes?.count || 0;

    return (
        <div className={styles.pageContainer}>
            {/* 🛠️ ブラウザデバッグ用シグナル */}
            <script dangerouslySetInnerHTML={{
                __html: `console.log("🛰️ AVFLASH_SYNC:", ${JSON.stringify({ 
                    site: siteConfig.site_name, 
                    tag: siteTag,
                    host: host 
                })})`
            }} />

            <div className={styles.contentStream}>
                
                {/* --- 🛸 ヒーローヘッダー --- */}
                <header className={styles.heroHeader}>
                    <div className={styles.heroBadge}>AI ANALYSIS & ARCHIVE</div>
                    <h1 className={styles.heroTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.heroSubtitle}>
                        AI解析によって厳選された <span style={{ color: '#ffc107' }}>DUGA</span> 最新作品と業界分析記事
                    </p>
                    <div className={styles.statsInfo}>
                        Total <strong>{totalCount.toLocaleString()}</strong> curated items in Matrix
                    </div>
                </header>

                {/* --- 📰 LATEST ARTICLES --- */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleWrapper}>
                            <h2 className={styles.sectionTitle}>LATEST_REPORTS</h2>
                            <div className={styles.titleLine} />
                        </div>
                        <Link href={ROUTE_BASE} className={styles.viewAllLink}>
                            VIEW ALL ARTICLES →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-lg">
                                <p className={styles.glitchText}>NO_INTELLIGENCE_DATA_IN_STREAM (Check Django SQL)</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 💎 DUGA NEW RELEASES --- */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleWrapper}>
                            <h2 className={styles.sectionTitle}>DUGA_NEW_RELEASES</h2>
                            <div className={styles.titleLine} />
                        </div>
                        <Link href="/brand/duga" className={styles.viewAllLink}>
                            VIEW ALL DUGA →
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {products.length > 0 ? (
                            products.map((item) => (
                                <UnifiedProductCard 
                                    key={item.id} 
                                    data={item} 
                                    siteConfig={siteConfig} 
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>🔍</div>
                                <h3>CONNECTING_TO_DUGA_STREAM...</h3>
                                <p>Target Project: <strong>{siteTag}</strong></p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 🛡️ インフォメーション --- */}
                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <h3>AI ANALYSIS SYSTEM [{siteTag.toUpperCase()}]</h3>
                        <p>
                            本ポータルは、最新のアダルトコンテンツをAI技術を用いて多角的に分析。
                            {siteConfig.site_name}独自のアルゴリズムにより、最適なアーカイブを提供します。
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}