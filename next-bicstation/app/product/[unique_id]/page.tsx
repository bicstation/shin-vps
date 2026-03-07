/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 💻 BICSTATION 製品詳細レポート
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版 (ビルドエラー解消済み)
 * 物理パス: app/product/[unique_id]/page.tsx
 * =====================================================================
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ✅ 修正ポイント 1: APIインポートパスを物理構造に合わせる
import {
    fetchPCProductDetail,
    fetchRelatedProducts,
    fetchPCProductRanking
} from '@/shared/lib/api/django/pc';

import styles from './ProductDetail.module.css';

// ✅ 修正ポイント 2: 物理構造 [STRUCTURE] に基づくインポートパスの修正
// 1. PriceHistoryChart は molecules に存在
import PriceHistoryChart from '@/shared/components/molecules/PriceHistoryChart';
// 2. SpecRadarChart ではなく RadarChart (atoms) をインポートして別名で使用
import SpecRadarChart from '@/shared/components/atoms/RadarChart';

// 🚩 同一階層のコンポーネント (パス変更なし)
import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

/**
 * 📝 型定義
 */
interface PageProps {
    params: Promise<{ unique_id: string }>;
    searchParams: Promise<{ attribute?: string }>;
}

/**
 * 🔍 SEO メタデータ生成 (Dynamic Metadata)
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { unique_id } = await props.params;

    try {
        const product = await fetchPCProductDetail(unique_id);
        if (!product) return { title: "製品が見つかりません | BICSTATION" };

        const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新比較`;
        const description = `${product.maker}の「${product.name}」詳細レポート。価格推移、スペック評価、AIによる解析データを掲載。`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                images: [product.image_url || '/no-image.png'],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [product.image_url || '/no-image.png'],
            },
        };
    } catch (e) {
        return { title: "製品詳細 | BICSTATION" };
    }
}

/**
 * 🏗️ メインページコンポーネント
 */
export default async function ProductDetailPage(props: PageProps) {
    // 1. Next.js 15 非同期 Props の解決
    const { unique_id } = await props.params;
    const sParams = await props.searchParams;
    const attribute = sParams.attribute;

    // 2. データの並列取得 (SSR)
    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id).catch(() => null),
        fetchPCProductRanking().catch(() => [])
    ]);

    // ガード：データがない場合は404へ
    if (!product || !product.unique_id) {
        notFound();
    }

    // 3. 関連データの取得
    const rawRelated = await fetchRelatedProducts(product.maker || '', unique_id).catch(() => []);
    const displayRelated = Array.isArray(rawRelated) ? rawRelated.slice(0, 8) : [];

    const p = product as any;
    const finalUrl = product.affiliate_url || product.url || "#";
    const isPriceAvailable = typeof product.price === 'number' && product.price > 0;

    // ランキング順位の算出
    const currentRank = Array.isArray(rankingData)
        ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1
        : 0;

    // ソフトウェア・特殊カテゴリ判定
    const isSoftware = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"].some(keyword =>
        (product.maker?.toUpperCase() || "").includes(keyword.toUpperCase()) ||
        (product.name?.toUpperCase().includes(keyword.toUpperCase()))
    );

    /**
     * AI解析タグ [SUMMARY_DATA] のパース
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

    // 履歴データの整形
    const priceHistory = Array.isArray(p.price_history) ? p.price_history : [];
    const formattedRankHistory = Array.isArray(p.stats_history)
        ? p.stats_history.map((s: any) => ({
            date: s.date || s.formatted_date || "",
            price: s.daily_rank || 0
        }))
        : [];

    return (
        <div className={styles.wrapper}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.image_url,
                        "description": product.description,
                        "brand": { "@type": "Brand", "name": product.maker },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "JPY",
                            "price": product.price || 0,
                            "availability": "https://schema.org/InStock",
                            "url": finalUrl
                        }
                    })
                }}
            />

            <main className={styles.mainContainer}>
                {/* 🏷️ トレンド・ステータスバー */}
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

                {/* 2. ビジュアル分析グリッド */}
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

                {/* 3. ランキング推移 (オプション) */}
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

                    {cleanBody && (
                        <div className={styles.aiContentSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.specTitle}>エキスパートレポート</h2>
                                <span className={styles.aiBadge}>AI ANALYSIS</span>
                            </div>
                            <div className={styles.aiContentBody} dangerouslySetInnerHTML={{ __html: cleanBody }} />
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