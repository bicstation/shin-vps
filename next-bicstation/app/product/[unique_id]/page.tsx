/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-bicstation/app/product/[unique_id]/page.tsx

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// API関数
import {
    fetchPCProductDetail,
    fetchRelatedProducts,
    fetchPCProductRanking
} from '@shared/lib/api/django/pc';

import styles from './ProductDetail.module.css';

// 📈 UIコンポーネント
import PriceHistoryChart from '@shared/ui/PriceHistoryChart';
import SpecRadarChart from '@shared/product/SpecRadarChart';

// 🚩 共通コンポーネント
import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

/**
 * 💡 デバッグ用コンポーネント (サーバーサイドでのデータ確認用)
 */
function ClientConsoleDebug({ data, label }: { data: any, label: string }) {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `console.log("--- [DEBUG: ${label}] ---", ${JSON.stringify(data)});`
            }}
        />
    );
}

// Next.js 15 用の型定義
interface PageProps {
    params: Promise<{ unique_id: string }>;
    searchParams: Promise<{ attribute?: string }>;
}

/**
 * 💡 SEOメタデータ生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { unique_id } = params;

    try {
        const product = await fetchPCProductDetail(unique_id);
        if (!product) return { title: "製品が見つかりません | BICSTATION" };

        const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新比較`;
        return {
            title,
            description: `${product.maker}の「${product.name}」詳細レポート。価格推移、スペック評価、AIによる解析データを掲載。`,
            openGraph: {
                title,
                images: [product.image_url || '/no-image.png'],
            },
        };
    } catch (e) {
        return { title: "製品詳細 | BICSTATION" };
    }
}

/**
 * 💡 メインコンポーネント
 */
