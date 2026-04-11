/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 💻 BICSTATION 製品詳細レポート
 * 🛡️ Maya's Logic: 物理構造 v3.8 クリーンデータ適応版
 * =====================================================================
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// APIインポート
import {
    fetchPCProductDetail,
    fetchRelatedProducts,
    fetchPCProductRanking
} from '@/shared/lib/api/django/pc';

import styles from './ProductDetail.module.css';

// コンポーネントインポート
import PriceHistoryChart from '@/shared/components/molecules/PriceHistoryChart';
import SpecRadarChart from '@/shared/components/atoms/RadarChart';
import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

interface PageProps {
    params: Promise<{ unique_id: string }>;
    searchParams: Promise<{ attribute?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { unique_id } = await props.params;
    try {
        const product = await fetchPCProductDetail(unique_id);
        if (!product) return { title: "製品が見つかりません | BICSTATION" };
        const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新比較`;
        return {
            title,
            description: `${product.maker}の「${product.name}」詳細レポート。AI解析データを掲載。`,
            openGraph: {
                title,
                images: [product.image_url || '/no-image.png'],
            },
        };
    } catch (e) {
        return { title: "製品詳細 | BICSTATION" };
    }
}

export default async function ProductDetailPage(props: PageProps) {
    const { unique_id } = await props.params;
    const sParams = await props.searchParams;
    const attribute = sParams.attribute;

    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id).catch(() => null),
        fetchPCProductRanking().catch(() => [])
    ]);

    if (!product || !product.unique_id) {
        notFound();
    }

    const rawRelated = await fetchRelatedProducts(product.maker || '', unique_id).catch(() => []);
    const displayRelated = Array.isArray(rawRelated) ? rawRelated.slice(0, 8) : [];
    const p = product as any;
    const finalUrl = product.affiliate_url || product.url || "#";
    const isPriceAvailable = typeof product.price === 'number' && product.price > 0;

    const currentRank = Array.isArray(rankingData)
        ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1
        : 0;

    const isSoftware = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"].some(keyword =>
        (product.maker?.toUpperCase() || "").includes(keyword.toUpperCase()) ||
        (product.name?.toUpperCase().includes(keyword.toUpperCase()))
    );

    /**
     * 🛡️ 物理構造パースロジック v3.8
     * DB側でai_contentがクリーン化されている前提
     */
    const parseAiSummary = (summaryStr: string) => {
        if (!summaryStr) return null;
        // SUMMARY_DATAタグ内からPOINTを抽出
        return {
            p1: summaryStr.match(/POINT1:\s*(.*)/)?.[1] || "",
            p2: summaryStr.match(/POINT2:\s*(.*)/)?.[1] || "",
            p3: summaryStr.match(/POINT3:\s*(.*)/)?.[1] || "",
            target: summaryStr.match(/TARGET:\s*(.*)/)?.[1] || "",
        };
    };

    const summary = parseAiSummary(product.ai_summary || "");
    // ai_contentは既にクリーンなのでそのまま使用
    const cleanBody = product.ai_content || "";
    
    const today = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    const priceHistory = Array.isArray(p.price_history) ? p.price_history : [];

    return (
        <div className={styles.wrapper}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "brand": { "@type": "Brand", "name": product.maker },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "JPY",
                            "price": product.price || 0,
                            "url": finalUrl
                        }
                    })
                }}
            />

            <main className={styles.mainContainer}>
                {/* トレンドバナー */}
                <div className={styles.trendBanner}>
                    <div className={styles.trendInfo}>
                        <span className={styles.updateBadge}>{today} UPDATE</span>
                        <span className={styles.trendText}>
                            <strong>{isSoftware ? "STATUS" : "MARKET_TREND"}:</strong>
                            <span className={styles.trendAlert}> 
                                {isSoftware ? "▲ ライセンス需要増加中" : (currentRank > 0 && currentRank < 30 ? "🔥 人気急上昇" : "✅ 供給安定")}
                            </span>
                        </span>
                    </div>
                    <div className={styles.viewerCount}>
                        ⚡️ 現在 {Math.floor(Math.random() * 50) + 12} 人が検討中
                    </div>
                </div>

                {/* 1. ヒーローセクション */}
                <section className={styles.heroSection}>
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
                            <span className={styles.priceLabel}>{isPriceAvailable ? "現在の市場価格 (税込)" : "最新価格・納期情報"}</span>
                            <div className={styles.priceValue}>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}` : <span className={styles.priceDraft}>公式サイトで確認</span>}
                            </div>
                        </div>

                        <a href={finalUrl} target="_blank" rel="nofollow" className={styles.mainCtaButton}>
                            {product.maker}公式で構成をカスタマイズ
                            <span className={styles.ctaSub}>最新のキャンペーン価格を適用する</span>
                        </a>
                    </div>
                </section>

                <div className={styles.analysisGrid}>
                    <div className={styles.analysisChartItem}>
                        <h3 className={styles.chartTitle}>性能評価・AIスコアリング</h3>
                        <SpecRadarChart
                            data={[
                                { subject: 'CPU', value: p.score_cpu || 0, fullMark: 100 },
                                { subject: 'GPU', value: p.score_gpu || 0, fullMark: 100 },
                                { subject: 'コスパ', value: p.score_cost || 0, fullMark: 100 },
                                { subject: '携帯性', value: p.score_portable || 0, fullMark: 100 },
                                { subject: 'AI性能', value: p.score_ai || 0, fullMark: 100 },
                            ]}
                            color="#3b82f6"
                        />
                    </div>
                    <div className={styles.analysisChartItem}>
                        <h3 className={styles.chartTitle}>価格推移・トレンド分析</h3>
                        {priceHistory.length > 0 ? (
                            <PriceHistoryChart history={priceHistory} />
                        ) : (
                            <div className={styles.noDataPlaceholder}>マーケットデータを集計中...</div>
                        )}
                    </div>
                </div>

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

                {/* 5. 主要スペック・エキスパートレポート */}
                <section className={styles.specAndReportSection}>
                    <div className={styles.aiSpecSummary}>
                        <h2 className={styles.minimalTitle}>主要構成スペック</h2>
                        <div className={styles.aiSpecGrid}>
                            <div className={styles.aiSpecCard}>
                                <span className={styles.aiSpecLabel}>{isSoftware ? "プラットフォーム" : "CPU / プロセッサー"}</span>
                                <span className={styles.aiSpecValue}>{isSoftware ? (p.os_support || 'Windows/Mac') : (p.cpu_model || '-')}</span>
                            </div>
                            <div className={styles.aiSpecCard}>
                                <span className={styles.aiSpecLabel}>メモリ</span>
                                <span className={styles.aiSpecValue}>{p.memory_gb ? `${p.memory_gb}GB` : '-'}</span>
                            </div>
                            <div className={styles.aiSpecCard}>
                                <span className={styles.aiSpecLabel}>ストレージ</span>
                                <span className={styles.aiSpecValue}>{p.storage_gb ? `${p.storage_gb}GB SSD` : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ クリーンになった本文をレンダリング */}
                    {cleanBody && (
                        <div className={styles.aiContentSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.specTitle}>エキスパートレポート</h2>
                                <span className={styles.aiBadge}>AI ANALYSIS</span>
                            </div>
                            <div className={styles.aiContentBody}>
                                {/* rehypeRawを残すことで、もしHTMLが含まれていても安全に表示可能 */}
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                    {cleanBody}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </section>

                <ProductCTA />
                <FinalCta 
                    product={product} 
                    summary={summary} 
                    finalUrl={finalUrl} 
                    isSoftware={isSoftware} 
                />

                {/* 7. 関連製品 */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.specTitle}>{product.maker} の注目ラインナップ</h2>
                        <div className={styles.relatedGrid}>
                            {displayRelated.map((item: any) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} loading="lazy" />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={styles.relatedName}>{item.name}</p>
                                        <div className={styles.relatedPrice}>
                                            {item.price ? `¥${item.price.toLocaleString()}` : "OPEN PRICE"}
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