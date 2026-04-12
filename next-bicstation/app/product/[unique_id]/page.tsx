/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION PRODUCT_DETAIL_NODE_V10.0
 * 🛡️ SEO COMPLETE EDITION: Structural Data & Semantic Optimization
 * =====================================================================
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// API & Utils
import { fetchPCProductDetail } from '@/shared/lib/api/django/pc/products';
import { fetchRelatedProducts, fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './ProductDetail.module.css';

// Components
import PriceHistoryChart from '@/shared/components/molecules/PriceHistoryChart';
import SpecRadarChart from '@/shared/components/atoms/RadarChart';
import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

interface PageProps {
    params: Promise<{ unique_id: string }>;
    searchParams: Promise<{ attribute?: string }>;
}

/**
 * 🛰️ メタデータ生成 (SEO最適化版)
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { unique_id } = await props.params;
    const host = (await headers()).get('host') || 'bicstation.com';
    const siteConfig = getSiteMetadata(host);
    
    try {
        const product = await fetchPCProductDetail(unique_id, host);
        if (!product) return { title: "製品が見つかりません" };

        const title = `${product.name} のスペック・価格推移・AIスコア | ${product.maker}製品アーカイブ`;
        const description = `${product.maker}「${product.name}」の徹底解説。AIによる${product.score_total || '高'}スコア評価、価格推移グラフ、詳細スペックを掲載。購入前の比較・検証に。`;

        return {
            title,
            description,
            alternates: { canonical: `https://${host}/product/${unique_id}` },
            openGraph: {
                title,
                description,
                url: `https://${host}/product/${unique_id}`,
                siteName: siteConfig.site_name,
                images: [{ url: product.image_url || '/no-image.png', width: 1200, height: 630 }],
                type: 'article',
            },
            twitter: { card: 'summary_large_image', title, description, images: [product.image_url || '/no-image.png'] }
        };
    } catch (e) {
        return { title: "製品詳細 | BICSTATION" };
    }
}

export default async function ProductDetailPage(props: PageProps) {
    const { unique_id } = await props.params;
    const { attribute } = await props.searchParams;
    const host = (await headers()).get('host') || 'bicstation.com';
    const siteConfig = getSiteMetadata(host);

    // データの並列取得
    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id, host).catch(() => null),
        fetchPCProductRanking('score', host).catch(() => [])
    ]);

    if (!product || !product.unique_id) notFound();

    const rawRelated = await fetchRelatedProducts(product.maker || '', unique_id, host).catch(() => []);
    const displayRelated = Array.isArray(rawRelated) ? rawRelated.slice(0, 8) : [];
    
    // ランキング順位
    const currentRank = Array.isArray(rankingData) 
        ? rankingData.findIndex((item: any) => item.unique_id === unique_id) + 1 
        : 0;

    const isSoftware = ["トレンドマイクロ", "ADOBE", "MICROSOFT"].some(k => product.maker?.includes(k));

    // 構造化データ生成
    const jsonLd = {
        "@context": "https://schema.org/",
        "@graph": [
            {
                "@type": "Product",
                "name": product.name,
                "image": product.image_url,
                "description": `${product.name}のスペック詳細レポート。`,
                "brand": { "@type": "Brand", "name": product.maker },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "JPY",
                    "price": product.price || 0,
                    "availability": "https://schema.org/InStock",
                    "url": product.affiliate_url || product.url
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "TOP", "item": `https://${host}/` },
                    { "@type": "ListItem", "position": 2, "name": product.maker, "item": `https://${host}/catalog?q=${product.maker}` },
                    { "@type": "ListItem", "position": 3, "name": product.name }
                ]
            }
        ]
    };

    return (
        <div className={styles.wrapper}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <main className={styles.mainContainer}>
                {/* 1. パンくずリスト (SEO/UX) */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/">TOP</Link> ＞ 
                    <Link href={`/catalog?q=${product.maker}`}>{product.maker}</Link> ＞ 
                    <span>{product.name}</span>
                </nav>

                {/* 2. ヒーローセクション */}
                <section className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        {currentRank > 0 && currentRank <= 100 && (
                            <div className={`${styles.detailRankBadge} ${styles[`rankColor_${Math.min(currentRank, 10)}`]}`}>
                                <span className={styles.rankLabel}>AI_RANK</span>
                                <span className={styles.rankNumber}>{currentRank}</span>
                            </div>
                        )}
                        <img src={product.image_url || '/no-image.png'} alt={`${product.name} 外観画像`} className={styles.productImage} />
                    </div>
                    
                    <div className={styles.infoSide}>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker}</span>
                            {attribute && <span className={styles.attributeBadge}>{attribute}</span>}
                        </div>
                        <h1 className={styles.productTitle}>
                            {product.name} <span className={styles.titleSub}>スペック・価格詳細レポート</span>
                        </h1>
                        
                        <div className={styles.priceContainer}>
                            <span className={styles.priceLabel}>現在の市場推定価格 (税込)</span>
                            <div className={styles.priceValue}>
                                {product.price ? `¥${product.price.toLocaleString()}` : <span className={styles.priceDraft}>価格情報を確認中</span>}
                            </div>
                        </div>

                        <a href={product.affiliate_url || product.url} target="_blank" rel="noopener noreferrer nofollow" className={styles.mainCtaButton}>
                            {product.maker}公式サイトで詳細を見る
                            <span className={styles.ctaSub}>最新のキャンペーン・納期を確認する</span>
                        </a>
                    </div>
                </section>

                {/* 3. 解析グリッド */}
                <div className={styles.analysisGrid}>
                    <section className={styles.analysisChartItem}>
                        <h2 className={styles.chartTitle}>性能評価スコアリング</h2>
                        <figure>
                            <SpecRadarChart
                                data={[
                                    { subject: 'CPU', value: product.score_cpu || 0, fullMark: 100 },
                                    { subject: 'GPU', value: product.score_gpu || 0, fullMark: 100 },
                                    { subject: 'コスパ', value: product.score_cost || 0, fullMark: 100 },
                                    { subject: '携帯性', value: product.score_portable || 0, fullMark: 100 },
                                    { subject: 'AI性能', value: product.score_ai || 0, fullMark: 100 },
                                ]}
                                color="#3b82f6"
                            />
                        </figure>
                    </section>
                    <section className={styles.analysisChartItem}>
                        <h2 className={styles.chartTitle}>価格推移グラフ</h2>
                        {product.price_history?.length > 0 ? (
                            <PriceHistoryChart history={product.price_history} />
                        ) : (
                            <div className={styles.noDataPlaceholder}>価格データをトラッキング中...</div>
                        )}
                    </section>
                </div>

                {/* 4. エキスパートレポート (メインコンテンツ) */}
                {product.ai_content && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>製品エキスパートレポート</h2>
                            <span className={styles.aiBadge}>AI ANALYSIS VERIFIED</span>
                        </div>
                        <article className={styles.aiContentBody}>
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {product.ai_content}
                            </ReactMarkdown>
                        </article>
                    </section>
                )}

                <ProductCTA />
                <FinalCta product={product} finalUrl={product.affiliate_url || product.url} isSoftware={isSoftware} />

                {/* 5. 関連製品 (内部リンク強化) */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.specTitle}>{product.maker} の関連製品アーカイブ</h2>
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