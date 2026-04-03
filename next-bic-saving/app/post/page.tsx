/* /app/news/page.tsx */
// @ts-nocheck
// /home/maya/shin-dev/shin-vps/next-avflash/app/news/page.tsx

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
// ✅ fetchPostList をインポート (ハイブリッド取得用)
import { fetchPostList } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// ✅ コンポーネントのインポート
import Pagination from '@shared/components/molecules/Pagination';
import SafeImage from '@shared/components/atoms/SafeImage';
import styles from './news.module.css'; 

/**
 * 💡 Next.js 15 仕様: 動的レンダリングと再検証の設定
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

    // 2. ホスト判定を行い、適切なプロジェクトコンテキストを取得
    let currentProject = 'avflash';
    try {
        const headerList = await headers();
        const host = headerList.get('host') || "avflash.xyz";
        currentProject = getSiteMetadata(host)?.site_name || 'avflash';
    } catch (e) {
        // Build time fallback
    }

    /**
     * 🛰️ ハイブリッド・データ取得
     * 'news' カテゴリを指定し、現在のプロジェクトコンテキストで取得します。
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
                        // 🔗 Next.js 15 / [slug] 構造に合わせたリンク生成
                        // identifier は slug または id (Django ID)
                        const identifier = post.slug || post.id;
                        const displayImage = post.image || post.main_image_url || '/no-image.jpg';
                        
                        // 日付の正規化
                        const displayDate = post.created_at 
                            ? new Date(post.created_at).toLocaleDateString('ja-JP') 
                            : (post.date || '2026-03-18');

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
                                         post.body_text?.substring(0, 80).replace(/[#*\[\]]/g, '') || 
                                         "No analysis log available."}...
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

            <footer className={styles.archiveFooterOuter}>
                <Link href="/" className={styles.backBtn}>← RETURN_TO_SYSTEM_ROOT</Link>
            </footer>
        </main>
    );
}