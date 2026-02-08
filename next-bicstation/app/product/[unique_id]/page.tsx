/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// 💡 分割・整理したAPIから関数をインポート
import { 
    fetchPCProductDetail, 
    fetchRelatedProducts, 
    fetchPCProductRanking 
} from '@shared/lib/api';

import styles from './ProductDetail.module.css';

// 📈 UIコンポーネント
import PriceHistoryChart from '@shared/ui/PriceHistoryChart';
import SpecRadarChart from '@shared/product/SpecRadarChart';

/**
 * 💡 型定義: Next.js 15 では params は Promise で受け取る必要があります
 */
interface PageProps {
    params: Promise<{ unique_id: string }>;
}

/**
 * 💡 SEOメタデータ生成
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { unique_id } = await params;
    const product = await fetchPCProductDetail(unique_id);

    if (!product) return { title: "製品が見つかりません | BICSTATION" };

    const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新比較`;
    return {
        title,
        description: `${product.maker}の「${product.name}」詳細。価格推移、スペック評価、AIによるエキスパートレビューを掲載。`,
        openGraph: {
            title,
            images: [product.image_url || '/no-image.png'],
        },
    };
}

/**
 * 💡 メインコンポーネント
 */
export default async function ProductDetailPage(props: PageProps) {
    // 1. パラメータの解決
    const { unique_id } = await props.params;

    // 2. データの並列取得 (パフォーマンス最適化)
    // RankingDataがコケても製品詳細が出るように .catch() でガード
    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id),
        fetchPCProductRanking().catch(() => [])
    ]);

    // 🚨 3. データが存在しない、または取得失敗時は即座に 404
    if (!product || !product.unique_id) {
        console.error(`[DEBUG] Product not found for unique_id: ${unique_id}`);
        notFound();
    }

    // 4. 関連データの取得
    const relatedProducts = await fetchRelatedProducts(product.maker, unique_id).catch(() => []);
    const displayRelated = relatedProducts.slice(0, 8);
    
    // 5. 表示用変数の整理
    const p = product as any;
    const finalUrl = product.affiliate_url || product.url;
    const isPriceAvailable = product.price && product.price > 0;
    
    // 現在の順位を算出
    const currentRank = rankingData ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1 : 0;

    // ソフトウェア判定（表示項目の切り替え用）
    const isSoftware = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"].some(keyword =>
        product.maker.toUpperCase().includes(keyword.toUpperCase()) || product.name.includes(keyword)
    );

    /**
     * AIコンテンツ（HTML）の解析ロジック
     */
    const parseContent = (html: string) => {
        if (!html) return { tocItems: [], summary: null, cleanBody: "" };
        
        const h2RegExp = /<h2.*?>(.*?)<\/h2>/g;
        const tocItems: string[] = [];
        let match;
        while ((match = h2RegExp.exec(html)) !== null) {
            tocItems.push(match[1].replace(/<[^>]*>?/gm, ''));
        }
        
        const summaryRegex = /\[SUMMARY_DATA\]([\s\S]*?)\[\/SUMMARY_DATA\]/;
        const summaryMatch = html.match(summaryRegex);
        let summary = null;
        if (summaryMatch) {
            const data = summaryMatch[1];
            summary = {
                p1: data.match(/POINT1:\s*(.*)/)?.[1],
                p2: data.match(/POINT2:\s*(.*)/)?.[1],
                p3: data.match(/POINT3:\s*(.*)/)?.[1],
                target: data.match(/TARGET:\s*(.*)/)?.[1],
            };
        }
        return { tocItems, summary, cleanBody: html.replace(summaryRegex, '').trim() };
    };

    const { tocItems, summary, cleanBody } = parseContent(product.ai_content || "");
    const today = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

    // ランキング履歴の整形
    const formattedRankHistory = p.stats_history?.map((s: any) => ({
        date: s.formatted_date,
        price: s.daily_rank 
    })) || [];

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>

                {/* --- トレンドバナー --- */}
                <div className={styles.trendBanner}>
                    <div className={styles.trendInfo}>
                        <span className={styles.updateBadge}>{today} UPDATE</span>
                        <span className={styles.trendText}>
                            <strong>{isSoftware ? "ライセンス動向" : "在庫状況"}:</strong>
                            <span className={styles.trendAlert}> {isSoftware ? "▲ 需要急増中" : "▼ 最安値圏を維持"}</span>
                        </span>
                    </div>
                    <div className={styles.viewerCount}>
                        🔥 24時間以内に {Math.floor(Math.random() * 50) + 10}人が検討中
                    </div>
                </div>

                {/* --- 1. ヒーローセクション --- */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        {currentRank > 0 && currentRank <= 100 && (
                            <div className={`${styles.detailRankBadge} ${styles[`rankColor_${currentRank}`]}`}>
                                <span className={styles.rankLabel}>RANK</span>
                                <span className={styles.rankNumber}>{currentRank}</span>
                            </div>
                        )}
                        <img src={product.image_url || '/no-image.png'} alt={product.name} className={styles.productImage} />
                    </div>
                    <div className={styles.infoSide}>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker}</span>
                        </div>
                        <h1 className={styles.productTitle}>{product.name}</h1>
                        <div className={styles.priceContainer}>
                            <span className={styles.priceLabel}>{isPriceAvailable ? "販売価格 (税込)" : "販売状況"}</span>
                            <div className={styles.priceValue}>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}` : <span className={styles.priceDraft}>公式サイトで確認</span>}
                            </div>
                        </div>
                        <a href={finalUrl} target="_blank" rel="nofollow" className={styles.mainCtaButton}>
                            {product.maker}公式サイトで詳細を見る
                            <span className={styles.ctaSub}>最新のエディション・在庫を確認</span>
                        </a>
                    </div>
                </div>

                {/* --- 2. 分析データ（グラフ） --- */}
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
                        <h3 className={styles.chartTitle}>価格履歴・推移</h3>
                        {p.price_history && p.price_history.length > 0 ? (
                            <PriceHistoryChart history={p.price_history} />
                        ) : (
                            <div className={styles.noDataPlaceholder}>価格推移データを収集中...</div>
                        )}
                    </div>
                </div>

                {/* --- 3. ランキング推移 --- */}
                {!isSoftware && (
                    <div className={styles.rankHistorySection}>
                        <h3 className={styles.chartTitle}>注目度ランキング推移</h3>
                        {formattedRankHistory.length > 0 ? (
                            <div className={styles.rankChartWrapper}>
                                <PriceHistoryChart history={formattedRankHistory} isRank={true} />
                            </div>
                        ) : (
                            <div className={styles.noDataPlaceholder}>
                                {currentRank > 0 ? `現在 ${currentRank}位 / 順位データを蓄積中です` : "ランキング解析中です"}
                            </div>
                        )}
                    </div>
                )}

                {/* --- 4. クイックハイライト --- */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <h2 className={styles.minimalTitle}>注目ポイント</h2>
                        <div className={styles.highlightGrid}>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>🚀</span>
                                <p>{summary.p1}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>💎</span>
                                <p>{summary.p2}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>🔋</span>
                                <p>{summary.p3}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* --- 5. スペックサマリー --- */}
                <section className={styles.aiSpecSummarySection}>
                    <h2 className={styles.minimalTitle}>主要構成スペック</h2>
                    <div className={styles.aiSpecGrid}>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "対応OS" : "CPU"}</span>
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
                        {p.is_ai_pc && (
                            <div className={`${styles.aiSpecCard} ${styles.aiPcCard}`}>
                                <span className={styles.aiSpecLabel}>機能</span>
                                <span className={styles.aiSpecValue}>✨ AI PC 対応</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 6. AIエキスパート解説 --- */}
                {cleanBody && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>エキスパートレポート</h2>
                            <span className={styles.aiBadge}>AI分析</span>
                        </div>
                        {tocItems.length > 0 && (
                            <div className={styles.tocContainer}>
                                <ul className={styles.tocList}>
                                    {tocItems.map((item, i) => (
                                        <li key={i} className={styles.tocItem}>
                                            <span className={styles.tocNumber}>{i + 1}</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className={styles.aiContentBody} dangerouslySetInnerHTML={{ __html: cleanBody }} />
                    </section>
                )}

                {/* --- 7. 下部CTA --- */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.ctaGlassCard}>
                        <div className={styles.ctaContent}>
                            <div className={styles.ctaBrandTag}>{product.maker} Official Dealer</div>
                            <h2 className={styles.ctaTitle}>
                                {isSoftware ? "究極のツールを、あなたの手に。" : "未体験のパフォーマンスを解き放つ。"}
                            </h2>
                            <a href={finalUrl} target="_blank" rel="nofollow" className={styles.ctaNeonButton}>
                                公式サイトで詳細を見る
                            </a>
                        </div>
                    </div>
                </section>

                {/* --- 8. 関連商品 --- */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.specTitle}>{product.maker} の他の製品</h2>
                        <div className={styles.relatedGrid}>
                            {displayRelated.map((item) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={styles.relatedName}>{item.name}</p>
                                        <div className={styles.relatedPrice}>¥{item.price?.toLocaleString()}〜</div>
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