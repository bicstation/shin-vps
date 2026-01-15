/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { COLORS } from '@/constants';
import { fetchPostData, fetchProductDetail } from '@/lib/api';
import Link from 'next/link';
import styles from './PostPage.module.css';

// --- ユーティリティ ---

const safeDecode = (str: string) => {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
};

/**
 * 💡 本文を解析して目次用データを作成し、本文のH2にIDを注入する
 */
function processContent(content: string) {
    const toc: string[] = [];
    let processedContent = content;

    // 1. 本文中のh2タグを探して、IDを付与したタグに置換する
    let index = 0;
    processedContent = content.replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, title) => {
        const cleanTitle = title.replace(/<[^>]*>/g, ''); // タグを除去してテキストのみ抽出
        toc.push(cleanTitle);
        const id = `toc-${index}`;
        index++;
        return `<h2 id="${id}">${title}</h2>`; // ID付きのH2に書き換え
    });

    return { toc, processedContent };
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    if (!post) return { title: "記事が見つかりません" };

    return {
        title: `${safeDecode(post.title.rendered)} | BICSTATION`,
        description: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 120),
    };
}

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    if (!post) notFound();

    // 💡 コンテンツの加工（目次抽出とID注入）
    const { toc, processedContent } = processContent(post.content.rendered);

    const productId = post.acf?.related_product_id || null;
    const relatedProduct = productId ? await fetchProductDetail(productId) : null;
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    const finalAffiliateUrl = relatedProduct?.affiliate_url?.trim() 
        ? relatedProduct.affiliate_url 
        : relatedProduct?.url || '#';

    const hasValidPrice = relatedProduct && relatedProduct.price && Number(relatedProduct.price) > 0;

    return (
        <article className={styles.article} style={{ backgroundColor: COLORS.BACKGROUND }}>
            
            <div className={styles.heroSection}>
                {eyeCatchUrl ? (
                    <div className={styles.eyeCatchWrapper}>
                        <img src={eyeCatchUrl} alt={safeDecode(post.title.rendered)} className={styles.eyeCatchImage} />
                        <div className={styles.eyeCatchOverlay}></div>
                    </div>
                ) : (
                    <div className={styles.noImageGradient}></div>
                )}
                <div className={styles.headerInner}>
                    <PostHeader 
                        post={post} 
                        decodeHtml={safeDecode} 
                        formatDate={formatDate} 
                        SITE_COLOR={COLORS.SITE_COLOR} 
                    />
                </div>
            </div>
            
            <div className={styles.singleColumnContainer}>
                {/* 💡 目次セクション */}
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
                                        {safeDecode(text)}
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

                    {/* 💡 加工済みの(ID付き)コンテンツを表示 */}
                    <div 
                        className={`${styles.wpContent} animate-in`} 
                        dangerouslySetInnerHTML={{ __html: processedContent }} 
                    />

                    {relatedProduct && (
                        <section className={styles.relatedProductCard}>
                            <div className={styles.cardTag}>RECOMMENDED ITEM</div>
                            <div className={styles.cardMain}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.cardImage}>
                                        <img src={relatedProduct.image_url || '/no-image.png'} alt={relatedProduct.name} />
                                    </div>
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
                                                .map((s: string) => s.trim())
                                                .filter((s: string) => s !== '')
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
                                        <a href={finalAffiliateUrl} target="_blank" rel="nofollow noopener" className={styles.affiliateBtn}>
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
                        <Link href="/" className={styles.backLink}>
                            ← 記事一覧に戻る
                        </Link>
                    </footer>
                </main>
            </div>
        </article>
    );
}