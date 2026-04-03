/**
 * =====================================================================
 * 📂 BICSTATION Intelligence Archive (v6.0.0)
 * 🛡️ Maya's Logic: 自動ドメイン同期 & データ整合性補正版
 * 💡 Bridge v7.2 の自動検知を利用し、全ドメインで共通動作します。
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
// ✅ fetchPostList (Bridge v7.2) は内部でドメインを自動判別します
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
     * 🛰️ 統合データ取得
     * project引数を省略することで、Bridgeが自動的に headers() から
     * 'bicstation', 'saving', 'tiper', 'avflash' を判定して fetch します。
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
                {allPosts && allPosts.length > 0 ? (
                    allPosts.map((post) => {
                        /**
                         * 🛠️ データ・正規化ロジック (中身の違和感を解消)
                         */
                        // 1. 識別子の解決 (詳細ページへのパス)
                        const identifier = post.id || post.slug;
                        
                        // 2. 画像の解決 (Django優先 > WP/MD > fallback)
                        const displayImage = post.main_image_url || post.image || '/no-image.jpg';
                        
                        // 3. 日付の解決 (ロケール対応)
                        const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : 'RECENT');

                        // 4. カテゴリの解決 (Djangoの表示名があれば採用)
                        const displayCategory = post.site_display?.split('(')[0] || post.category || 'NEWS';

                        // 5. 本文/説明文の解決 (body_main も含めてフォールバック)
                        const rawContent = post.description || post.body_text || post.body_main || "";
                        const displayDescription = rawContent
                            .substring(0, 100)
                            .replace(/[#*]/g, '') // Markdown記号を簡易除去
                            + (rawContent.length > 100 ? '...' : '');

                        return (
                            <Link key={identifier} href={`/news/${identifier}`} className={styles.nodeCard}>
                                <div className={styles.cardThumbWrap}>
                                    <SafeImage 
                                        src={displayImage} 
                                        alt={post.title} 
                                        className={styles.cardThumb}
                                        fallback="/no-image.jpg"
                                    />
                                    <div className={styles.categoryBadge}>{displayCategory}</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardDate}>[{displayDate}]</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{post.title}</h2>
                                    <p className={styles.cardDescription}>
                                        {displayDescription}
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
                        baseUrl="/post" // 💡 既存の /post/ 構造に合わせます
                    />
                </div>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>← RETURN_TO_SYSTEM_ROOT</Link>
            </footer>
        </main>
    );
}