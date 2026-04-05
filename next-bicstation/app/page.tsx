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
        title: `${siteConfig.site_name} | PC・ガジェット統合アーカイブ`,
        description: `${siteConfig.site_name}は、膨大なPC関連データを集約したインテリジェンス・アーカイブです。`,
        host: host 
    });
}

/**
 * 🛠️ 高精度 safeFetch
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [FETCH_FATAL]:`, e.message);
        return fallback;
    }
}

export default async function HomePageMain() {
    // --- 🎯 STEP 1: コンテキスト特定 ---
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    
    const siteTag = siteConfig.site_tag; // "bicstation"
    const ROUTE_BASE = "/post"; 

    // --- 🎯 STEP 2: データ同期 ---
    const postResponse = await safeFetch(
        fetchPostList(12, 0, host), 
        { results: [], count: 0 }
    );

    const recentPosts: UnifiedPost[] = postResponse?.results || [];
    const totalCount = postResponse?.count || 0;

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー [PROD_READY_UI] */}
            <header className={styles.systemStatus}>
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>NETWORK_ONLINE</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>DATABASE_NODE_V9.4</span>
                    </div>
                    <div className={styles.nodeStats}>
                        ARCHIVE_CAPACITY: <span className={styles.countNum}>{totalCount.toLocaleString()} ITEMS</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション [CLEAN_DESIGN] */}
            <section className={styles.heroSection}>
                <div className={styles.heroGlow}></div>
                <h1 className={styles.glitchTitle}>
                    {siteConfig.site_name.toUpperCase()}
                </h1>
                <p className={styles.subText}>
                    ハードウェアから最新ガジェットまで、1,700件を超える知見を統合したナレッジ・アーカイブ
                </p>
            </section>

            {/* 📰 アーカイブグリッド */}
            <div className={styles.contentContainer}>
                <div className={styles.sectionTitleArea}>
                    <h2 className={styles.sectionHeader}>LATEST_RECORDS</h2>
                    <div className={styles.titleLine}></div>
                </div>

                <div className={styles.previewGrid}>
                    {recentPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            <div className={styles.loadingBox}>
                                <span className={styles.loader}></span>
                                <p>CONNECTING_TO_ARCHIVE_DATA...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🛡️ サイトミッションセクション (AdSense審査評価用) */}
            <section className={styles.missionSection}>
                <div className={styles.missionCard}>
                    <h3 className="text-blue-400 font-bold mb-4 tracking-widest">MISSION_STATEMENT</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Bic Station は、テクノロジー情報の永続的な保存と、体系的なデータベース化を目的としたプロジェクトです。
                        膨大なアーカイブを通じて、ユーザーに深い洞察と確かな製品データを提供することを使命としています。
                    </p>
                </div>
            </section>

            {/* 📂 リンク・ナビゲーション */}
            <nav className={styles.archiveNav}>
                <Link href={ROUTE_BASE} className={styles.navItem}>
                    <span className={styles.navIcon}>📂</span>
                    <div className={styles.navContent}>
                        <span className={styles.navTitle}>ALL_ARCHIVES_INDEX</span>
                        <span className={styles.navDesc}>すべての記録を参照する</span>
                    </div>
                    <span className={styles.navArrow}>→</span>
                </Link>
            </nav>

            {/* 👣 フッター */}
            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name} | SECURE_CONNECTION_ESTABLISHED
                </p>
            </footer>
        </div>
    );
}