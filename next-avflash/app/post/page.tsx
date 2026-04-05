/**
 * =====================================================================
 * 🛰️ BIC-SAVING Intelligence Archive Index (v12.0.0)
 * 🛡️ Maya's Logic: Secure Node Grid with Cyber-Render Style
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

    // --- 🎯 STEP 1: 環境特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);
    const currentProject = siteConfig?.site_name || 'saving';

    // --- 🎯 STEP 2: データ取得 (Saving専用フィルタ) ---
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        site: currentProject, 
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🛰️ 背景装飾（CSS側にない演出を補完） */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 bg-[radial-gradient(circle_at_50%_0%,#00f2ff,transparent)]"></div>

            <header className={styles.archiveHeader}>
                <div className={styles.statusBadge}>
                    <span className={styles.pulseDot}></span>
                    NETWORK_ARCHIVE_ACCESS: GRANTED
                </div>
                
                <h1 className={styles.mainTitle}>
                    INTELLIGENCE_ARCHIVE
                    <span className={styles.subTitle}>// {currentProject.toUpperCase()}_SECTOR</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive} style={{color: '#00f2ff'}}>ONLINE</span></span>
                    <span>NODES_FOUND: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>DOMAIN: {host}</span>
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
                            {/* スキャンライン演出用タグ */}
                            <div className={styles.scanLine}></div>
                            
                            <div className={styles.cardThumbWrap}>
                                <img 
                                    src={post.image || '/api/placeholder/400/200'} 
                                    alt={post.title} 
                                    className={styles.cardThumb} 
                                />
                                <span className={styles.categoryTag}>
                                    {post.site || 'INTEL'}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.cardDate}>
                                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className={styles.nodeId}>ID: {post.slug?.slice(0, 8)}</span>
                                </div>
                                <h2 className={styles.cardTitle}>{post.title}</h2>
                                <p className={styles.cardDescription}>
                                    {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...'}
                                </p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.accessBtn}>READ_MORE _</span>
                                    <span className={styles.arrow}>▶</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.noDataArea} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0' }}>
                        <p className={styles.errorMessage} style={{ color: '#00f2ff', fontSzie: '0.8rem' }}>
                            [!] CRITICAL_ERROR: NO_INTEL_NODES_LOCATED
                        </p>
                    </div>
                )}
            </main>

            {/* 🔢 ページネーション */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls} style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn} style={{ color: '#00f2ff', fontSize: '0.8rem' }}>
                                [« PREV_NODE]
                            </Link>
                        ) : <span style={{ opacity: 0.2 }}>[« PREV_NODE]</span>}
                        
                        <span className={styles.pageInfo} style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            NODE_PATH: {currentPage} / {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn} style={{ color: '#00f2ff', fontSize: '0.8rem' }}>
                                [NEXT_NODE »]
                            </Link>
                        ) : <span style={{ opacity: 0.2 }}>[NEXT_NODE »]</span>}
                    </div>
                </nav>
            )}

            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « EXIT_TO_MAIN_TERMINAL
                </Link>
            </footer>
        </div>
    );
}