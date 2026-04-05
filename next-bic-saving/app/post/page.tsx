/**
 * =====================================================================
 * 🛰️ AVFLASH Intelligence Archive Index (v12.0.1)
 * 🛡️ Maya's Logic: Secure Node Grid / Adult Sector Optimized
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './news.module.css';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 12;

export default async function ArchiveIndexPage({ searchParams }: { searchParams: { page?: string } }) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 1: 環境特定 (AVFlash専用) ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "av-flash.xc";
    const siteConfig = getSiteMetadata(host);
    const currentProject = siteConfig?.site_name || 'avflash'; // 明示的にavflashを指定

    // --- 🎯 STEP 2: データ取得 ---
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        site: currentProject, 
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🛰️ 背景演出: AVFlash用に少し紫を混ぜたグローを入れると雰囲気が増します */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[radial-gradient(circle_at_50%_0%,#ff00ea,transparent),radial-gradient(circle_at_10%_100%,#00f2ff,transparent)]"></div>

            <header className={styles.archiveHeader}>
                <div className={styles.statusBadge}>
                    <span className={styles.pulseDot}></span>
                    RAW_DATA_STREAM: UNLOCKED
                </div>
                
                <h1 className={styles.mainTitle}>
                    AVFLASH_ARCHIVE
                    <span className={styles.subTitle}>// {currentProject.toUpperCase()}_SYSTEM</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive} style={{color: '#00f2ff'}}>CONNECTED</span></span>
                    <span>TOTAL_ASSETS: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>SIGNAL: STABLE</span>
                </div>
            </header>

            <main className={styles.contentGrid}>
                {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                        <Link 
                            href={`/post/${post.slug}`} 
                            key={post.id} 
                            className={styles.nodeCard}
                        >
                            <div className={styles.scanLine}></div>
                            
                            <div className={styles.cardThumbWrap}>
                                <img 
                                    src={post.image || '/api/placeholder/400/225'} 
                                    alt="" 
                                    className={styles.cardThumb} 
                                />
                                <span className={styles.categoryTag} style={{ borderColor: '#ff00ea', color: '#ff00ea' }}>
                                    {post.category || 'UNCENSORED'}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.cardDate}>
                                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className={styles.nodeId}>HASH: {post.slug?.slice(0, 10)}</span>
                                </div>
                                <h2 className={styles.cardTitle}>{post.title}</h2>
                                <p className={styles.cardDescription}>
                                    {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 80) + '...'}
                                </p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.accessBtn}>DECRYPT_AND_OPEN _</span>
                                    <span className={styles.arrow}>▶</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.noDataArea} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0' }}>
                        <p className={styles.errorMessage} style={{ color: '#ff00ea', letterSpacing: '4px' }}>
                            [!] NO_ARCHIVE_DATA_IN_THIS_SECTOR
                        </p>
                    </div>
                )}
            </main>

            {/* 🔢 ページネーション */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                [« PREV]
                            </Link>
                        ) : <span style={{ opacity: 0.1 }}>[« PREV]</span>}
                        
                        <span className={styles.pageInfo}>
                            TRACK: {currentPage} / {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                [NEXT »]
                            </Link>
                        ) : <span style={{ opacity: 0.1 }}>[NEXT »]</span>}
                    </div>
                </nav>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « TERMINATE_SESSION
                </Link>
            </footer>
        </div>
    );
}