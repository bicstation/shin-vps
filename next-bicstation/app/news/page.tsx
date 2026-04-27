/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Archive System
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React, { Suspense } from 'react';
import Link from 'next/link';

// ❌ headers削除

import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './news.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 12;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ArchiveIndexPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-cyan-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-12 h-12 border-t-2 border-cyan-400 animate-spin mb-6 rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
                SYNCHRONIZING_NEWS_STREAMS...
            </div>
        }>
            <ArchiveIndexContent {...props} />
        </Suspense>
    );
}

async function ArchiveIndexContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // ✅ headers削除 → 固定
    const host = "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    const currentPage = parseInt(sParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    let allPosts = [];
    let totalCount = 0;
    let dataSource = 'WORDPRESS_PRIMARY';

    try {
        const wpData = await fetchWPTechInsights(POSTS_PER_PAGE, offset);
        allPosts = wpData?.posts || wpData || [];
        totalCount = wpData?.total || allPosts.length;
    } catch (e) {
        console.warn("⚠️ [WP Fetch Failed]: Falling back to Django Bridge.");
    }

    if (!allPosts || allPosts.length === 0) {
        const djangoResponse = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { offset });
        allPosts = djangoResponse?.results || (Array.isArray(djangoResponse) ? djangoResponse : []);
        totalCount = djangoResponse?.count || allPosts.length;
        dataSource = 'DJANGO_FALLBACK_NODE';
    }

    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE) || 1;

    return (
        <div className={styles.archiveContainer}>

            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#00f2ff,transparent)]"></div>
            </div>

            <header className={styles.archiveHeader}>
                <div className={styles.statusBadge}>
                    <span className={styles.pulseDot}></span>
                    NETWORK_STATION_ACCESS: ONLINE
                </div>
                
                <h1 className={styles.mainTitle}>
                    最新技術・ニュースアーカイブ
                    <span className={styles.subTitle}>// {siteConfig.site_name.toUpperCase()} INTELLIGENCE</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive}>{dataSource}...</span></span>
                    <span>記録数: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>中継局: {host.toUpperCase()}</span>
                </div>
            </header>

            <main className={styles.contentGrid}>
                {allPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
                        <div className="text-4xl mb-8 opacity-20">⚠️</div>
                        <p className={styles.errorMessage}>[!] 信号を検知できません。</p>
                        <Link href="/" className={styles.retryBtn + " mt-8 inline-block"}>
                            RE-INITIALIZE_CONNECTION
                        </Link>
                    </div>
                )}
            </main>

            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/news"
                    />
                </div>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « コマンドセンターへ戻る
                </Link>
                <div className="mt-12 opacity-20 font-mono text-[9px] tracking-[0.5em]">
                    SOURCE_STREAMS: WORDPRESS_CORE & DJANGO_BRIDGE_STATION
                </div>
            </footer>
        </div>
    );
}