export default async function ProductDetailPage(props: PageProps) {
    // 1. Next.js 15 非同期 Props の解決
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { unique_id } = params;
    const attribute = searchParams.attribute;

    // 2. 基礎データの並列取得
    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id).catch(() => null),
        fetchPCProductRanking().catch(() => [])
    ]);

    // ガード：データがない場合は404
    if (!product || !product.unique_id) {
        notFound();
    }

    // 3. 関連データの取得 (メーカーが判明した後に実行)
    const rawRelated = await fetchRelatedProducts(product.maker || '', unique_id).catch(() => []);
    const displayRelated = Array.isArray(rawRelated) ? rawRelated.slice(0, 8) : [];

    const p = product as any;
    const finalUrl = product.affiliate_url || product.url || "#";
    const isPriceAvailable = typeof product.price === 'number' && product.price > 0;

    // ランキング順位の算出
    const currentRank = Array.isArray(rankingData)
        ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1
        : 0;

    // ソフトウェア/ライセンス系製品の判定ロジック
    const isSoftware = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"].some(keyword =>
        (product.maker?.toUpperCase() || "").includes(keyword.toUpperCase()) ||
        (product.name?.toUpperCase().includes(keyword.toUpperCase()))
    );

    /**
     * AI解析データのパース
     */
    const parseContent = (html: string) => {
        if (!html || typeof html !== 'string') return { summary: null, cleanBody: "" };
        
        const summaryRegex = /\[SUMMARY_DATA\]([\s\S]*?)\[\/SUMMARY_DATA\]/;
        const summaryMatch = html.match(summaryRegex);
        let summary = null;
        
        if (summaryMatch) {
            const data = summaryMatch[1];
            summary = {
                p1: data.match(/POINT1:\s*(.*)/)?.[1] || "",
                p2: data.match(/POINT2:\s*(.*)/)?.[1] || "",
                p3: data.match(/POINT3:\s*(.*)/)?.[1] || "",
                target: data.match(/TARGET:\s*(.*)/)?.[1] || "",
            };
        }
        return { summary, cleanBody: html.replace(summaryRegex, '').trim() };
    };

    const { summary, cleanBody } = parseContent(product.ai_content || "");
    const today = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

    // 価格履歴の整形
    const priceHistory = Array.isArray(p.price_history) ? p.price_history : [];

    // ランキング履歴 (stats_history がある場合)
    const formattedRankHistory = Array.isArray(p.stats_history)
        ? p.stats_history.map((s: any) => ({
            date: s.date || s.formatted_date || "",
            price: s.daily_rank || 0
        }))
        : [];

    return (
        <div className={styles.wrapper}>
            <ClientConsoleDebug label="ProductDetail" data={product} />

            <main className={styles.mainContainer}>
                {/* 🏷️ トレンド・ステータスバー */}
                <div className={styles.trendBanner}>
                    <div className={styles.trendInfo}>
                        <span className={styles.updateBadge}>{today} UPDATE</span>
                        <span className={styles.trendText}>
                            <strong>{isSoftware ? "ステータス" : "市場動向"}:</strong>
                            <span className={styles.trendAlert}> 
                                {isSoftware ? "▲ ライセンス需要増" : (currentRank > 0 && currentRank < 30 ? "🔥 人気急上昇中" : "✅ 在庫・価格安定")}
                            </span>
                        </span>
                    </div>
                    <div className={styles.viewerCount}>
                        ⚡️ 現在 {Math.floor(Math.random() * 50) + 12} 人がこの製品を比較中
                    </div>
                </div>

                {/* 1. ヒーローセクション (画像 & 主要情報) */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        {currentRank > 0 && currentRank <= 100 && (
                            <div className={`${styles.detailRankBadge} ${styles[`rankColor_${Math.min(currentRank, 10)}`]}`}>
                                <span className={styles.rankLabel}>RANK</span>
                                <span className={styles.rankNumber}>{currentRank}</span>
                            </div>
                        )}
                        <img src={product.image_url || '/no-image.png'} alt={product.name} className={styles.productImage} />
                    </div>
                    
                    <div className={styles.infoSide}>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker}</span>
                            {attribute && <span className={styles.attributeBadge}>{attribute}</span>}
                        </div>
                        <h1 className={styles.productTitle}>{product.name}</h1>
                        
                        <div className={styles.priceContainer}>
                            <span className={styles.priceLabel}>{isPriceAvailable ? "現在の市場価格 (税込)" : "最新価格情報"}</span>
                            <div className={styles.priceValue}>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}` : <span className={styles.priceDraft}>公式サイトにて公開中</span>}
                            </div>
                        </div>

                        <a href={finalUrl} target="_blank" rel="nofollow" className={styles.mainCtaButton}>
                            {product.maker}公式でカスタマイズ・購入
                            <span className={styles.ctaSub}>最新の納期・キャンペーン情報を確認</span>
                        </a>
                    </div>
                </div>

                {/* 2. ビジュアル分析 (レーダーチャート & 価格推移) */}
                
                <div className={styles.analysisGrid}>
                    <div className={styles.analysisChartItem}>
                        <h3 className={styles.chartTitle}>スペック評価スコア</h3>
                        <SpecRadarChart
                            scores={{
                                cpu: p.score_cpu || 0,
                                gpu: p.score_gpu || 0,
                                cost: p.score_cost || 0,
                                portable: p.score_portable || 0,
                                ai: p.score_ai || 0
                            }}
                        />
                    </div>
                    <div className={styles.analysisChartItem}>
                        <h3 className={styles.chartTitle}>価格推移・マーケットデータ</h3>
                        {priceHistory.length > 0 ? (
                            <PriceHistoryChart history={priceHistory} />
                        ) : (
                            <div className={styles.noDataPlaceholder}>価格データをトラッキング中です...</div>
                        )}
                    </div>
                </div>

                {/* 3. 注目度ランキング推移 */}
                {!isSoftware && formattedRankHistory.length > 0 && (
                    <div className={styles.rankHistorySection}>
                        <h3 className={styles.chartTitle}>カテゴリー内 注目度ランキング推移</h3>
                        <div className={styles.rankChartWrapper}>
                            <PriceHistoryChart history={formattedRankHistory} isRank={true} />
                        </div>
                    </div>
                )}

                {/* 4. AI要約ハイライト */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <h2 className={styles.minimalTitle}>AI Check Points</h2>
                        <div className={styles.highlightGrid}>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>🚀</span><p>{summary.p1}</p></div>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>💎</span><p>{summary.p2}</p></div>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>🔋</span><p>{summary.p3}</p></div>
                        </div>
                    </section>
                )}

                {/* 5. スペック一覧テーブル */}
                <section className={styles.aiSpecSummarySection}>
                    <h2 className={styles.minimalTitle}>主要構成スペック</h2>
                    <div className={styles.aiSpecGrid}>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "対応OS" : "プロセッサー"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.os_support || 'Windows/Mac') : (p.cpu_model || '-')}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>システムメモリ</span>
                            <span className={styles.aiSpecValue}>{p.memory_gb ? `${p.memory_gb}GB` : '-'}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>ストレージ容量</span>
                            <span className={styles.aiSpecValue}>{p.storage_gb ? `${p.storage_gb}GB SSD` : '-'}</span>
                        </div>
                    </div>
                </section>

                {/* 6. AIエキスパートレポート本文 */}
                {cleanBody && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>エキスパートレポート</h2>
                            <span className={styles.aiBadge}>AI ANALYSIS</span>
                        </div>
                        <div className={styles.aiContentBody} dangerouslySetInnerHTML={{ __html: cleanBody }} />
                    </section>
                )}

                {/* 中間・最終CTA */}
                <ProductCTA />

                <FinalCta 
                    product={product} 
                    summary={summary} 
                    finalUrl={finalUrl} 
                    isSoftware={isSoftware} 
                />

                {/* 7. 同一メーカーの関連商品 */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.specTitle}>{product.maker} の他の最新製品</h2>
                        <div className={styles.relatedGrid}>
                            {displayRelated.map((item: any) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} loading="lazy" />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={styles.relatedName}>{item.name}</p>
                                        <div className={styles.relatedPrice}>
                                            {item.price ? `¥${item.price.toLocaleString()}` : "-"}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}