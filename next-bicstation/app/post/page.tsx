/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Archive System (v12.7.5)
 * 🛡️ Maya's Logic: Multi-Sector Information Aggregator
 * ---------------------------------------------------------------------
 * 🚀 統合ポイント:
 * 1. 【NEON_CORE】最新のシアン発光制御 (news.module.css) を完全適用。
 * 2. 【BRIDGE_ACCESS】django-bridge 経由で全プロジェクトのノードを同期。
 * 3. 【DYNAMIC_ROUTING】ホスト名に基づいた自動サイト設定のデコード。
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント (最新の UnifiedProductCard を使用)
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ 成功実績のある Bridge 経由の取得関数
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 ネオン・シアン基調のアーカイブ専用スタイル
import styles from './news.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 12;

export default async function ArchiveIndexPage({ searchParams }: { searchParams: { page?: string } }) {
    // --- 🎯 STEP 1: ネットワーク・コンテキストの特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    // ページネーション・オフセット計算
    const currentPage = parseInt(searchParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 2: データ・デコード (django-bridge 経由) ---
    // 全アーカイブノードを高速スキャン
    const response = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { 
        offset: offset,
        // 必要に応じて content_type: 'news' 等のフィルタリングも可能
    });

    const allPosts = response?.results || (Array.isArray(response) ? response : []);
    const totalCount = response?.count || allPosts.length || 0;
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return (
        <div className={styles.archiveContainer}>
            {/* --- 🛰️ 背景レイヤー (Deep Abyss) --- */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#00f2ff,transparent)]"></div>
            </div>

            {/* --- 📡 アーカイブ・コントロール・ヘッダー --- */}
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
                    <span>STATUS: <span className={styles.statusActive}>DECRYPTING...</span></span>
                    <span>TOTAL_NODES: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>RELAY_STATION: {host.toUpperCase()}</span>
                </div>
            </header>

            {/* --- 📰 インテリジェンス・グリッド --- */}
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
                        <Link href="/post" className={styles.retryBtn + " mt-8 inline-block"}>
                            RE-INITIALIZE_CONNECTION
                        </Link>
                    </div>
                )}
            </main>

            {/* --- 🔢 ページネーション・コントロール --- */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                « PREVIOUS_SECTOR
                            </Link>
                        ) : (
                            <span className={styles.pageBtnDisabled}>PREVIOUS_SECTOR</span>
                        )}

                        <div className={styles.pageInfo}>
                            NODE_SECTOR: {currentPage} / {totalPages}
                        </div>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                NEXT_SECTOR »
                            </Link>
                        ) : (
                            <span className={styles.pageBtnDisabled}>NEXT_SECTOR</span>
                        )}
                    </div>
                </nav>
            )}

            {/* --- 👣 ステーション・イグジット --- */}
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