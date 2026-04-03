/**
 * =====================================================================
 * 🛰️ BICSTATION Main Intelligence Console (v5.2.0)
 * 🛡️ Maya's Logic: 生ログの軟化 & 統合アーカイブへの全自動誘導
 * 💡 6,500件の鼓動を、洗練されたUIでプレビューします。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
// ✅ Bridge から最新記事取得ロジックをインポート
import { fetchPostList } from '@/shared/lib/api/django-bridge';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './page.module.css';

export default async function HomePageMain() {
    /**
     * 🛰️ データ同期
     * limit: 4 (最新4件をピックアップ)
     * project は Bridge 内の headers() で自動判定されます。
     */
    const { results: recentPosts, count: totalCount } = await fetchPostList('post', 4, 0);

    return (
        <div className={styles.mainWrapper}>
            {/* 🛡️ システムステータス（旧ログを柔らかく再構築） */}
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

            {/* 📰 最新アーカイブ・プレビュー (最新4件) */}
            <div className={styles.previewGrid}>
                {recentPosts && recentPosts.length > 0 ? (
                    recentPosts.map((post) => {
                        const identifier = post.id || post.slug;
                        const displayImage = post.main_image_url || post.image || '/no-image.jpg';
                        const displayDate = post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : 'RECENT';

                        return (
                            <Link key={identifier} href={`/news/${identifier}`} className={styles.previewCard}>
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
                    <div className={styles.noData}>CONNECTING_TO_DATA_STREAM...</div>
                )}
            </div>

            {/* 🔗 統合リンク・セクション (既存のリンクを網羅) */}
            <nav className={styles.archiveNav}>
                <div className={styles.navGrid}>
                    {/* 1. 記事一覧（今回のメイン導線） */}
                    <Link href="/post" className={styles.navItem}>
                        <span className={styles.navIcon}>📂</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>ARTICLE_INDEX</span>
                            <span className={styles.navDesc}>すべての記事・ニュースを表示</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>

                    {/* 2. 旧来のニュースリンク（互換性維持） */}
                    <Link href="/news" className={styles.navItem}>
                        <span className={styles.navIcon}>📡</span>
                        <div className={styles.navContent}>
                            <span className={styles.navTitle}>NEWS_STREAM</span>
                            <span className={styles.navDesc}>最新のトピックス・更新情報</span>
                        </div>
                        <span className={styles.navArrow}>→</span>
                    </Link>

                    {/* 3. プロジェクト情報（任意） */}
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

            {/* 🛠️ 管理用フッターフック */}
            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>&copy; 2026 BICSTATION INTEGRATED FLEET</p>
            </footer>
        </div>
    );
}