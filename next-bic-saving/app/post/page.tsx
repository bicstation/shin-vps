/**
 * =====================================================================
 * 🛰️ BIC-SAVING Intelligence Archive Index (v12.9.1)
 * 🛡️ Maya's Logic: Layout Integrity & Import Absolute Protocol
 * ---------------------------------------------------------------------
 * 🚀 修正・統合内容:
 * 1. 【EXECUTION_FIX】Link コンポーネントを 'next/link' から確実にインポート。
 * 2. 【BUILD_FIX】notFound のインポート元を 'next/navigation' に厳格固定。
 * 3. 【LAYOUT_FIX】article 幅を w-full に解放し、サイドバーとのレスポンシブ衝突を回避。
 * 4. 【GRID_OPT】2xl以上の広域ディスプレイでも破綻しない4カラム対応グリッド。
 * =====================================================================
 */

// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation'; // ✅ 正しいインポートパス
import { headers } from 'next/headers';
import Link from 'next/link'; // ✅ 必須: これがないと ReferenceError になります

// 共通API・ユーティリティ
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

import styles from './news.module.css';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 12;

export default async function ArchiveIndexPage({ searchParams }: { searchParams: { page?: string } }) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 1: 環境特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteConfig = getSiteMetadata(host);
    const rawProject = siteConfig?.site_name || 'bicstation';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();

    // --- 🎯 STEP 2: データ取得 ---
    const response = await fetchPostList(POSTS_PER_PAGE, offset, currentProject);
    
    // 基本的なエラーハンドリング
    if (!response) {
        console.error("[!] Failed to fetch data from stream");
    }

    const allPosts = response?.results || [];
    const totalCount = response?.count || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🛰️ BACKGROUND_DECORATION: 固定背景で奥行きを演出 */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[#05070a]"></div>
                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_50%_0%,#ff00ea,transparent),radial-gradient(circle_at_10%_100%,#00f2ff,transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* 💡 修正箇所: w-full を使用し、サイドバーを含むレイアウト内での最大幅を確保 */}
            <article className="relative z-10 w-full px-4 md:px-10 pt-24 pb-40">
                
                <header className={styles.archiveHeader}>
                    <div className={styles.statusBadge}>
                        <span className={styles.pulseDot}></span>
                        RAW_DATA_STREAM: UNLOCKED
                    </div>
                    
                    <h1 className={styles.mainTitle}>
                        {currentProject.toUpperCase()}_ARCHIVE
                        <span className={styles.subTitle}>// SYSTEM_ACTIVE</span>
                    </h1>

                    <div className={styles.statusLine}>
                        <span>STATUS: <span style={{color: '#00f2ff', fontWeight: '900'}}>CONNECTED</span></span>
                        <span>ASSETS: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                        <span className="hidden lg:inline text-white/20">|</span>
                        <span className="hidden lg:inline">ENCRYPTION: AES_256_ACTIVE</span>
                    </div>
                </header>

                <main className={styles.contentGrid}>
                    {allPosts.length > 0 ? (
                        /* 💡 グリッド最適化: 画面幅に応じて 1〜4 カラムに可変 */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {allPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noDataArea}>
                            <p className={styles.errorMessage}>
                                [!] NO_ARCHIVE_DATA_FOUND_IN_THIS_SECTOR
                            </p>
                        </div>
                    )}
                </main>

                {/* 🔢 PAGINATION_PROTOCOL: ページネーション */}
                {totalPages > 1 && (
                    <nav className={styles.paginationWrapper}>
                        <div className={styles.pageControls}>
                            {currentPage > 1 ? (
                                <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                    [« PREV_NODE]
                                </Link>
                            ) : (
                                <span className={styles.pageBtnDisabled}>[« PREV_NODE]</span>
                            )}
                            
                            <span className={styles.pageInfo}>
                                {currentPage} / {totalPages}
                            </span>

                            {currentPage < totalPages ? (
                                <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                    [NEXT_NODE »]
                                </Link>
                            ) : (
                                <span className={styles.pageBtnDisabled}>[NEXT_NODE »]</span>
                            )}
                        </div>
                    </nav>
                )}

                <footer className="mt-32 text-center">
                    <Link href="/" className={styles.backBtn}>
                        « TERMINATE_SESSION
                    </Link>
                </footer>
            </article>
        </div>
    );
}