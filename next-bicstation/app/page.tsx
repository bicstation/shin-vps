/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント (最新の UnifiedCard を採用)
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック (統合ルートへ集約)
import { fetchPostList } from '@/shared/lib/api/django/posts';
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
    const host = headerList.get('x-django-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 統合インテリジェンス・アーカイブ`,
        description: `${siteConfig.site_name}の分散されたナレッジを物理フィルタで統合。`,
        host: host 
    });
}

/**
 * 🛠️ 高精度 safeFetch (診断ログ付き)
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        if (!data || (data.results && data.results.length === 0)) {
            console.warn("⚠️ [DATA_EMPTY]: Django returned 200 OK but 0 results. Check Query Params.");
        } else {
            console.log(`✅ [DATA_SYNC]: Synchronized ${data.results.length} articles from Django.`);
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
    
    // Middlewareの識別子を最優先。ホスト名からサイト設定を解決。
    const host = headerList.get('x-django-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    
    const siteTag = siteConfig.site_tag; // "bicstation"
    const INTERNAL_HOST = siteConfig.django_host; // "api-bicstation-host"
    const ROUTE_BASE = "/post"; 

    console.log(`⚓ --- [SYSTEM_CHECK: ${siteTag.toUpperCase()}] ---`);
    console.log(`NODE: ${INTERNAL_HOST} | IDENTIFIER: ${host}`);

    /**
     * --- 🎯 STEP 2: データ同期 (統合ルート) ---
     * 🚀 [CRITICAL FIX]
     * fetchPostList を呼ぶことで client.ts (v8.3) が介入。
     * URL末尾の不要なスラッシュを除去し、正しく 'site=bicstation' としてリクエスト。
     */
    const postResponse = await safeFetch(
        fetchPostList(12, 0, host), 
        { results: [], count: 0 }
    );

    const recentPosts: UnifiedPost[] = postResponse?.results || [];
    const totalCount = postResponse?.count || 0;

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ ブラウザデバッグ信号 */}
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
                        {siteConfig.site_name}_OS <span className={styles.verNum}>v8.3.0 [QUERY_FIX]</span>
                    </div>
                    <div className={styles.nodeStats}>
                        ACTIVE_ARTICLES: <span className={styles.countNum}>{totalCount.toLocaleString()}</span>
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

            {/* 📰 最新アーカイブ・プレビュー (共通カード採用) */}
            <div className={styles.previewGrid}>
                {recentPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                data={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noDataArea}>
                        <div className={styles.glitchBox}>
                            <p className={styles.glitchText}>NO_DATA_RECEIVED</p>
                            <div className="text-left text-[10px] font-mono opacity-60 mt-4 p-4 border border-white/10 bg-black/20">
                                <p className="text-yellow-400 font-bold">--- RECOVERY_DIAGNOSTICS ---</p>
                                <p>IDENTIFIER: {host}</p>
                                <p>QUERY: ?limit=12&site={siteTag}</p>
                                <p>STATUS: Django接続待機中。スラッシュ汚染は解消済み。</p>
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
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name} | DATABASE_CONNECTION_ESTABLISHED
                </p>
            </footer>
        </div>
    );
}