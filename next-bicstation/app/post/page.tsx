/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Archive System (v12.8.0-FullSync)
 * 🛡️ Maya's Logic: Multi-Sector Information Aggregator
 * ---------------------------------------------------------------------
 * 🚀 統合ポイント:
 * 1. 【SHARED_PAGINATION】共通コンポーネントによる正規化ページネーション。
 * 2. 【BRIDGE_SYNC】django-bridge 経由で全ノードを安定取得。
 * 3. 【SEO_OPTIMIZED】pageパラメータの型安全な処理とURL整合。
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React, { Suspense } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント (最新の UnifiedProductCard / Pagination)
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

// ✅ 成功実績のある Bridge 経由の取得関数
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 ネオン・シアン基調のアーカイブ専用スタイル
import styles from './news.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 12;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

/** ✅ ローディング境界: 知識データのストリーミング */
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

/** 💡 知識アーカイブ・メインロジック */
async function ArchiveIndexContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // --- 🎯 STEP 1: ネットワーク・コンテキストの特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    // 🔢 ページネーション・オフセット計算 (1-based page to 0-based offset)
    const currentPage = parseInt(sParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 2: データ・デコード (django-bridge 経由) ---
    // 全アーカイブノードを高速スキャン
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
                    <span>STATUS: <span className={styles.statusActive}>DECRYPTED</span></span>
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
                        <Link href="/" className={styles.retryBtn + " mt-8 inline-block"}>
                            RE-INITIALIZE_CONNECTION
                        </Link>
                    </div>
                )}
            </main>

            {/* --- 🔢 ページネーション (強化版共通コンポーネント) --- */}
            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/post" // フォルダ構成に合わせて /news 等に調整可能
                    />
                </div>
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