import React from 'react';
import { notFound } from 'next/navigation';
import { fetchProductDetail, fetchRelatedProducts } from '@/lib/api';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

export default async function ProductDetailPage(props: { params: Promise<{ unique_id: string }> }) {
    const params = await props.params;
    const product = await fetchProductDetail(params.unique_id);

    if (!product) notFound();

    // 関連商品の取得
    const relatedProducts = await fetchRelatedProducts(product.maker, params.unique_id);
    const finalUrl = product.affiliate_url || product.url;

    /**
     * AIコンテンツの解析（目次、要約データ、本文の分離）
     */
    const parseContent = (html: string) => {
        // 目次（h2）の抽出
        const h2RegExp = /<h2.*?>(.*?)<\/h2>/g;
        const tocItems = [];
        let match;
        while ((match = h2RegExp.exec(html)) !== null) {
            tocItems.push(match[1].replace(/<[^>]*>?/gm, ''));
        }

        // [SUMMARY_DATA] の抽出
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

        // タグを消去したクリーンな本文
        const cleanBody = html.replace(summaryRegex, '').trim();

        return { tocItems, summary, cleanBody };
    };

    const { tocItems, summary, cleanBody } = parseContent(product.ai_content || "");

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>
                
                {/* 1. ヒーローセクション（商品概要） */}
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
                            <span className={styles.priceLabel}>メーカー直販特別価格</span>
                            <div className={styles.priceValue}>
                                ¥{product.price.toLocaleString()}<span className={styles.taxLabel}>(税込)</span>
                            </div>
                        </div>
                        <a href={finalUrl} target="_blank" rel="nofollow noopener noreferrer" className={styles.mainCtaButton}>
                            {product.maker}公式サイトで詳細・構成を見る
                            <span className={styles.ctaSub}>※最短翌日お届け・分割手数料無料対象</span>
                        </a>
                    </div>
                </div>

                {/* 2. 【新設】クイックハイライト（3つのポイント） */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <div className={styles.sectionInner}>
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
                        </div>
                    </section>
                )}

                {/* 3. エキスパート解説 & 目次 */}
                {cleanBody && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>エキスパートによる製品解説</h2>
                            <span className={styles.aiBadge}>AI分析レポート</span>
                        </div>

                        {tocItems.length > 0 && (
                            <div className={styles.tocContainer}>
                                <div className={styles.tocTitle}>
                                    <span className={styles.tocIcon}>📋</span>目次
                                </div>
                                <ul className={styles.tocList}>
                                    {tocItems.map((item, index) => (
                                        <li key={index} className={styles.tocItem}>
                                            <span className={styles.tocNumber}>{index + 1}</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div 
                            className={styles.aiContentBody} 
                            dangerouslySetInnerHTML={{ __html: cleanBody }} 
                        />
                    </section>
                )}

                {/* 4. スペック詳細（表形式） */}
                <section className={styles.specSection}>
                    <h2 className={styles.specTitle}>構成・スペック詳細</h2>
                    <div className={styles.specGrid}>
                        {product.description?.split('/').map((spec, i) => (
                            <div key={i} className={styles.specRow}>
                                <span className={styles.specCheck}>✓</span>
                                <span className={styles.specText}>{spec.trim()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. 【ダメ押し】プレミアムCTAセクション */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.finalCtaCard}>
                        <div className={styles.finalCtaImage}>
                            <img src={product.image_url || '/no-image.png'} alt={product.name} />
                        </div>
                        <div className={styles.finalCtaInfo}>
                            <h3>後悔しない、最高の一台を。</h3>
                            <p className={styles.finalProductName}>{product.name}</p>
                            <div className={styles.finalPrice}>
                                <span className={styles.finalPriceLabel}>価格</span>
                                ¥{product.price.toLocaleString()}〜
                            </div>
                        </div>
                        <div className={styles.finalCtaAction}>
                            <a href={finalUrl} target="_blank" rel="nofollow noopener noreferrer" className={styles.premiumButton}>
                                公式サイトで最新の在庫を確認
                            </a>
                            <p className={styles.ctaNote}>※カスタマイズ・周辺機器の同時購入もこちらから</p>
                        </div>
                    </div>
                </section>

                {/* 6. 関連商品（回遊性向上） */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.relatedTitle}>
                            <span className={styles.relatedTitleLine}></span>
                            こちらも注目：{product.maker} の人気モデル
                        </h2>
                        <div className={styles.relatedGrid}>
                            {relatedProducts.map((item) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImage}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={styles.relatedName}>{item.name}</p>
                                        <p className={styles.relatedPrice}>¥{item.price.toLocaleString()}</p>
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