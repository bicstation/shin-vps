/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ トップページと同じ API パスとコンポーネントを使用
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import { fetchPostList } from '@/shared/lib/api/django/posts'; // Bridgeから最新APIへ変更
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// ✅ コンポーネント
import Pagination from '@/shared/components/molecules/Pagination';
import styles from './post.module.css'; 

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 12;

export default async function SavingArchivePage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // 1. パラメータの解決
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // 2. 識別情報の取得（トップページと共通の localhost 翻訳ロジック）
    const headerList = await headers();
    const rawHost = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    
    const host = (rawHost.includes('localhost') || rawHost.includes('127.0.0.1')) 
        ? "bic-saving.com" 
        : rawHost;

    const siteConfig = getSiteMetadata(host);

    // 3. データフェッチ (トップページと同じ引数順序: limit, offset, host)
    let displayPosts = [];
    let totalCount = 0;

    try {
        // fetchPostList(12, 0, host) というトップページの成功パターンをページネーション対応で適用
        const response = await fetchPostList(POSTS_PER_PAGE, offset, host);
        displayPosts = response?.results || [];
        totalCount = response?.count || 0;
    } catch (e) {
        console.error("🚨 [Archive-Fetch-Error] 通信失敗:", e.message);
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

    // 🛡️ データ安全性ガード (TypeError: b.replace 対策)
    const sanitizedPosts = displayPosts.map(post => ({
        ...post,
        title: post.title || "Untitled Intelligence",
        body_text: typeof post.body_text === 'string' ? post.body_text : "",
        description: typeof post.description === 'string' ? post.description : "",
        content: typeof post.content === 'string' ? post.content : "",
    }));

    return (
        <main className={styles.archiveContainer}>
            {/* 🛸 アーカイブヘッダー */}
            <header className={styles.archiveHeader}>
                <div className={styles.headerInner}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">HOME</Link> <span>/</span> SAVING_ARCHIVE
                    </div>
                    <h1 className={styles.mainTitle}>
                        暮らしの知恵アーカイブ
                        <span className={styles.subTitle}>/UNIFIED_DATA_INDEX</span>
                    </h1>
                    <div className={styles.statusLine}>
                        <span className={styles.infoLabel}>ACTIVE_HOST:</span> {host} | 
                        <span className={styles.infoLabel}>TOTAL_NODES:</span> {totalCount}
                    </div>
                </div>
            </header>

            {/* 📰 記事グリッド */}
            <div className={styles.gridWrapper}>
                {sanitizedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sanitizedPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                data={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.glitchText}>NO_DATA_STREAM_FOUND</div>
                        <p className="text-gray-400 mt-4 font-mono text-xs">
                            API_TARGET: {host} <br />
                            STATUS: DATA_EMPTY_OR_FETCH_FAILED
                        </p>
                    </div>
                )}
            </div>
            
            {/* 🔢 ページネーション */}
            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/post" 
                    />
                </div>
            )}

            <footer className={styles.archiveFooterOuter}>
                <Link href="/" className={styles.backBtn}>← RETURN_TO_SYSTEM_ROOT</Link>
            </footer>
        </main>
    );
}