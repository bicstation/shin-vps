/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🏆 BICSTATION PCスペック解析ランキング
 * 🛡️ Maya's Logic: 物理構造 v3.2 / Zenith v10.0 同期版
 * 物理パス: app/ranking/page.tsx
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

// インポートパスの物理構造整合
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import RadarChart from '@/shared/components/atoms/RadarChart';

import styles from './Ranking.module.css';

/**
 * ⚙️ サーバーセクション (Metadata & Configuration)
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
    
    const title = `【2026年最新】PCスペック解析ランキング 第${page}ページ | BICSTATION`;
    const description = `AI解析スコアに基づいたPC製品の最新ランキング。CPU・GPU・コスパ・携帯性・AI性能を5軸スコアで徹底比較。真に「買い」のモデルを抽出。`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://bicstation.com/ranking/${page !== '1' ? `?page=${page}` : ''}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            title: title,
            description: description,
        }
    };
}

/**
 * 🏗️ ページエントリポイント (Suspense搭載)
 */
export default function RankingPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                CALCULATING_RANKINGS_V2.0...
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

    // 🌐 現在のホスト名を取得 (API疎通の生命線)
    const headerList = await headers();
    const host = headerList.get('host') || '';

    /**
     * 🚀 修正ポイント: 
     * Django側で既にTOP20等に絞り込まれている可能性があるため、
     * フロントエンドでの slice 処理を安全に行う。
     */
    const rawData = await fetchPCProductRanking('score', host).catch(() => []);
    
    // results キーがある場合と、配列直下の場合の両方をハンドリング
    const productsArray = Array.isArray(rawData) ? rawData : ((rawData as any)?.results || []);
    
    // フロントエンドでの仮想ページネーション処理
    const offset = (currentPage - 1) * limit;
    const products = productsArray.slice(offset, offset + limit);
    const totalPages = Math.max(1, Math.ceil(productsArray.length / limit));

    // 2. 構造化データの生成
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "PCスペック解析ランキング",
        "numberOfItems": productsArray.length,
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
        if (rank === 1) return '#FFD700'; 
        if (rank === 2) return '#C0C0C0'; 
        if (rank === 3) return '#CD7F32'; 
        return '#3b82f6';
    };

    return (
        <main className={styles.container}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header className={styles.header}>
                <div className={styles.heroInner}>
                    <div className={styles.badge}>PC_ANALYTICS_v2.0</div>
                    <h1 className={styles.title}>
                        <span className={styles.titleIcon}>💻</span>
                        PCスペック解析ランキング
                    </h1>
                    <p className={styles.subtitle}>
                        全アーカイブのスペックをAIが5軸で完全数値化。<br />
                        広告やブランド力に惑わされない、<strong>真のコストパフォーマンス</strong>を可視化しました。
                    </p>
                </div>
            </header>
            
            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product: any, index: number) => {
                        const rank = offset + index + 1;
                        
                        // レーダーチャートデータの構築
                        const chartData = [
                            { subject: 'CPU', value: product.score_cpu || 0, fullMark: 100 },
                            { subject: 'GPU', value: product.score_gpu || 0, fullMark: 100 },
                            { subject: 'コスパ', value: product.score_cost || 0, fullMark: 100 },
                            { subject: '携帯性', value: product.score_portable || 0, fullMark: 100 },
                            { subject: 'AI性能', value: product.score_ai || 0, fullMark: 100 },
                        ];

                        const totalScore = Math.round(chartData.reduce((acc, cur) => acc + cur.value, 0) / 5);

                        return (
                            <div key={product.unique_id || product.id} className={styles.rankingCardWrapper}>
                                <ProductCard 
                                    product={product} 
                                    rank={rank}
                                >
                                    <div className={styles.analysisOverlay}>
                                        <div className={styles.chartHeader}>
                                            <div className={styles.labelGroup}>
                                                <span className={styles.analysisLabel}>AI_ANALYSIS_SCORE</span>
                                                <span className={styles.scoreDetail}>Comprehensive evaluation</span>
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
                        <p>現在ランキングデータを集計中です...</p>
                        <p className="text-[10px] mt-2 opacity-50">NO_DATA_RECEIVED_FROM_BACKEND</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Ranking pages">
                    <div className={styles.paginationInner}>
                        {currentPage > 1 ? (
                            <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
                                <span className={styles.btnArrow}>←</span> PREV
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.disabled}`}>← PREV</span>
                        )}

                        <div className={styles.pageIndicator}>
                            <span className={styles.current}>PAGE {currentPage}</span>
                            <span className={styles.divider}>/</span>
                            <span className={styles.total}>{totalPages}</span>
                        </div>

                        {currentPage < totalPages ? (
                            <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
                                NEXT <span className={styles.btnArrow}>→</span>
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.disabled}`}>NEXT →</span>
                        )}
                    </div>
                </nav>
            )}

            <footer className={styles.rankingFooter}>
                <div className={styles.footerNote}>
                    <p>※本ランキングは24時間ごとにAM4:00に更新されます。</p>
                    <p>※スコアは最新の市場価格とベンチマークデータの変動を元にAIが自動算出したものです。</p>
                </div>
            </footer>
        </main>
    );
}