/**
 * =====================================================================
 * 🛰️ BICSTATION Main Intelligence Console (v5.2.1)
 * 🛡️ Maya's Logic: ビルド安全装置 & 統合アーカイブ誘導版
 * 💡 force-dynamic を付与し、ビルド時の API 接続失敗による中断を防ぎます。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { fetchPostList } from '@/shared/lib/api/django-bridge';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './page.module.css';

// 🚨 【重要】ビルド時の静的生成をスキップし、ランタイムでの取得を強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePageMain() {
    /**
     * 🛰️ データ同期
     * try-catch で保護し、API 未接続時（ビルド時等）のクラッシュを回避
     */
    let recentPosts = [];
    let totalCount = 0;

    try {
        const response = await fetchPostList('post', 4, 0);
        recentPosts = response.results || [];
        totalCount = response.count || 0;
    } catch (e) {
        console.warn("⚠️ Home: API connection deferred (Runtime only).");
    }

    return (
        <div className={styles.mainWrapper}>
            {/* 🛡️ システムステータス */}
            <header className={styles.systemStatus}>
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>SYSTEM_LIVE</span>
                    </div>
                    <div className={styles.versionTag}>
                        BICSTATION_OS <span className={styles.verNum}>v5.0 [STABLE]</span>
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
                    分散されたナレッジを物理フィルタで統合。
                    <br />
                    リアルタイム・データストリームへアクセスを開始します。
                </p>
            </section>

            {/* 📰 最新アーカイブ・プレビュー */}
            <div className={styles.previewGrid}>
                {recentPosts && recentPosts.length > 0 ? (
                    recentPosts.map((post: any) => {
                        const identifier = post.id || post.slug;
                        const displayImage = post.main_image_url || post.image || '/no-image.jpg';
                        const displayDate = post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : 'RECENT';

                        return (
                            <Link key={identifier} href={`/post/${identifier}`} className={styles.previewCard}>
                                <div className={styles.thumbContainer}>
                                    <SafeImage 
                                        src={displayImage} 
                                        alt={post.title} 
                                        className={styles.thumbImage}
                                        fallback="/no-image.jpg"
                                    />
                                    <div className={styles.cardOverlay}>
                                        <span className={styles.viewLabel}>ACCESS_FILE</span>
                                    </div>
                                </div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardDate}>[{displayDate}]</span>
                                    <h3 className={styles.cardTitle}>{post.title}</h3>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className={styles.noData}>INITIALIZING_DATA_STREAM...</div>
                )}
            </div>

            {/* 🔗 統合リンク・セクション */}
            <nav className={styles.archiveNav}>
                <div className={styles.navGrid}>
                    <Link href="/post" className={styles.navItem}>
                        <span className={styles.navIcon}>📂</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>ARTICLE_INDEX</span>
                            <span className={styles.navDesc}>すべての記事・ニュースを表示</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>

                    <Link href="/news" className={styles.navItem}>
                        <span className={styles.navIcon}>📡</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>NEWS_STREAM</span>
                            <span className={styles.navDesc}>最新のトピックス・更新情報</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>

                    <Link href="/about" className={styles.navItem}>
                        <span className={styles.navIcon}>🛡️</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>SYSTEM_ROOT</span>
                            <span className={styles.navDesc}>このアーカイブについて</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>
                </div>
            </nav>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>&copy; 2026 BICSTATION INTEGRATED FLEET</p>
            </footer>
        </div>
    );
}