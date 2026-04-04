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

async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [BIC_API_SKIP]:`, e.message);
        return fallback;
    }
}

export default async function HomePageMain() {
    // --- 🎯 STEP 1: サイトアイデンティティの自動特定 ---
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag; // "bicstation"
    const ROUTE_BASE = "/post"; 

    /**
     * 🛰️ V5.1 ネットワーク・インジェクション
     * django-api ルーターに api-bicstation-host として認識させるための設定
     */
    const INTERNAL_HOST = "api-bicstation-host";
    const fetchOptions = {
        cache: 'no-store',
        headers: {
            'Host': INTERNAL_HOST, // 👈 重要: これがないと Django Middleware がサイトを識別できません
            'Accept': 'application/json'
        },
        next: { revalidate: 0 }
    };

    console.log(`⚓ --- BICSTATION_DEPLOY_REPORT ---`);
    console.log(`NODE: ${INTERNAL_HOST} | TAG: ${siteTag}`);

    // --- 🎯 STEP 2: データ同期 (fetchOptions を注入) ---
    // fetchPostList が内部で fetch を使っている場合、第4引数に options を渡せるように構成されている必要があります
    const postResponse = await safeFetch(
        fetchPostList(4, 0, siteTag, fetchOptions), 
        { results: [], count: 0 }
    );

    const recentPosts: UnifiedPost[] = postResponse?.results || [];
    const totalCount = postResponse?.count || 0;

    return (
        <div className={styles.mainWrapper}>
            {/* ブラウザデバッグ用シグナル */}
            <script dangerouslySetInnerHTML={{
                __html: `console.log("🛰️ BIC_SYNC_V5.1:", ${JSON.stringify({ 
                    tag: siteTag,
                    node: INTERNAL_HOST 
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
                        {siteConfig.site_name}_OS <span className={styles.verNum}>v5.2.1 [STABLE]</span>
                    </div>
                    <div className={styles.nodeStats}>
                        ARCHIVE_NODES: <span className={styles.countNum}>{totalCount}</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <h1 className={styles.glitchTitle} data-text="INTELLIGENCE_SYNC">
                    INTELLIGENCE_SYNC
                </h1>
                <p className={styles.subText}>
                    [{siteConfig.site_name.toUpperCase()}] リアルタイム・データストリームへアクセスを開始します。
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
                            <p className={styles.glitchText}>NO_DATA_RECEIVED_FROM_{INTERNAL_HOST}</p>
                            <p className="text-xs opacity-50 mt-4">
                                Django側で "bicstation" タグの記事、または<br />
                                サイトドメインの紐付けが完了しているか確認してください。
                            </p>
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
                            <span className={styles.navDesc}>すべての技術アーカイブ</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>
                    {/* ...他のナビ項目 */}
                </div>
            </nav>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} INTEGRATED FLEET</p>
            </footer>
        </div>
    );
}