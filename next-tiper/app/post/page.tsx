/**
 * =====================================================================
 * 🛰️ Tiper Intelligence Archive Index (v13.1.0)
 * 🛡️ Maya's Logic: Unified Node Grid / Secure Sector Optimized
 * 🚀 更新ログ:
 * 1. 個別カードを UnifiedProductCard コンポーネントへ完全移行。
 * 2. サイト固有の siteConfig をカードへ注入し、デザインの整合性を確保。
 * 3. グリッドレイアウトを共通カードのサイズ感に合わせて再定義。
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

import styles from './news.module.css';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 12;

export default async function ArchiveIndexPage({ searchParams }: { searchParams: { page?: string } }) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 1: 環境特定 (サイト設定の復元) ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteConfig = getSiteMetadata(host);
    const currentProject = siteConfig?.site_name || 'avflash';
    const siteColor = siteConfig?.theme_color || '#00f2ff';

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
            <div className="fixed inset-0 pointer-events-none opacity-[0.08] z-0 bg-[radial-gradient(circle_at_50%_0%,#ff00ea,transparent),radial-gradient(circle_at_10%_100%,#00f2ff,transparent)]"></div>

            {/* --- 📟 HEADER --- */}
            <header className={styles.archiveHeader + " relative z-10"}>
                <div className={styles.statusBadge}>
                    <span className={styles.pulseDot}></span>
                    RAW_DATA_STREAM: UNLOCKED
                </div>
                
                <h1 className={styles.mainTitle}>
                    AVFLASH_ARCHIVE
                    <span className={styles.subTitle}>// {currentProject.toUpperCase()}_SYSTEM</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span style={{ color: siteColor, fontWeight: 'bold', textShadow: `0 0 10px ${siteColor}80` }}>CONNECTED</span></span>
                    <span>TOTAL_ASSETS: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>SIGNAL: STABLE</span>
                    <span className="hidden md:inline">ENCRYPTION: AES-256</span>
                </div>
            </header>

            {/* --- 📰 CONTENT_GRID: UnifiedProductCard による統合表示 --- */}
            <main className="max-w-7xl mx-auto px-6 relative z-10">
                {allPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                post={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noDataArea} style={{ textAlign: 'center', padding: '12rem 0' }}>
                        <div className="inline-block p-10 border border-[#ff00ea]/30 bg-[#ff00ea]/5 backdrop-blur-md">
                            <p className={styles.errorMessage} style={{ color: '#ff00ea', letterSpacing: '6px', fontWeight: 'bold' }}>
                                [!] ERROR: NO_ARCHIVE_DATA_FOUND
                            </p>
                            <p className="text-[10px] text-gray-600 mt-4 font-mono uppercase tracking-[0.2em]">
                                SECTOR_ID: {currentProject} // TARGET_NODE: NULL
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* --- 🔢 PAGINATION --- */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper + " relative z-10 mt-32"}>
                    <div className={styles.pageControls} style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center' }}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                [« PREV_NODE]
                            </Link>
                        ) : (
                            <span className="opacity-10 text-[10px] font-mono">[« PREV_NODE]</span>
                        )}
                        
                        <span className={styles.pageInfo}>
                            NODE_PITCH: <span style={{ color: siteColor }}>{currentPage}</span> / {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                [NEXT_NODE »]
                            </Link>
                        ) : (
                            <span className="opacity-10 text-[10px] font-mono">[NEXT_NODE »]</span>
                        )}
                    </div>
                </nav>
            )}

            {/* --- 🏁 FOOTER --- */}
            <footer className={styles.archiveFooter + " relative z-10 pt-40"}>
                <Link href="/" className={styles.backBtn}>
                    « TERMINATE_DATA_SESSION
                </Link>
                <div className="mt-12 opacity-20 text-[8px] tracking-[0.5em] font-mono uppercase">
                    AVFLASH_SECURE_GRID_PROTOCOL_V13.1.0_UNIFIED
                </div>
            </footer>
        </div>
    );
}