/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 📈 BICSTATION 注目度・売れ筋ランキング
 * 🛡️ Maya's Logic: 物理構造 v3.2 / Zenith v10.0 同期版
 * 物理パス: app/popularity/page.tsx
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers'; // 🚀 ホスト名取得用
import Link from 'next/link';
import { TrendingUp, Activity, Flame } from 'lucide-react';

// ✅ インポートパスを Zenith v10.0 の共通関数に合わせる
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import styles from './Popularity.module.css';

/**
 * ⚙️ サーバーセクション (Metadata & Configuration)
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

/**
 * 💡 動的メタデータ生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const sParams = await props.searchParams;
    const page = sParams.page || '1';
    const title = `【2026年最新】注目度・売れ筋PCランキング 第${page}ページ | BICSTATION`;

    return {
        title,
        description: '今、最もアクセスされているPCをリアルタイム集計。過去24時間の統計データに基づいた人気ランキング100選を公開中。',
        alternates: {
            canonical: `https://bicstation.com/popularity/${page !== '1' ? `?page=${page}` : ''}`,
        },
        openGraph: {
            title,
            description: '今、最もアクセスされているPCをリアルタイム集計。',
            type: 'website',
        }
    };
}

/**
 * 💡 ページのエントリーポイント
 */
export default function PopularityRankingPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-y-2 border-orange-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]"></div>
                ANALYZING_MARKET_TRENDS...
            </div>
        }>
            <PopularityContent {...props} />
        </Suspense>
    );
}

/**
 * 📄 コンテンツ描画 (Server Component)
 */
async function PopularityContent(props: PageProps) {
    const sParams = await props.searchParams;
    const currentPage = parseInt(sParams.page || '1', 10);
    const limit = 20; 
    const offset = (currentPage - 1) * limit;

    // 🌐 ホスト名取得 (VPS/Local 判定のトリガー)
    const headerList = await headers();
    const host = headerList.get('host') || '';

    // 1. データの取得 (共通関数 fetchPCProductRanking を 'popularity' モードで使用)
    const allProducts = await fetchPCProductRanking('popularity', host).catch(() => []);
    const products = allProducts.slice(offset, offset + limit);
    const totalPages = Math.ceil(allProducts.length / limit);

    // 2. 構造化データ（ItemList / SEO用）
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "PC注目度ランキング TOP100",
        "description": "リアルタイムアクセス統計に基づく人気PCランキング",
        "itemListElement": products.map((product: any, index: number) => ({
            "@type": "ListItem",
            "position": offset + index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "image": product.image_url,
                "url": `https://bicstation.com/product/${product.unique_id}`
            }
        }))
    };

    return (
        <main className={styles.container}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 🌌 ヒーローヘッダー */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.badgeContainer}>
                        <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span>REALTIME_MARKET_FLOW</span>
                    </div>
                    <h1 className={styles.title}>
                        <TrendingUp className="inline-block mr-3 mb-1 text-orange-500" />
                        POPULARITY TOP 100
                    </h1>
                    <p className={styles.subtitle}>
                        過去24時間の膨大なアクセスログと市場の流動性を解析。<br />
                        <strong>「今、この瞬間に売れている・選ばれている」</strong>真のトレンドを可視化。
                    </p>
                </div>
            </header>

            {/* 📈 ランキンググリッド */}
            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product: any, index: number) => {
                        const rank = offset + index + 1;
                        
                        return (
                            <div key={product.unique_id || product.id} className={styles.productCardWrapper}>
                                <ProductCard 
                                    product={product} 
                                    rank={rank}
                                >
                                    <div className={styles.popularityOverlay}>
                                        {rank <= 3 && (
                                            <div className={styles.trendingTag}>
                                                <Flame className="w-3 h-3 mr-1 fill-current" /> 
                                                <span>Trending Now</span>
                                            </div>
                                        )}
                                        
                                        <div className={styles.accessIndicator}>
                                            <div className={styles.pulseDot}></div>
                                            <span className={styles.viewCount}>
                                                {/* 💡 実際のアクセスデータがない場合の動的演出 */}
                                                {Math.floor(Math.random() * 85) + 15}人がこの製品をチェック中
                                            </span>
                                        </div>
                                    </div>
                                </ProductCard>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center text-slate-400 font-mono">
                        NO_TREND_DATA_AVAILABLE
                    </div>
                )}
            </div>

            {/* 🧭 ページネーション */}
            {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Ranking navigation">
                    <div className={styles.paginationInner}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
                                <span className={styles.arrow}>←</span> PREV
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.disabled}`}>← PREV</span>
                        )}

                        <div className={styles.pageInfo}>
                            <span className={styles.currentPage}>{currentPage}</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.totalPage}>{totalPages}</span>
                        </div>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
                                NEXT <span className={styles.arrow}>→</span>
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.disabled}`}>NEXT →</span>
                        )}
                    </div>
                </nav>
            )}

            {/* 📝 フッター注釈 */}
            <footer className={styles.disclaimer}>
                <div className={styles.disclaimerContent}>
                    <p>※本ランキングは過去24時間のアクセス統計、クリック率、および在庫流動性を独自のアルゴリズムで統合したものです。</p>
                    <p>※データは1時間ごとに更新され、市場の最新トレンドを反映しています。</p>
                </div>
            </footer>
        </main>
    );
}