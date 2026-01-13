/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { COLORS } from '@/constants';
import { fetchPostData, fetchProductDetail } from '@/lib/api';
import Link from 'next/link';
import styles from './PostPage.module.css';

// --- ユーティリティ ---

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
                .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
};

function getTableOfContents(content: string) {
    // h2タグを抽出して目次を作成
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/g) || [];
    return h2Matches.map(tag => tag.replace(/<[^>]*>/g, ''));
}

// --- メインコンポーネント ---

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    
    if (!post) notFound();

    const productId = post.acf?.related_product_id || null;
    const relatedProduct = productId ? await fetchProductDetail(productId) : null;

    const toc = getTableOfContents(post.content.rendered);
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    const finalAffiliateUrl = (relatedProduct?.affiliate_url && relatedProduct.affiliate_url.trim() !== '') 
        ? relatedProduct.affiliate_url 
        : relatedProduct?.url || '#';

    // 価格表示の判定ロジック
    const hasValidPrice = relatedProduct && relatedProduct.price && Number(relatedProduct.price) > 0;

    return (
        <article className={styles.article} style={{ backgroundColor: COLORS.BACKGROUND }}>
            
            {/* 1. ヒーローセクション (アイキャッチ) */}
            <div className={styles.heroSection}>
                {eyeCatchUrl ? (
                    <div className={styles.eyeCatchWrapper}>
                        <img src={eyeCatchUrl} alt={decodeHtml(post.title.rendered)} className={styles.eyeCatchImage} />
                        <div className={styles.eyeCatchOverlay}></div>
                    </div>
                ) : (
                    <div className={styles.noImageGradient}></div>
                )}
                <div className={styles.headerInner}>
                    <PostHeader 
                        post={post} 
                        decodeHtml={decodeHtml} 
                        formatDate={formatDate} 
                        SITE_COLOR={COLORS.SITE_COLOR} 
                    />
                </div>
            </div>
            
            <div className={styles.singleColumnContainer}>
                {/* 2. 記事冒頭の目次セクション */}
                {toc.length > 0 && (
                    <section className={styles.inlineToc}>
                        <div className={styles.tocHeader}>
                            <span className={styles.tocIcon}>📋</span>
                            <h2 className={styles.tocTitle}>この記事の目次</h2>
                        </div>
                        <ul className={styles.tocList}>
                            {toc.map((text, index) => (
                                <li key={index} className={styles.tocItem}>
                                    <a href={`#toc-${index}`} className={styles.tocLink}>
                                        <span className={styles.tocNumber}>{index + 1}</span>
                                        {text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <main className={styles.mainContentFull}>
                    <div className={styles.entryInfo}>
                        <span className={styles.readingTime}>
                            ⏱️ 推定読了時間: 約 {Math.ceil(post.content.rendered.length / 800)} 分
                        </span>
                    </div>

                    {/* WordPressコンテンツ本体 */}
                    <div 
                        className={`${styles.wpContent} animate-in`} 
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                    />

                    {/* 3. 記事末尾の商品紹介カード (0円表示対策済み) */}
                    {relatedProduct && (
                        <section className={styles.relatedProductCard}>
                            <div className={styles.cardTag}>RECOMMENDED ITEM</div>
                            <div className={styles.cardMain}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.cardImage}>
                                        <img src={relatedProduct.image_url || '/no-image.png'} alt={relatedProduct.name} />
                                    </div>
                                    
                                    {/* 価格が有効な場合のみ表示 */}
                                    {hasValidPrice ? (
                                        <div className={styles.cardPriceBox}>
                                            <span className={styles.cardPriceLabel}>販売価格</span>
                                            <span className={styles.cardPrice}>¥{Number(relatedProduct.price).toLocaleString()}</span>
                                            <span className={styles.taxIn}>(税込)</span>
                                        </div>
                                    ) : (
                                        <div className={styles.cardPriceBox}>
                                            <span className={styles.cardPriceLabel} style={{ marginBottom: '5px' }}>価格・在庫状況</span>
                                            <span className={styles.taxIn} style={{ fontSize: '0.85rem' }}>公式サイトにてご確認ください</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.cardRight}>
                                    <span className={styles.cardMaker}>{relatedProduct.maker}</span>
                                    <h3 className={styles.cardTitle}>{relatedProduct.name}</h3>
                                    
                                    <div className={styles.productSpecSummary}>
                                        <p className={styles.specSummaryTitle}>主要スペック</p>
                                        <ul className={styles.specMiniList}>
                                            {relatedProduct.description?.split('/')
                                                .map(s => s.trim())
                                                .filter(s => s !== '')
                                                .slice(0, 4)
                                                .map((spec: string, i: number) => (
                                                    <li key={i} className={styles.specMiniItem}>
                                                        <span className={styles.specIcon}>⚡</span>
                                                        <span className={styles.specText}>{spec}</span>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>

                                    <div className={styles.cardButtons}>
                                        <a 
                                            href={finalAffiliateUrl} 
                                            target="_blank" 
                                            rel="nofollow noopener" 
                                            className={styles.affiliateBtn}
                                        >
                                            公式サイトで詳細を確認
                                        </a>
                                        <Link href={`/product/${relatedProduct.unique_id}`} className={styles.detailBtn}>
                                            徹底解説レビュー
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <footer className={styles.postFooter}>
                        <div className={styles.footerDivider}></div>
                        <p className={styles.updateDate}>最終更新日: {formatDate(post.modified)}</p>
                        <Link href="/blog" className={styles.backLink}>
                            ← 記事一覧に戻る
                        </Link>
                    </footer>
                </main>
            </div>
        </article>
    );
}