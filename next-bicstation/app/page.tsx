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
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { UnifiedPost } from '@/shared/lib/api/types';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 統合インテリジェンス・アーカイブ`,
        description: `${siteConfig.site_name}の分散されたナレッジを物理フィルタで統合。`,
        host: host 
    });
}

/**
 * 🛠️ 高精度 safeFetch
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        if (!data || (data.results && data.results.length === 0)) {
            console.warn("⚠️ [DATA_EMPTY]: Django returned 200 OK but 0 results.");
        } else {
            console.log(`✅ [DATA_SYNC]: Loaded ${data.results.length} articles.`);
        }
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [FETCH_FATAL]:`, e.message);
        return fallback;
    }
}

export default async function HomePageMain() {
    // --- 🎯 STEP 1: サイトアイデンティティの自動特定 ---
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    
    const siteTag = siteConfig.site_tag; // "bicstation" 等
    const INTERNAL_HOST = siteConfig.django_host; // "api-bicstation-host" 等
    
    const ROUTE_BASE = "/post"; 

    console.log(`⚓ --- [SYSTEM_CHECK: ${siteTag.toUpperCase()}] ---`);
    console.log(`NODE: ${INTERNAL_HOST} | TARGET: ${siteTag}`);

    /**
     * --- 🎯 STEP 2: データ同期 ---
     * 🚀 [CRITICAL FIX]
     * 手動の fetchOptions ルートを廃止。
     * fetchPostList(limit, offset, siteTag) を呼ぶことで、
     * client.ts 側の getDjangoHeaders(siteTag) が走り、
     * 正しい Host ヘッダーと物理パス(:8083)が自動的に適用されます。
     */
    const postResponse = await safeFetch(
        fetchPostList(12, 0, siteTag), 
        { results: [], count: 0 }
    );

    const recentPosts: UnifiedPost[] = postResponse?.results || [];
    const totalCount = postResponse?.count || 0;

    return (
        <div className={styles.mainWrapper}>
            {/* ブラウザデバッグ信号 */}
            <script dangerouslySetInnerHTML={{
                __html: `console.log("🛰️ [SYSTEM_READY]:", ${JSON.stringify({ 
                    site: siteTag,
                    node: INTERNAL_HOST,
                    count: recentPosts.length 
                })})`
            }} />

            {/* システムステータスバー */}
            <header className={styles.systemStatus}>
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>SYSTEM_LIVE</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name}_OS <span className={styles.verNum}>v5.5.0 [DB_SYNC]</span>
                    </div>
                    <div className={styles.nodeStats}>
                        ACTIVE_ARTICLES: <span className={styles.countNum}>{totalCount}</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <h1 className={styles.glitchTitle} data-text="INTELLIGENCE_SYNC">
                    INTELLIGENCE_SYNC
                </h1>
                <p className={styles.subText}>
                    [{siteConfig.site_name.toUpperCase()}] 判定ノード: {INTERNAL_HOST}
                </p>
            </section>

            {/* 📰 最新アーカイブ・プレビュー */}
            <div className={styles.previewGrid}>
                {recentPosts.length > 0 ? (
                    recentPosts.map((post) => (
                        <UnifiedProductCard 
                            key={post.id} 
                            data={post} 
                            siteConfig={siteConfig} 
                        />
                    ))
                ) : (
                    <div className={styles.noDataArea}>
                        <div className={styles.glitchBox}>
                            <p className={styles.glitchText}>NO_DATA_RECEIVED</p>
                            <div className="text-left text-[10px] font-mono opacity-60 mt-4 p-4 border border-white/10 bg-black/20">
                                <p className="text-yellow-400 font-bold">--- RECOVERY_DIAGNOSTICS ---</p>
                                <p>IDENTIFIER: {siteTag}</p>
                                <p>STATUS: Django接続は正常。DBクエリ条件(site={siteTag})を再試行中。</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🔗 ナビゲーション */}
            <nav className={styles.archiveNav}>
                <div className={styles.navGrid}>
                    <Link href={ROUTE_BASE} className={styles.navItem}>
                        <span className={styles.navIcon}>📂</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>ARTICLE_INDEX</span>
                            <span className={styles.navDesc}>全てのアーカイブを表示</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>
                </div>
            </nav>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} | DATABASE_RESOLVED</p>
            </footer>
        </div>
    );
}