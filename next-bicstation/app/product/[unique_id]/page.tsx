/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProductDetail, fetchRelatedProducts } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './ProductDetail.module.css';
import PriceHistoryChart from '@/components/PriceHistoryChart'; // 📈 グラフコンポーネントをインポート

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
    
    const keywords = [
        product.name,
        product.maker,
        product.unified_genre,
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
    const relatedProducts = await fetchRelatedProducts(product.maker, unique_id);
    const displayRelated = relatedProducts.slice(0, 8);
    const finalUrl = product.affiliate_url || product.url;
    const isPriceAvailable = product.price > 0;
    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    // 💡 ソフトウェアブランド判定（表示最適化のため）
    const softwareKeywords = ["トレンドマイクロ", "ソースネクスト", "ADOBE", "MICROSOFT", "EIZO", "ウイルスバスター"];
    const isSoftware = softwareKeywords.some(keyword => 
        product.maker.toUpperCase().includes(keyword.toUpperCase()) || 
        product.name.includes(keyword)
    );

    const firstAttributeSlug = (p.attributes && p.attributes.length > 0)
        ? p.attributes[0].slug
        : '';

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
        const cleanBody = html.replace(summaryRegex, '').trim();
        return { tocItems, summary, cleanBody };
    };

    const { tocItems, summary, cleanBody } = parseContent(product.ai_content || "");

    // 💡 トレンド・人気ダミーデータ生成
    const today = new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    const trendLabel = isSoftware ? "ライセンス動向" : "在庫・価格動向";
    const trendValue = isSoftware ? "▲ ダウンロード版 需要増加中" : "▼ 本日、最安値更新を確認";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image_url || '/no-image.png',
        "brand": { "@type": "Brand", "name": product.maker },
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
                {/* 📈 リアルタイム・トレンドバナー */}
                <div className={styles.trendBanner} style={{ backgroundColor: '#fff', border: '1px solid #eee', padding: '10px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                        <span style={{ backgroundColor: primaryColor, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{today} UPDATE</span>
                        <span style={{ fontWeight: '600', color: '#555' }}>{trendLabel}:</span>
                        <span style={{ color: '#e63946', fontWeight: 'bold' }}>{trendValue}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        🔥 24時間以内に {Math.floor(Math.random() * 50) + 10}人がこのページをチェックしました
                    </div>
                </div>

                {/* 1. ヒーローセクション */}
                <div className={styles.heroSection}>
                    <div className={styles.imageWrapper}>
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
                            <span className={styles.priceLabel}>{isPriceAvailable ? (isSoftware ? "ダウンロード版/パッケージ価格" : "メーカー直販特別価格") : "販売状況"}</span>
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
                            <span className={styles.ctaSub}>※{isSoftware ? "最新のエディション・期間をチェック" : "最新の在庫・納期をチェック"}</span>
                        </a>
                    </div>
                </div>

                {/* 📈 1.5 価格履歴グラフセクション（追加） */}
                <div style={{ marginBottom: '30px' }}>
                    {p.price_history && p.price_history.length > 0 ? (
                        <PriceHistoryChart history={p.price_history} />
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#999', fontSize: '0.85rem', border: '1px dashed #ddd' }}>
                            価格推移データは十分な期間の蓄積が必要です。
                        </div>
                    )}
                </div>

                {/* 2. クイックハイライト */}
                {summary && (
                    <section className={styles.highlightSection}>
                        <h2 className={styles.minimalTitle}>{isSoftware ? "この製品の主要な特徴" : "このモデルが選ばれる理由"}</h2>
                        <div className={styles.highlightGrid}>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>{isSoftware ? "🛡️" : "🚀"}</span>
                                <p>{summary.p1}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>{isSoftware ? "💻" : "💎"}</span>
                                <p>{summary.p2}</p>
                            </div>
                            <div className={styles.highlightCard}>
                                <span className={styles.highlightIcon}>{isSoftware ? "⏱️" : "🔋"}</span>
                                <p>{summary.p3}</p>
                            </div>
                        </div>
                        <div className={styles.targetBox}>
                            <span className={styles.targetLabel}>Recommend</span>
                            <p className={styles.targetText}>{summary.target}</p>
                        </div>
                    </section>
                )}

                {/* ✅ 3. スペックサマリー */}
                <section className={styles.aiSpecSummarySection}>
                    <h2 className={styles.minimalTitle}>{isSoftware ? "動作要件・ライセンス" : "主要スペック構成"}</h2>
                    <div className={styles.aiSpecGrid}>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "対応OS" : "CPU"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.os_support || 'Windows / Mac / Android') : (p.cpu_model || '標準構成')}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "ライセンス形態" : "GPU"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.license_type || 'サブスクリプション') : (p.gpu_model || '標準構成')}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "有効期間" : "メモリ"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.license_term || '1年 / 3年') : (p.memory_gb ? `${p.memory_gb}GB` : '標準構成')}</span>
                        </div>
                        <div className={styles.aiSpecCard}>
                            <span className={styles.aiSpecLabel}>{isSoftware ? "利用可能台数" : "ストレージ"}</span>
                            <span className={styles.aiSpecValue}>{isSoftware ? (p.device_count || '3台〜') : (p.storage_gb ? `${p.storage_gb}GB SSD` : '標準構成')}</span>
                        </div>
                        {!isSoftware && (
                            <div className={styles.aiSpecCard}>
                                <span className={styles.aiSpecLabel}>ディスプレイ</span>
                                <span className={styles.aiSpecValue}>{p.display_info || '標準構成'}</span>
                            </div>
                        )}
                        {p.is_ai_pc && (
                            <div className={`${styles.aiSpecCard} ${styles.aiPcCard}`}>
                                <span className={styles.aiSpecLabel}>AI機能</span>
                                <span className={styles.aiSpecValue}>AI PC 対応</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ✅ 4. 自作PC・拡張情報 */}
                {!isSoftware && (p.cpu_socket || p.motherboard_chipset || p.ram_type) && (
                    <section className={styles.upgradeSection}>
                        <div className={styles.upgradeHeader}>
                            <h2 className={styles.minimalTitle}>自作PC・アップグレード情報</h2>
                            <span className={styles.diyBadge}>DIY Support</span>
                        </div>
                        <div className={styles.upgradeGrid}>
                            <div className={styles.upgradeCard}>
                                <div className={styles.upgradeLabel}>CPUソケット</div>
                                <div className={styles.upgradeValue}>{p.cpu_socket || '非公開'}</div>
                            </div>
                            <div className={styles.upgradeCard}>
                                <div className={styles.upgradeLabel}>チップセット</div>
                                <div className={styles.upgradeValue}>{p.motherboard_chipset || '標準'}</div>
                            </div>
                            <div className={styles.upgradeCard}>
                                <div className={styles.upgradeLabel}>メモリ規格</div>
                                <div className={styles.upgradeValue}>{p.ram_type || '標準'}</div>
                            </div>
                            <div className={styles.upgradeCard}>
                                <div className={styles.upgradeLabel}>推奨電源</div>
                                <div className={styles.upgradeValue}>{p.power_recommendation ? `${p.power_recommendation}W` : '標準'}</div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. エキスパート解説 */}
                {cleanBody && (
                    <section className={styles.aiContentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.specTitle}>{isSoftware ? "製品詳細レビュー" : "エキスパートによる製品解説"}</h2>
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

                {/* 6. スペック詳細 & 属性タグ */}
                <section className={styles.specSection}>
                    <h2 className={styles.specTitle}>{isSoftware ? "詳細仕様" : "詳細スペック"}</h2>
                    <div className={styles.specGrid}>
                        {product.description?.split('/').map((spec: string, i: number) => (
                            <div key={i} className={styles.specRow}>
                                <span className={styles.specCheck} style={{ color: primaryColor }}>✓</span>
                                <span className={styles.specText}>{spec.trim()}</span>
                            </div>
                        ))}
                    </div>
                    
                    {p.attributes && p.attributes.length > 0 && (
                        <div className={styles.attributeTags}>
                            {p.attributes.map((attr: any, idx: number) => (
                                <Link key={idx} href={`/brand/${product.maker.toLowerCase()}?attribute=${attr.slug}`} className={styles.attrTagLink}>
                                    <span className={styles.attrTag}>{attr.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* 7. 関連商品 */}
                {displayRelated.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.specTitle}>こちらもおすすめ：{product.maker} のラインナップ</h2>
                        <div className={styles.relatedGrid}>
                            {displayRelated.map((item) => (
                                <Link href={`/product/${item.unique_id}`} key={item.unique_id} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <img src={item.image_url || '/no-image.png'} alt={item.name} />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={item.name.length > 20 ? styles.relatedNameSmall : styles.relatedName}>{item.name}</p>
                                        <div className={styles.relatedPrice}>
                                            {item.price > 0 ? `¥${item.price.toLocaleString()}〜` : "価格を確認"}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. プレミアムCTA */}
                <section className={styles.finalCtaSection}>
                    <div className={styles.finalCtaCard}>
                        <div className={styles.finalCtaImage}>
                            <img src={product.image_url || '/no-image.png'} alt="" />
                        </div>
                        <div className={styles.finalCtaInfo}>
                            <h3>{isSoftware ? "今すぐ、最新のセキュリティを。" : "後悔しない、最高の一台を。"}</h3>
                            <p className={styles.finalProductName}>{product.name}</p>
                            <div className={styles.finalPrice}>
                                <span className={styles.finalPriceLabel}>販売価格</span>
                                {isPriceAvailable ? `¥${product.price.toLocaleString()}〜` : "公式サイトで公開中"}
                            </div>
                        </div>
                        <div className={styles.finalCtaAction}>
                            <a href={finalUrl} target="_blank" rel="nofollow" className={styles.premiumButton}>
                                公式サイトで{isSoftware ? "購入プランを選ぶ" : "在庫を確認"}
                            </a>
                        </div>
                    </div>
                </section>

                <div className={styles.backToBrand}>
                    <Link href={`/brand/${product.maker.toLowerCase()}`} className={styles.backLink}>
                        ← {product.maker} の最新製品一覧に戻る
                    </Link>
                </div>
            </main>
        </div>
    );
}