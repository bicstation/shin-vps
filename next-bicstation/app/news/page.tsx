/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Archive System (v13.5.1-FullSync)
 * 🛡️ Maya's Logic: Hybrid WordPress & Django Aggregator
 * ---------------------------------------------------------------------
 * 🚀 統合ポイント:
 * 1. 【COMPONENTS】共通 Pagination コンポーネントへ完全移行。
 * 2. 【WP_PRIMARY】WordPress API を最優先ソースとして統合。
 * 3. 【SEO】クエリパラメータの維持とクリーンなURL生成をサポート。
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React, { Suspense } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

// ✅ 統合済みAPI 取得関数
import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
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

/** ✅ ローディング境界 */
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

/** 💡 ニュースアーカイブ・メインロジック */
async function ArchiveIndexContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // --- 🎯 STEP 1: ネットワーク・コンテキストの特定 ---
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    // ページネーション・オフセット計算
    const currentPage = parseInt(sParams.page || '1', 10);
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // --- 🎯 STEP 2: データ・フェッチ (WP優先ハイブリッド戦略) ---
    
    /**
     * 🛰️ STRATEGY:
     * WordPress側から現在のページの投稿を取得。
     * 応答がない場合のみ、Django Bridge へフォールバック。
     */
    let allPosts = [];
    let totalCount = 0;
    let dataSource = 'WORDPRESS_PRIMARY';

    try {
        // WordPress API から取得（WP側でページネーション対応している前提）
        // ※fetchWPTechInsights が totalCount も返せるようにラップされているのが理想
        const wpData = await fetchWPTechInsights(POSTS_PER_PAGE, offset);
        allPosts = wpData?.posts || wpData || [];
        totalCount = wpData?.total || allPosts.length;
    } catch (e) {
        console.warn("⚠️ [WP Fetch Failed]: Falling back to Django Bridge.");
    }

    // 2. もし WordPress から取得できなかった場合、Django Bridge を起動
    if (!allPosts || allPosts.length === 0) {
        const djangoResponse = await fetchDjangoBridgeContent('posts', POSTS_PER_PAGE, { offset });
        allPosts = djangoResponse?.results || (Array.isArray(djangoResponse) ? djangoResponse : []);
        totalCount = djangoResponse?.count || allPosts.length;
        dataSource = 'DJANGO_FALLBACK_NODE';
    }

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
                    最新技術・ニュースアーカイブ
                    <span className={styles.subTitle}>// {siteConfig.site_name.toUpperCase()} INTELLIGENCE</span>
                </h1>

                <div className={styles.statusLine}>
                    <span>STATUS: <span className={styles.statusActive}>{dataSource}...</span></span>
                    <span>記録数: <span className={styles.countNum}>{totalCount.toLocaleString()}</span></span>
                    <span>中継局: {host.toUpperCase()}</span>
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
                        <p className={styles.errorMessage}>[!] 信号を検知できません。同期サーバーを確認してください。</p>
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
                        baseUrl="/news"
                    />
                </div>
            )}

            {/* --- 👣 フッター --- */}
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