/* /app/news/page.tsx */
// /home/maya/shin-dev/shin-vps/next-avflash/app/post/page.tsx
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
// ✅ Bridge からハイブリッド取得ロジックをインポート
import { fetchPostList } from '@/shared/lib/api/django-bridge';

// ✅ コンポーネントのインポート
import Pagination from '@shared/components/molecules/Pagination';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './news.module.css'; 

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 * ビルド時の API 接続失敗による中断を防ぐための最重要設定です。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 9;

export default async function NewsArchivePage({
    searchParams
}: {
    searchParams: { page?: string };
}) {
    // 🔢 ページネーション計算
    const params = await searchParams; // Next.js 15 では await が必要
    const currentPage = Number(params?.page) || 1;
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    /**
     * 🛰️ ハイブリッド・データ取得
     * try-catch で保護し、API 未接続時のビルド中断を防止します。
     */
    let allPosts = [];
    let totalCount = 0;

    try {
        const response = await fetchPostList('post', POSTS_PER_PAGE, offset);
        allPosts = response?.results || [];
        totalCount = response?.count || 0;
    } catch (error) {
        console.warn("⚠️ NewsArchive: API connection deferred for build.");
    }
    
    const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

    return (
        <main className={styles.archiveContainer}>
            <header className={styles.archiveHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.mainTitle}>
                        INTELLIGENCE_ARCHIVE
                        <span className={styles.subTitle}>/SYNCED_DATA_INDEX</span>
                    </h1>
                    <p className={styles.statusLine}>
                        STATUS: <span className={styles.statusActive}>ONLINE</span> | 
                        TOTAL_NODES: {totalCount} | 
                        SEQUENCE: {currentPage}/{totalPages}
                    </p>
                </div>
            </header>

            {/* 📰 記事リスト */}
            <div className={styles.contentGrid}>
                {allPosts && allPosts.length > 0 ? (
                    allPosts.map((post) => {
                        // DjangoのID(数値)か、Markdownのslug(文字列)かを判別
                        const identifier = post.slug || post.id;
                        const displayImage = post.main_image_url || post.image || '/no-image.jpg';
                        const displayDate = post.created_at 
                            ? new Date(post.created_at).toLocaleDateString('ja-JP') 
                            : (post.date || 'RECENT');

                        return (
                            <Link key={identifier} href={`/news/${identifier}`} className={styles.nodeCard}>
                                <div className={styles.cardThumbWrap}>
                                    <SafeImage 
                                        src={displayImage} 
                                        alt={post.title} 
                                        className={styles.cardThumb}
                                        fallback="/no-image.jpg"
                                    />
                                    <div className={styles.categoryBadge}>{post.category || 'NEWS'}</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardDate}>[{displayDate}]</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{post.title}</h2>
                                    <p className={styles.cardDescription}>
                                        {post.description || 
                                         (post.body_text ? post.body_text.substring(0, 80).replace(/[#*]/g, '') + '...' : 'ACCESSING_CONTENT...')}
                                    </p>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.accessBtn}>ACCESS_FILE _</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.glitchText}>INITIALIZING_DATA_STREAM...</div>
                        <p className="text-gray-600 mt-4 font-mono text-xs">
                            アーカイブとの同期を待機しています。
                        </p>
                    </div>
                )}
            </div>
            
            {/* 🔢 ページネーション */}
            {totalPages > 1 && (
                <div className="mt-16 flex justify-center border-t border-gray-900 pt-10">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/news"
                    />
                </div>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>← RETURN_TO_SYSTEM_ROOT</Link>
            </footer>
        </main>
    );
}