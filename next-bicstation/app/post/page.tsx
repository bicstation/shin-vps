/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React, { Suspense } from 'react';
import Link from 'next/link';

// ❌ headers削除

import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

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
                <div className="w-12 h-12 border-t-2 border-cyan-500 animate-spin mb-6 rounded-full"></div>
                DECRYPTING_ARCHIVE_SECTOR...
            </div>
        }>
            <ArchiveIndexContent {...props} />
        </Suspense>
    );
}

async function ArchiveIndexContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // ✅ 固定に変更
    const host = "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    const currentPage = parseInt(sParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
    }).catch((e) => {
        console.error("🚨 [Archive Bridge Error]:", e);
        return { results: [], count: 0 };
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
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
                    INTELLIGENCE_ARCHIVE
                    <span className={styles.subTitle}>// {siteConfig.site_name.toUpperCase()}</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive}>DECRYPTED</span></span>
                    <span>TOTAL_NODES: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>RELAY_STATION: {host.toUpperCase()}</span>
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
                        <p className={styles.errorMessage}>[!] NO_SIGNAL_DETECTED_IN_CURRENT_SECTOR</p>
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
                        baseUrl="/post"
                    />
                </div>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « RETURN_TO_COMMAND_CENTER
                </Link>
                <div className="mt-12 opacity-20 font-mono text-[9px] tracking-[0.5em]">
                    SECURE_ACCESS_LOG: {new Date().toISOString()}
                </div>
            </footer>
        </div>
    );
}