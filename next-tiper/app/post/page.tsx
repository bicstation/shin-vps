/**
 * =====================================================================
 * 🛰️ Tiper Intelligence Archive Index (v12.1.0)
 * 🛡️ Maya's Logic: Secure Node Grid / Adult Sector Optimized
 * 🚀 修正ポイント: 
 * 1. AVFlash専用の背景演出（シアン×マゼンタ）の統合。
 * 2. ページネーションのUIをアーカイブCSSと同期。
 * 3. セクター情報 (currentProject) の動的表示を最適化。
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

    // --- 🎯 STEP 1: 環境特定 (AVFlash専用ノード) ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "av-flash.xc";
    const siteConfig = getSiteMetadata(host);
    const currentProject = siteConfig?.site_name || 'avflash';

    // --- 🎯 STEP 2: データ取得 (Django Bridge 経由) ---
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        site: currentProject, 
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🧬 BACKGROUND_DECORATION: シアンとマゼンタの二重干渉演出 */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 bg-[radial-gradient(circle_at_50%_0%,#ff00ea,transparent),radial-gradient(circle_at_10%_100%,#00f2ff,transparent)]"></div>

            {/* --- 📟 HEADER --- */}
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
                    <span>STATUS: <span style={{ color: '#00f2ff', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,242,255,0.5)' }}>CONNECTED</span></span>
                    <span>TOTAL_ASSETS: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>SIGNAL: STABLE</span>
                    <span className="hidden md:inline">ENCRYPTION: AES-256</span>
                </div>
            </header>

            {/* --- 📰 CONTENT_GRID --- */}
            <main className={styles.contentGrid}>
                {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                        <Link 
                            href={`/post/${post.slug}`} 
                            key={post.id} 
                            className={styles.nodeCard}
                        >
                            {/* ホバー時に走査するスキャンライン */}
                            <div className={styles.scanLine}></div>
                            
                            <div className={styles.cardThumbWrap}>
                                <img 
                                    src={post.image || '/api/placeholder/400/225'} 
                                    alt="" 
                                    className={styles.cardThumb} 
                                    loading="lazy"
                                />
                                {/* カテゴリーバッジ: マゼンタのアクセント */}
                                <span className={styles.categoryTag} style={{ borderColor: '#ff00ea', color: '#ff00ea', textShadow: '0 0 5px rgba(255,0,234,0.3)' }}>
                                    {post.category || 'UNCENSORED'}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.cardMeta}>
                                    <span className={styles.cardDate}>
                                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className={styles.nodeId}>ID: {post.slug?.slice(0, 8).toUpperCase()}</span>
                                </div>
                                
                                <h2 className={styles.cardTitle}>{post.title}</h2>
                                
                                <p className={styles.cardDescription}>
                                    {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 75) + '...'}
                                </p>
                                
                                <div className={styles.cardFooter}>
                                    <span className={styles.accessBtn}>DECRYPT_AND_OPEN _</span>
                                    <span className={styles.arrow}>▶</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.noDataArea} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '12rem 0' }}>
                        <div className="inline-block p-8 border border-[#ff00ea]/30 bg-[#ff00ea]/5 backdrop-blur-sm">
                            <p className={styles.errorMessage} style={{ color: '#ff00ea', letterSpacing: '6px', fontWeight: 'bold' }}>
                                [!] ERROR: NO_ARCHIVE_DATA_FOUND
                            </p>
                            <p className="text-[10px] text-gray-600 mt-4 font-mono">SECTOR_ID: {currentProject.toUpperCase()}</p>
                        </div>
                    </div>
                )}
            </main>

            {/* --- 🔢 PAGINATION --- */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                [« PREV_NODE]
                            </Link>
                        ) : (
                            <span style={{ opacity: 0.2, fontSize: '0.8rem', fontMemo: 'monospace' }}>[« PREV_NODE]</span>
                        )}
                        
                        <span className={styles.pageInfo}>
                            NODE_PITCH: <span style={{ color: '#00f2ff' }}>{currentPage}</span> / {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                [NEXT_NODE »]
                            </Link>
                        ) : (
                            <span style={{ opacity: 0.2, fontSize: '0.8rem', fontMemo: 'monospace' }}>[NEXT_NODE »]</span>
                        )}
                    </div>
                </nav>
            )}

            {/* --- 🏁 FOOTER --- */}
            <footer className={styles.archiveFooter}>
                <Link href="/" className={styles.backBtn}>
                    « TERMINATE_DATA_SESSION
                </Link>
                <div className="mt-8 opacity-20 text-[8px] tracking-[0.5em] font-mono">
                    AVFLASH_SECURE_GRID_PROTOCOL_V12
                </div>
            </footer>
        </div>
    );
}