/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProductDetail, fetchRelatedProducts } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './ProductDetail.module.css'; // 🚩 ご提示いただいた最新CSS

interface PageProps {
    params: Promise<{ unique_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { unique_id } = await params;
    const product = await fetchProductDetail(unique_id);
    if (!product) return { title: "製品が見つかりません" };
    return { title: `${product.name} | BICSTATION` };
}

export default async function ProductDetailPage(props: { params: Promise<{ unique_id: string }> }) {
    const params = await props.params;
    const product = await fetchProductDetail(params.unique_id);
    if (!product) notFound();

    const relatedProducts = await fetchRelatedProducts(product.maker, params.unique_id);
    const finalUrl = product.affiliate_url || product.url;
    const isPriceAvailable = product.price > 0;
    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    const parseContent = (html: string) => {
        const h2RegExp = /<h2.*?>(.*?)<\/h2>/g;
        const tocItems = [];
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
        const cleanBody = html.replace(summaryRegex, '').trim();
        return { tocItems, summary, cleanBody };
    };

    const { tocItems, summary, cleanBody } = parseContent(product.ai_content || "");

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>
                {/* 1. ヒーローセクション */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        <img src={product.image_url || '/no-image.png'} alt={product.name} className={styles.productImage} />
                    </div>
                    <div className={styles.infoSide}>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker}</span>
                            <span className={styles.genreBadge}>{product.unified_genre}</span>
                        </div>
                        <h1 className={styles.productTitle}>{product.name}</h1>
                        <div className={styles.priceContainer}>
                            <span className={styles.priceLabel}>{isPriceAvailable ? "メーカー直販特別価格" : "販売価格・在庫状況"}</span>
                            <div className={styles.priceValue}>
                                {isPriceAvailable ? (
                                    <>¥{product.price.toLocaleString()}<span className={styles.taxLabel}>(税込)</span></>
                                ) : (
                                    <span style={{ fontSize: '0.6em', color: '#e67e22' }}>公式サイトで確認</span>
                                )}
                            </div>
                        </div>
                        <a href={finalUrl} target="_blank" rel="nofollow" className={styles.mainCtaButton}
                           style={!isPriceAvailable ? { background: 'linear-gradient(135deg, #f39c12, #e67e22)' } : {}}>
                            {product.maker}公式サイトで詳細を見る
                            <span className={styles.ctaSub}>※最短翌日お届け・分割手数料無料対象</span>
                        </a>
                    </div>
                </div>

                {/* 2. クイックハイライト */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <h2 className={styles.minimalTitle}>このモデルが選ばれる理由</h2>
                        <div className={styles.highlightGrid}>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>🚀</span><p>{summary.p1}</p></div>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>💎</span><p>{summary.p2}</p></div>
                            <div className={styles.highlightCard}><span className={styles.highlightIcon}>🔋</span><p>{summary.p3}</p></div>
                        </div>
                        <div className={styles.targetBox}>
                            <span className={styles.targetLabel}>Recommend</span>
                            <p className={styles.targetText}>{summary.target}</p>
                        </div>
                    </section>
                )}

                {/* 3. エキスパート解説 */}
                {cleanBody && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>エキスパートによる製品解説</h2>
                            <span className={styles.aiBadge}>AI分析レポート</span>
                        </div>
                        {tocItems.length > 0 && (
                            <div className={styles.tocContainer}>
                                <div className={styles.tocTitle}>📋 目次</div>
                                <ul className={styles.tocList}>
                                    {tocItems.map((item, i) => (
                                        <li key={i} className={styles.tocItem}><span className={styles.tocNumber}>{i + 1}</span> {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className={styles.aiContentBody} dangerouslySetInnerHTML={{ __html: cleanBody }} />
                    </section>
                )}

                {/* 4. スペック詳細 */}
                <section className={styles.specSection}>
                    <h2 className={styles.specTitle}>構成・スペック詳細</h2>
                    <div className={styles.specGrid}>
                        {product.description?.split('/').map((spec: string, i: number) => (
                            <div key={i} className={styles.specRow}>
                                <span className={styles.specCheck}>✓</span><span className={styles.specText}>{spec.trim()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. プレミアムCTA */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.finalCtaCard}>
                        <div className={styles.finalCtaImage}><img src={product.image_url || '/no-image.png'} alt="" /></div>
                        <div className={styles.finalCtaInfo}>
                            <h3>後悔しない、最高の一台を。</h3>
                            <p className={styles.finalProductName}>{product.name}</p>
                            <div className={styles.finalPrice}>
                                <span className={styles.finalPriceLabel}>{isPriceAvailable ? "価格" : "最新ステータス"}</span>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}〜` : "公式サイトで公開中"}
                            </div>
                        </div>
                        <div className={styles.finalCtaAction}>
                            <a href={finalUrl} target="_blank" rel="nofollow" className={styles.premiumButton}>公式サイトで最新の在庫を確認</a>
                            <p className={styles.ctaNote}>※カスタマイズ・周辺機器の購入もこちらから</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}