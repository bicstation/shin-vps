/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Archive System (v13.5.0-WP_Fusion)
 * 🛡️ Maya's Logic: Hybrid WordPress & Django Aggregator
 * ---------------------------------------------------------------------
 * 🚀 統合ポイント:
 * 1. 【WP_PRIMARY】WordPress API を最優先ソースとして統合。
 * 2. 【FALLBACK】WPが応答しない場合のみ Django Bridge から補完。
 * 3. 【JP_UI】技術情報を扱うアーカイブとして日本語タイトルを最適化。
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ 統合済みAPI 取得関数
// wordpress.ts に集約した fetchWPTechInsights を使用
import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
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

    // --- 🎯 STEP 2: データ・フェッチ (WP優先ハイブリッド戦略) ---
    
    /**
     * 🛰️ STRATEGY:
     * まず WordPress (legacy.nabejuku.com) のテックインサイトをスキャン。
     * 応答がない、またはデータが空の場合のみ、ローカルの Django DB へフォールバックします。
     */
    let allPosts = await fetchWPTechInsights(POSTS_PER_PAGE);
    let totalCount = allPosts.length;
    let dataSource = 'WORDPRESS_PRIMARY';

    // 2. もし WordPress から取得できなかった場合、Django Bridge を起動
    if (!allPosts || allPosts.length === 0) {
        const offset = (currentPage - 1) * POSTS_PER_PAGE;
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

            {/* --- 🔢 ページネーション --- */}
            {totalPages > 1 && (
                <nav className={styles.paginationWrapper}>
                    <div className={styles.pageControls}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageBtn}>
                                « 前のセクターへ
                            </Link>
                        ) : (
                            <span className={styles.pageBtnDisabled}>PREVIOUS_SECTOR</span>
                        )}

                        <div className={styles.pageInfo}>
                            SECTION: {currentPage} / {totalPages}
                        </div>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageBtn}>
                                次のセクターへ »
                            </Link>
                        ) : (
                            <span className={styles.pageBtnDisabled}>NEXT_SECTOR</span>
                        )}
                    </div>
                </nav>
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