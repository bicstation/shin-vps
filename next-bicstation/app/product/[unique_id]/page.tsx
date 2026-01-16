/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProductDetail, fetchRelatedProducts } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './ProductDetail.module.css';

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

    const title = `${product.name} のスペック・価格・評判 | ${product.maker}最新PC比較`;
    const seoDescription = `${product.maker}の最新モデル「${product.name}」のスペック、価格、特徴を詳細に解説。${product.description?.substring(0, 80)}... 最安値や在庫状況をリアルタイムでチェック。`;
    
    const keywords = [
        product.name,
        product.maker,
        product.unified_genre,
        "PCスペック",
        "最安値",
        "価格比較",
        "最新モデル",
        "BICSTATION"
    ].filter(Boolean).join(", ");

    return {
        title,
        description: seoDescription,
        keywords,
        openGraph: {
            title,
            description: seoDescription,
            images: [product.image_url || '/no-image.png'],
            type: 'article',
            url: `https://bicstation.com/product/${unique_id}`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: seoDescription,
            images: [product.image_url || '/no-image.png'],
        }
    };
}

export default async function ProductDetailPage(props: PageProps) {
    const { unique_id } = await props.params;
    const product = await fetchProductDetail(unique_id);
    
    if (!product) {
        notFound();
    }

    const p = product as any;

    // 💡 関連商品の取得（確実に最大8つ表示）
    const relatedProducts = await fetchRelatedProducts(product.maker, unique_id);
    const displayRelated = relatedProducts.slice(0, 8);
    
    const finalUrl = product.affiliate_url || product.url;
    const isPriceAvailable = product.price > 0;
    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    /**
     * 💡 ジャンルリンク用の最初の属性スラッグを取得
     */
    const firstAttributeSlug = (p.attributes && p.attributes.length > 0)
        ? p.attributes[0].slug
        : '';

    /**
     * AIコンテンツの解析（目次・要約・本文の分離）
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
        const cleanBody = html.replace(summaryRegex, '').trim();
        return { tocItems, summary, cleanBody };
    };

    const { tocItems, summary, cleanBody } = parseContent(product.ai_content || "");

    /**
     * 💡 JSON-LD 構造化データ
     */
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image_url || '/no-image.png',
        "description": `${product.maker}のPC、${product.name}の詳細スペック。`,
        "brand": {
            "@type": "Brand",
            "name": product.maker
        },
        "offers": {
            "@type": "Offer",
            "url": finalUrl,
            "priceCurrency": "JPY",
            "price": isPriceAvailable ? product.price : undefined,
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <div className={styles.wrapper}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className={styles.mainContainer}>
                {/* 1. ヒーローセクション */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
                        <img 
                            src={product.image_url || '/no-image.png'} 
                            alt={product.name} 
                            className={styles.productImage} 
                        />
                    </div>
                    <div className={styles.infoSide}>
                        <div className={styles.badgeContainer}>
                            {product.unified_genre && (
                                <Link 
                                    href={`/brand/${product.maker.toLowerCase()}?attribute=${firstAttributeSlug}`} 
                                    className={styles.genreBadgeLink}
                                >
                                    <span className={styles.genreBadge}># {product.unified_genre}</span>
                                </Link>
                            )}
                            <span className={styles.makerBadge}>{product.maker}</span>
                        </div>
                        <h1 className={styles.productTitle}>{product.name}</h1>
                        <div className={styles.priceContainer}>
                            <span className={styles.priceLabel}>
                                {isPriceAvailable ? "メーカー直販特別価格" : "販売状況"}
                            </span>
                            <div className={styles.priceValue}>
                                {isPriceAvailable ? (
                                    <>¥{product.price.toLocaleString()}<span className={styles.taxLabel}>(税込)</span></>
                                ) : (
                                    <span style={{ fontSize: '0.7em', color: '#e67e22' }}>公式サイトで確認</span>
                                )}
                            </div>
                        </div>
                        <a href={finalUrl} target="_blank" rel="nofollow" className={styles.mainCtaButton}>
                            {product.maker}公式サイトで詳細を見る
                            <span className={styles.ctaSub}>※最新の在庫・納期をチェック</span>
                        </a>
                    </div>
                </div>

                {/* 2. クイックハイライト */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <h2 className={styles.minimalTitle}>このモデルが選ばれる理由</h2>
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

                {/* 4. スペック詳細 & 属性タグリンク */}
                <section className={styles.specSection}>
                    <h2 className={styles.specTitle}>構成・スペック詳細</h2>
                    <div className={styles.specGrid}>
                        {product.description?.split('/').map((spec: string, i: number) => (
                            <div key={i} className={styles.specRow}>
                                <span className={styles.specCheck} style={{ color: primaryColor }}>✓</span>
                                <span className={styles.specText}>{spec.trim()}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* 💡 属性タグ表示：すべてLinkで囲み、クリックで仕分けページへ */}
                    {p.attributes && p.attributes.length > 0 && (
                        <div className={styles.attributeTags}>
                            {p.attributes.map((attr: any, idx: number) => (
                                <Link 
                                    key={idx} 
                                    href={`/brand/${product.maker.toLowerCase()}?attribute=${attr.slug}`}
                                    className={styles.attrTagLink}
                                >
                                    <span className={styles.attrTag}>{attr.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* 5. 関連商品セクション（最大8商品） */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>こちらもおすすめ：{product.maker}のPC</h2>
                        </div>
                        <div className={styles.relatedGrid}>
                            {displayRelated.map((item) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={item.name.length > 20 ? styles.relatedNameSmall : styles.relatedName}>
                                            {item.name}
                                        </p>
                                        <div className={styles.relatedPrice}>
                                            {item.price > 0 ? (
                                                `¥${item.price.toLocaleString()}〜`
                                            ) : (
                                                <span className={styles.relatedPriceNote}>価格を確認</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. プレミアムCTA */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.finalCtaCard}>
                        <div className={styles.finalCtaImage}>
                            <img src={product.image_url || '/no-image.png'} alt="" />
                        </div>
                        <div className={styles.finalCtaInfo}>
                            <h3>後悔しない、最高の一台を。</h3>
                            <p className={styles.finalProductName}>{product.name}</p>
                            <div className={styles.finalPrice}>
                                <span className={styles.finalPriceLabel}>販売価格</span>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}〜` : "公式サイトで公開中"}
                            </div>
                        </div>
                        <div className={styles.finalCtaAction}>
                            <a href={finalUrl} target="_blank" rel="nofollow" className={styles.premiumButton}>
                                公式サイトで在庫を確認
                            </a>
                        </div>
                    </div>
                </section>

                <div className={styles.backToBrand}>
                    <Link href={`/brand/${product.maker.toLowerCase()}`} className={styles.backLink}>
                        ← {product.maker} の最新PC製品一覧・比較に戻る
                    </Link>
                </div>
            </main>
        </div>
    );
}