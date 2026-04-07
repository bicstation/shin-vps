/**
 * =====================================================================
 * 🛰️ BIC-SAVING Intelligence Archive Index (v12.5.0)
 * 🛡️ Maya's Logic: Secure Node Grid with Cyber-Render Style
 * 🚀 Card Sync: UnifiedProductCard v5.1 Integration
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

    // --- 🎯 STEP 1: 環境特定 (サイト設定の解決) ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);
    const currentProject = siteConfig?.site_name || 'saving';

    // --- 🎯 STEP 2: データ取得 (Django v5.1 API へのブリッジ) ---
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        site: currentProject, 
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* 🛰️ 背景装飾（サイバー空間演出） */}
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

            {/* 🚀 メイングリッド: 先ほどの UnifiedProductCard を展開 */}
            <main className={styles.contentGrid}>
                {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                        <div key={post.id} className={styles.nodeWrapper}>
                            {/* スキャンライン演出はカード外側で維持 */}
                            <div className={styles.scanLine}></div>
                            
                            <UnifiedProductCard 
                                data={post} 
                                siteConfig={siteConfig} 
                            />

                            {/* アーカイブ特有のメタ情報をカード下に補完する場合（任意） */}
                            <div className={styles.nodeStatusLine}>
                                <span className={styles.nodeId}>SEQ_ID: {post.id}</span>
                                <span className={styles.encryptStatus}>SECURE_LINK_ENCRYPTED</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noDataArea} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0' }}>
                        <p className={styles.errorMessage} style={{ color: '#00f2ff', fontSize: '0.8rem' }}>
                            [!] CRITICAL_ERROR: NO_INTEL_NODES_LOCATED
                        </p>
                    </div>
                )}
            </main>

            {/* 🔢 ページネーション (ナビゲーションコントロール) */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls} style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn} style={{ color: '#00f2ff', fontSize: '0.8rem' }}>
                                [« PREV_NODE]
                            </Link>
                        ) : <span style={{ opacity: 0.2, color: '#444' }}>[« PREV_NODE]</span>}
                        
                        <span className={styles.pageInfo} style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            NODE_PATH: {currentPage} / {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn} style={{ color: '#00f2ff', fontSize: '0.8rem' }}>
                                [NEXT_NODE »]
                            </Link>
                        ) : <span style={{ opacity: 0.2, color: '#444' }}>[NEXT_NODE »]</span>}
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