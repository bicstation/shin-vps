/* /app/news/page.tsx */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
// ✅ fetchPostList をインポート (ハイブリッド取得用)
import { fetchPostList } from '@/shared/lib/api/django-bridge';

// ✅ コンポーネントのインポート
import Pagination from '@shared/components/molecules/Pagination';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './news.module.css'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 9;

export default async function NewsArchivePage({
    searchParams
}: {
    searchParams: { page?: string };
}) {
    // 🔢 ページネーション計算
    const currentPage = Number(searchParams.page) || 1;
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    /**
     * 🛰️ ハイブリッド・データ取得
     * fetchPostList は内部で Markdown と Django API を統合してくれます。
     */
    const { results: allPosts, count: totalCount } = await fetchPostList('post', POSTS_PER_PAGE, offset);
    
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
                {allPosts.length > 0 ? (
                    allPosts.map((post) => {
                        // DjangoのID(数値)か、Markdownのslug(文字列)かを判別
                        const identifier = post.slug || post.id;
                        const displayImage = post.image || post.main_image_url || '/no-image.jpg';
                        const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '');

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
                                        {post.description || post.body_text?.substring(0, 100).replace(/[#*]/g, '')}...
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
                        <div className={styles.glitchText}>END_OF_DATA_STREAM</div>
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