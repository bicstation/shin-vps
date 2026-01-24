/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProductDetail, fetchRelatedProducts, fetchPCProductRanking } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './ProductDetail.module.css';

// 📈 グラフコンポーネント
import PriceHistoryChart from '@/components/PriceHistoryChart';
import SpecRadarChart from '@/components/product/SpecRadarChart';

interface PageProps {
    params: Promise<{ unique_id: string }>;
}

/**
 * 💡 SEOメタデータ・キーワードの動的生成
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { unique_id } = await params;
    const product = await fetchProductDetail(unique_id);

    if (!product) return { title: "製品が見つかりません | BICSTATION" };

    const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新比較`;
    const seoDescription = `${product.maker}の「${product.name}」詳細解説。${product.description?.substring(0, 80)}... 最安値や在庫状況をチェック。`;

    return {
        title,
        description: seoDescription,
        openGraph: {
            title,
            description: seoDescription,
            images: [product.image_url || '/no-image.png'],
            type: 'article',
        },
    };
}

export default async function ProductDetailPage(props: PageProps) {
    const { unique_id } = await props.params;

    // 💡 データの並列取得（詳細・ランキング）
    const [product, rankingData] = await Promise.all([
        fetchProductDetail(unique_id),
        fetchPCProductRanking()
    ]);

    if (!product) notFound();

    const p = product as any;
    const relatedProducts = await fetchRelatedProducts(product.maker, unique_id);
    const displayRelated = relatedProducts.slice(0, 8);
    const finalUrl = product.affiliate_url || product.url;
    const isPriceAvailable = product.price > 0;

    // 現在の順位を特定 (rankingDataからこの製品を探す)
    const currentRank = rankingData ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1 : 0;

    const isSoftware = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"].some(keyword =>
        product.maker.toUpperCase().includes(keyword.toUpperCase()) || product.name.includes(keyword)
    );

    const firstAttributeSlug = (p.attributes && p.attributes.length > 0) ? p.attributes[0].slug : '';

    /**
     * AIコンテンツの解析
     */
    const parseContent = (html: string) => {
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

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>

                {/* 📈 リアルタイム・トレンドバナー */}
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

                {/* 1. ヒーローセクション */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        {/* 🏆 順位バッジ (100位以内の場合表示) */}
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
                            {product.unified_genre && (
                                <Link href={`/brand/${product.maker.toLowerCase()}?attribute=${firstAttributeSlug}`} className={styles.genreBadgeLink}>
                                    <span className={styles.genreBadge}># {product.unified_genre}</span>
                                </Link>
                            )}
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

                {/* 📊 2. 分析データセクション */}
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

                {/* 🏆 3. ランキング推移セクション */}
                {!isSoftware && (
                    <div className={styles.rankHistorySection}>
                        <h3 className={styles.chartTitle}>注目度ランキング推移</h3>
                        {p.rank_history && p.rank_history.length > 0 ? (
                            <div className={styles.rankChartWrapper}>
                                <PriceHistoryChart history={p.rank_history} isRank={true} />
                            </div>
                        ) : (
                            <div className={styles.noDataPlaceholder}>
                                {currentRank > 0 ? `現在 ${currentRank}位 / 順位データを蓄積中です` : "ランキング解析中です"}
                            </div>
                        )}
                        <p className={styles.rankNotice}>※ BICSTATION内での人気度・比較回数に基づく独自のリアルタイムランキング推移</p>
                    </div>
                )}

                {/* 4. クイックハイライト */}
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
                        <div className={styles.targetBox}>
                            <span className={styles.targetLabel}>Recommend</span>
                            <p className={styles.targetText}>{summary.target}</p>
                        </div>
                    </section>
                )}

                {/* 5. スペックサマリー */}
                <section className={styles.aiSpecSummarySection}>
                    <h2 className={styles.minimalTitle}>主要構成スペック</h2>
                    <div className={styles.aiSpecGrid}>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "対応OS" : "CPU"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.os_support || 'Windows/Mac') : (p.cpu_model || '-')}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "ライセンス" : "GPU"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.license_type || 'サブスク') : (p.gpu_model || '-')}</span>
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
                                <span className={styles.aiSpecLabel}>次世代機能</span>
                                <span className={styles.aiSpecValue}>✨ AI PC 対応モデル</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 6. エキスパート解説 (AI Content) */}
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

                {/* 🔥 7. 究極のCTAセクション */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.ctaGlassCard}>
                        <div className={styles.ctaGlow}></div>
                        <div className={styles.ctaContent}>
                            <div className={styles.ctaBrandTag}>{product.maker} Official Dealer</div>
                            <h2 className={styles.ctaTitle}>
                                {isSoftware ? "究極のツールを、あなたの手に。" : "未体験のパフォーマンスを解き放つ。"}
                            </h2>
                            <p className={styles.ctaDescription}>
                                妥協なきスペック選びは、公式サイトから始まります。最新の在庫状況や限定キャンペーンを今すぐチェック。
                            </p>

                            <div className={styles.ctaActionRow}>
                                <div className={styles.ctaPriceInfo}>
                                    <span className={styles.ctaPriceLabel}>メーカー希望小売価格</span>
                                    <span className={styles.ctaPriceValue}>
                                        {isPriceAvailable ? `¥${product.price.toLocaleString()}` : "CHECK PRICE"}
                                        <span className={styles.ctaTax}> (税込)</span>
                                    </span>
                                </div>
                                <a href={finalUrl} target="_blank" rel="nofollow" className={styles.ctaNeonButton}>
                                    <span className={styles.ctaBtnText}>公式サイトで詳細を見る</span>
                                    <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={styles.ctaVisualContainer}>
                            <img src={product.image_url || '/no-image.png'} alt="Premium Visual" className={styles.ctaFloatingImage} />
                        </div>
                    </div>
                </section>

                {/* 8. 関連商品 */}
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
                                        <p className={item.name.length > 30 ? styles.relatedNameSmall : styles.relatedName}>{item.name}</p>
                                        <div className={styles.relatedPrice}>¥{item.price.toLocaleString()}〜</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className={styles.backToBrand}>
                    <Link href={`/brand/${product.maker.toLowerCase()}`} className={styles.backLink}>
                        ← {product.maker} の最新一覧へ戻る
                    </Link>
                </div>
            </main>
        </div>
    );
}