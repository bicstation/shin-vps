/**
 * =====================================================================
 * 🏆 BICSTATION PCスペック解析ランキング
 * 🛡️ Maya's Logic: 物理構造 v11.1 / Zenith v25.1.1 同期版
 * ---------------------------------------------------------------------
 * 🚀 統合ポイント:
 * 1. 【SHARED_PAGINATION】一貫したナビゲーション体験の提供。
 * 2. 【ASYNC_PARAMS】Next.js 15+ の Promise 形式 searchParams に完全対応。
 * 3. 【AI_VISUALIZER】レーダーチャートによる多角的なスペック分析の可視化。
 * =====================================================================
 */

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

// ✅ stats.ts (site_name対応版) を参照
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import RadarChart from '@/shared/components/atoms/RadarChart';
import Pagination from '@/shared/components/molecules/Pagination';

import styles from './Ranking.module.css';

/**
 * ⚙️ サーバーセクション
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

/**
 * 💡 SEOメタデータ生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const sParams = await props.searchParams;
    const page = sParams.page || '1';
    
    return {
        title: `【2026年最新】PCスペック解析ランキング 第${page}ページ | BICSTATION`,
        description: `AI解析スコアに基づいたPC製品の最新ランキング。CPU・GPU・コスパ・携帯性・AI性能を5軸スコアで徹底比較。`,
        alternates: {
            canonical: `https://bicstation.com/ranking/${page !== '1' ? `?page=${page}` : ''}`,
        }
    };
}

/**
 * 🏗️ ページエントリポイント
 */
export default function RankingPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                CALCULATING_RANKINGS_V25.1...
            </div>
        }>
            <RankingContent {...props} />
        </Suspense>
    );
}

/**
 * 📄 コンテンツ描画 (Server Component)
 */
async function RankingContent(props: PageProps) {
    const sParams = await props.searchParams;
    const currentPage = parseInt(sParams.page || '1', 10);
    const limit = 20; 

    // 🌐 ホスト名取得と正規化
    const headerList = await headers();
    let host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    
    // ホスト名の正規化
    if (host.includes('bicstation') || host.includes('localhost')) {
        host = 'bicstation';
    }

    /**
     * 🚀 データフェッチ
     */
    const rawData = await fetchPCProductRanking('score', host).catch((err) => {
        console.error("🚨 Ranking Fetch Error:", err);
        return { results: [], count: 0 };
    });
    
    // レスポンス構造の正規化
    const productsArray = Array.isArray(rawData) 
        ? rawData 
        : (rawData?.results || []);
    
    // 仮想ページネーション（サーバー側で全件取得される場合の切り出し処理）
    const offset = (currentPage - 1) * limit;
    const products = productsArray.slice(offset, offset + limit);
    const totalCount = productsArray.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // JSON-LD (構造化データ)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "PCスペック解析ランキング",
        "numberOfItems": totalCount,
        "itemListElement": products.map((p: any, i: number) => ({
            "@type": "ListItem",
            "position": offset + i + 1,
            "item": {
                "@type": "Product",
                "name": p.name,
                "brand": { "@type": "Brand", "name": p.maker }
            }
        }))
    };

    const getChartColor = (rank: number) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return '#3b82f6'; // Default Blue
    };

    return (
        <main className={styles.container}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* --- 🚀 ヒーロー・セクション --- */}
            <header className={styles.header}>
                <div className={styles.heroInner}>
                    <div className={styles.badge}>RANKING_ENGINE_v25.1.1</div>
                    <h1 className={styles.title}>
                        <span className={styles.titleIcon}>💻</span>
                        PCスペック解析ランキング
                    </h1>
                    <p className={styles.subtitle}>
                        全アーカイブのスペックをAIが5軸で完全数値化。ブランド力に惑わされない、<strong>真の性能とコストパフォーマンス</strong>を可視化。
                    </p>
                </div>
            </header>
            
            {/* --- 📊 ランキング・グリッド --- */}
            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product: any, index: number) => {
                        const rank = offset + index + 1;
                        
                        // スコアデータの抽出と正規化
                        const chartData = [
                            { subject: 'CPU', value: Number(product.score_cpu || 0), fullMark: 100 },
                            { subject: 'GPU', value: Number(product.score_gpu || 0), fullMark: 100 },
                            { subject: 'コスパ', value: Number(product.score_cost || 0), fullMark: 100 },
                            { subject: '携帯性', value: Number(product.score_portable || 0), fullMark: 100 },
                            { subject: 'AI性能', value: Number(product.score_ai || 0), fullMark: 100 },
                        ];

                        const totalScore = Math.round(chartData.reduce((acc, cur) => acc + cur.value, 0) / 5);

                        return (
                            <div key={product.unique_id || product.id || `rank-${rank}`} className={styles.rankingCardWrapper}>
                                <ProductCard 
                                    product={product} 
                                    rank={rank}
                                    isReviewMode={true}
                                >
                                    {/* --- 🧬 AI解析オーバーレイ (カード内挿入) --- */}
                                    <div className={styles.analysisOverlay}>
                                        <div className={styles.chartHeader}>
                                            <div className={styles.labelGroup}>
                                                <span className={styles.analysisLabel}>AI_ANALYSIS_SCORE</span>
                                                <span className={styles.scoreDetail}>Target: {host.toUpperCase()}</span>
                                            </div>
                                            <div className={styles.totalScoreBox}>
                                                <span className={styles.scoreValue}>{totalScore}</span>
                                                <span className={styles.scoreUnit}>/100</span>
                                            </div>
                                        </div>

                                        <div className={styles.radarContainer}>
                                            <RadarChart 
                                                data={chartData} 
                                                color={getChartColor(rank)} 
                                            />
                                        </div>
                                    </div>
                                </ProductCard>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.noData}>
                        <div className="text-5xl mb-6 opacity-20">📊</div>
                        <p className="text-xl font-bold text-slate-300">RANKING_STREAM_OFFLINE</p>
                        <p className="text-sm mt-4 opacity-60 font-mono leading-relaxed text-center">
                            ERROR_CODE: EMPTY_DATA_STREAM<br/>
                            RESOLVED_HOST: {host}<br/>
                            ACTION: CHECK_BACKEND_SYNC_STATUS
                        </p>
                        <Link href="/" className="mt-8 px-6 py-2 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-500/10 transition-all">
                            トップページに戻る
                        </Link>
                    </div>
                )}
            </div>

            {/* --- 🔢 ページネーション・コントロール (統合版) --- */}
            {totalPages > 1 && (
                <div className={styles.paginationSection}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/ranking"
                    />
                </div>
            )}

            {/* --- 👣 フッター・ノート --- */}
            <footer className={styles.rankingFooter}>
                <div className={styles.footerNote}>
                    <p>※本ランキングはシステムにより24時間ごとに再計算されます。</p>
                    <p>※AIスコアはCPU/GPUベンチマーク、発売価格、重量、電力効率を元に独自のアルゴリズムで算出しています。</p>
                </div>
            </footer>
        </main>
    );
}