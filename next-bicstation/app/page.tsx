/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック (安定している Bridge 経由を優先)
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 最新のタクティカル・スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name.toUpperCase()} | テクノロジー・ナレッジ・アーカイブ`,
        description: `${siteConfig.site_name}は、膨大な製品データと知見を統合したインテリジェンス・アーカイブです。`,
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
        console.error(`🚨 [SYSTEM_FETCH_ERROR]:`, e.message);
        return fallback;
    }
}

export default async function HomePageMain() {
    // --- 🎯 STEP 1: コンテキスト特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const ROUTE_BASE = "/post"; 

    // --- 🎯 STEP 2: データ同期 (記事表示をメインに据える) ---
    // 最新ニュースとコラムをそれぞれ取得
    const [newsResponse, columnResponse] = await Promise.all([
        safeFetch(fetchDjangoBridgeContent('posts', 12, { content_type: 'news' }), { results: [], count: 0 }),
        safeFetch(fetchDjangoBridgeContent('posts', 6, { content_type: 'column' }), { results: [] })
    ]);

    const recentPosts = newsResponse?.results || [];
    const subPosts = columnResponse?.results || [];
    const totalCount = newsResponse?.count || "1,700+";

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー */}
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

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <div className={styles.heroGlow}></div>
                <h1 className={styles.glitchTitle}>
                    {siteConfig.site_name.toUpperCase()}
                </h1>
                <p className={styles.subText}>
                    ハードウェアから最新ガジェットまで、数千件の記録を統合したタクティカル・データベース
                </p>
            </section>

            <div className={styles.contentContainer}>
                
                {/* 📰 SECTION 1: LATEST_RECORDS (実データ) */}
                <section className="mb-20">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>LATEST_RECORDS</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                <p>CONNECTING_TO_ARCHIVE_DATA...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ⚙️ SECTION 2: HARDWARE_CATEGORIES (ダミー装甲) */}
                <section className="mb-20">
                    <h2 className={styles.sectionTitle}>HARDWARE_CATEGORIES</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['LAPTOP', 'DESKTOP', 'GAMING', 'WORKSTATION'].map(cat => (
                            <div key={cat} className={styles.link} style={{ border: '1px solid rgba(0,242,255,0.1)', padding: '15px 20px', background: 'rgba(0,242,255,0.03)', borderRadius: '4px' }}>
                                <span>⚡ {cat}</span>
                                <span className={styles.badge}>READY</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🛡️ SECTION 3: TRUSTED_BRANDS (ダミー装甲) */}
                <section className="mb-20">
                    <h2 className={styles.sectionTitle}>TRUSTED_BRANDS</h2>
                    <div className="flex flex-wrap gap-3">
                        {['DELL', 'HP', 'LENOVO', 'MOUSE', 'ASUS', 'MSI', 'APPLE'].map(brand => (
                            <span key={brand} className={styles.badge} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                                {brand}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 📂 SECTION 4: KNOWLEDGE_ARCHIVE (実データ：サブ記事) */}
                <section className="mb-20">
                    <h2 className={styles.sectionTitle}>KNOWLEDGE_ARCHIVE</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subPosts.length > 0 ? (
                            subPosts.map((post) => (
                                <Link href={`/post/${post.id}`} key={post.id} className={styles.link}>
                                    <span className={styles.newsTitle}>📄 {post.title}</span>
                                    <span className={styles.badge}>VIEW_REPORT</span>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.link}><span>ARCHIVE_OFFLINE</span></div>
                        )}
                    </div>
                </section>

                {/* 🛡️ サイトミッション */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <p className={styles.subText} style={{ textAlign: 'left', marginTop: '10px' }}>
                            {siteConfig.site_name} は、テクノロジー情報の永続的な保存と、体系的なデータベース化を目的としたプロジェクトです。
                            膨大なアーカイブを通じて、ユーザーに深い洞察と確かな製品データを提供することを使命としています。
                        </p>
                    </div>
                </section>

                {/* 📂 ナビゲーション */}
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
            </div>

            {/* 👣 フッター */}
            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name.toUpperCase()} | SECURE_CONNECTION_ESTABLISHED
                </p>
            </footer>
        </div>
    );
}