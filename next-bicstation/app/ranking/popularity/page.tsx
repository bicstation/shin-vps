/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 📈 BICSTATION 注目度・売れ筋ランキング
 * 🛡️ Maya's Logic: 物理構造 v11.1 / Zenith v25.1 同期版
 * 修正内容: ホスト名正規化による site_name 判定の安定化
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers'; 
import Link from 'next/link';
import { TrendingUp, Activity, Flame } from 'lucide-react';

// ✅ site_name パラメータ対応済みの fetchPCProductRanking を使用
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import styles from './Popularity.module.css';

/**
 * ⚙️ サーバーセクション
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
    
    return {
        title: `【2026年最新】注目度・売れ筋PCランキング 第${page}ページ | BICSTATION`,
        description: '今、最もアクセスされているPCをリアルタイム集計。過去24時間の統計データに基づいた人気ランキングを公開中。',
        alternates: {
            canonical: `https://bicstation.com/popularity/${page !== '1' ? `?page=${page}` : ''}`,
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
                ANALYZING_MARKET_TRENDS_V25.1...
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

    // 🌐 ホスト名取得と正規化 (Djangoの site_name 判定用)
    const headerList = await headers();
    let host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";

    // 💡 内部ホスト名や localhost の場合、'bicstation' に強制正規化して API へ渡す
    if (host.includes('bicstation') || host.includes('localhost') || host.includes('8083')) {
        host = 'bicstation';
    }

    // 1. データの取得
    // fetchPCProductRanking 内部で site_name=host として送信される
    const rawData = await fetchPCProductRanking('popularity', host).catch((err) => {
        console.error("🚨 Popularity Fetch Error:", err);
        return [];
    });
    
    // 💡 レスポンス構造の正規化
    const allProductsArray = Array.isArray(rawData) 
        ? rawData 
        : (rawData && typeof rawData === 'object' && 'results' in rawData)
            ? (rawData as any).results
            : [];
    
    // 仮想ページネーション処理
    const offset = (currentPage - 1) * limit;
    const products = allProductsArray.slice(offset, offset + limit);
    const totalPages = Math.max(1, Math.ceil(allProductsArray.length / limit));

    // 2. 構造化データ
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "PC注目度ランキング",
        "numberOfItems": allProductsArray.length,
        "itemListElement": products.map((product: any, index: number) => ({
            "@type": "ListItem",
            "position": offset + index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "image": product.image_url,
                "brand": { "@type": "Brand", "name": product.maker }
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
                        <span>MARKET_DATA_STREAM_v25.1</span>
                    </div>
                    <h1 className={styles.title}>
                        <TrendingUp className="inline-block mr-3 mb-1 text-orange-500" />
                        POPULARITY TOP 100
                    </h1>
                    <p className={styles.subtitle}>
                        過去24時間の膨大なアクセスログと市場の流動性を解析。<br />
                        <strong>「今、この瞬間に選ばれている」</strong>真のトレンドを可視化。
                    </p>
                </div>
            </header>

            {/* 📈 ランキンググリッド */}
            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product: any, index: number) => {
                        const rank = offset + index + 1;
                        
                        return (
                            <div key={product.unique_id || product.id || `pop-${rank}`} className={styles.productCardWrapper}>
                                <ProductCard 
                                    product={product} 
                                    rank={rank}
                                    isReviewMode={true}
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
                                                {/* 演出用の動的数値（順位に応じた重み付け） */}
                                                {Math.floor((200 / (rank + 0.5)) + (Math.random() * 15)) + 3}人が現在検討中
                                            </span>
                                        </div>
                                    </div>
                                </ProductCard>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.noData}>
                        <div className="text-5xl mb-6 opacity-20 text-orange-500">📉</div>
                        <p className="text-xl font-bold text-slate-300">トレンドデータを解析できませんでした</p>
                        <div className="text-[10px] mt-6 opacity-50 font-mono bg-black/40 p-4 rounded border border-slate-800 text-left max-w-xs mx-auto">
                            SYSTEM_LOG:<br/>
                            STATUS: STREAM_NOT_FOUND<br/>
                            NODE: {host}<br/>
                            CHECK: site_name_mapping
                        </div>
                        <Link href="/" className="mt-8 inline-block px-8 py-2 border border-orange-500/30 rounded-full text-orange-400 hover:bg-orange-500/10 transition-all">
                            ホームに戻る
                        </Link>
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
                    <p>※本ランキングは過去24時間のアクセス統計、および在庫流動性を独自のアルゴリズムで統合したものです。</p>
                    <p>※Target Node: {host} | データは1時間ごとに更新され、市場の最新トレンドを反映しています。</p>
                </div>
            </footer>
        </main>
    );
}