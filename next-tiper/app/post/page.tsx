/* /app/news/page.tsx */
// @ts-nocheck
// /home/maya/shin-dev/shin-vps/next-tiper/app/post/page.tsx

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { fetchPostList } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// ✅ 共通コンポーネント
import Pagination from '@shared/components/molecules/Pagination';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './news.module.css'; 

/**
 * 💡 Next.js 15: 動的レンダリングと再検証の設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 9;

export default async function NewsArchivePage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // 1. Next.js 15 仕様: searchParams を await して取得
    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // 2. ホスト判定を行い、'tiper' などのプロジェクトコンテキストを取得
    let currentProject = 'tiper';
    try {
        const headerList = await headers();
        const host = headerList.get('host') || "tiper.live";
        currentProject = getSiteMetadata(host)?.site_tag || 'tiper';
    } catch (e) {
        // Build time fallback
    }

    /**
     * 🛰️ ハイブリッド・データ取得
     * fetchPostList は内部で Markdown と Django API を統合。
     * currentProject (siteTag) を渡すことで、他セクター（AVFLASH等）との混線を防ぎます。
     */
    const { results: allPosts, count: totalCount } = await fetchPostList(
        'news', 
        POSTS_PER_PAGE, 
        offset, 
        currentProject
    );
    
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
                        const displayImage = post.image || post.main_image_url || '/no-image.jpg';
                        
                        // 日付の正規化 (created_at があれば優先)
                        const displayDate = post.created_at 
                            ? new Date(post.created_at).toLocaleDateString('ja-JP') 
                            : (post.date || 'RECENT_ENTRY');

                        return (
                            <Link key={identifier} href={`/post/${identifier}`} className={styles.nodeCard}>
                                <div className={styles.cardThumbWrap}>
                                    <SafeImage 
                                        src={displayImage} 
                                        alt={post.title} 
                                        className={styles.cardThumb}
                                        fallback="/no-image.jpg"
                                    />
                                    <div className={styles.categoryBadge}>{post.category || 'INTELLIGENCE'}</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardDate}>[{displayDate}]</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{post.title}</h2>
                                    <p className={styles.cardDescription}>
                                        {post.description || 
                                         post.body_text?.substring(0, 90).replace(/[#*\[\]]/g, '')}...
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
                <div className="mt-16 flex justify-center border-t border-white/5 pt-10">
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