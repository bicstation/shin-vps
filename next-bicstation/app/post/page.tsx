/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント (トップと同じものを使用)
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ 成功実績のある Bridge 経由の取得関数
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 先ほど作成したシアン基調のスタイル
import styles from './news.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 12;

export default async function ArchiveIndexPage({ searchParams }: { searchParams: { page?: string } }) {
    // --- 🎯 STEP 1: コンテキスト特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    // ページネーション計算
    const currentPage = parseInt(searchParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 2: データ取得 (トップページと同じエンドポイント 'posts' を使用) ---
    // content_type を指定せず、全アーカイブを取得する設定
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        // 必要に応じてここで content_type: 'news' などを追加可能
    });

    // 💡 トップページと同じく結果を抽出
    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🛰️ アーカイブヘッダー */}
            <header className={styles.archiveHeader}>
                <div className={styles.statusBadge}>
                    <span className={styles.pulseDot}></span>
                    NETWORK_ARCHIVE_ACCESS: ACTIVE
                </div>
                
                <h1 className={styles.mainTitle}>
                    INTELLIGENCE_ARCHIVE
                    <span className={styles.subTitle}>// {siteConfig.site_name.toUpperCase()}</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive}>ONLINE</span></span>
                    <span>TOTAL_NODES: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>DOMAIN: {host}</span>
                </div>
            </header>

            {/* 📰 記事グリッドエリア */}
            <main className={styles.contentGrid}>
                {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                        <UnifiedProductCard 
                            key={post.id} 
                            data={post} 
                            siteConfig={siteConfig} 
                            // 💡 一覧ページ用の追加スタイルが必要ならここで調整
                        />
                    ))
                ) : (
                    <div className={styles.noDataArea}>
                        <p className={styles.errorMessage}>[!] NO_DATA_DETECTED_IN_THIS_SECTOR</p>
                        <Link href="/post" className={styles.retryBtn}>RESET_CONNECTION</Link>
                    </div>
                )}
            </main>

            {/* 🔢 ページネーション */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageInfo}>
                        PAGE: {currentPage} / {totalPages}
                    </div>
                    <div className={styles.pageControls}>
                        {currentPage > 1 && (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>« PREV</Link>
                        )}
                        {currentPage < totalPages && (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>NEXT »</Link>
                        )}
                    </div>
                </nav>
            )}

            {/* 👣 フッター・ナビ */}
            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « RETURN_TO_COMMAND_CENTER
                </Link>
            </footer>
        </div>
    );
}