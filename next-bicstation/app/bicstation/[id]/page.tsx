/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { PostSidebar } from '@/components/blog/PostSidebar';
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
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/g) || [];
    return h2Matches.map(tag => tag.replace(/<[^>]*>/g, ''));
}

// --- メインコンポーネント ---

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    
    if (!post) notFound();

    // 関連商品の取得（WordPressのACF等から取得）
    const productId = post.acf?.related_product_id || null;
    const relatedProduct = productId ? await fetchProductDetail(productId) : null;

    const toc = getTableOfContents(post.content.rendered);
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    return (
        <article className={styles.article} style={{ backgroundColor: COLORS.BACKGROUND }}>
            
            {/* 1. ヒーローセクション */}
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
            
            <div className={styles.container}>
                <div className={styles.contentLayout}>
                    {/* 2. メインコンテンツ */}
                    <main className={styles.mainContent}>
                        <div className={styles.entryInfo}>
                            <span className={styles.readingTime}>
                                推定読了時間: 約 {Math.ceil(post.content.rendered.length / 800)} 分
                            </span>
                        </div>

                        <div 
                            className={`${styles.wpContent} animate-in`} 
                            dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                        />

                        {/* 3. 記事末尾の商品紹介プレミアムカード（スペック目次付き） */}
                        {relatedProduct && (
                            <section className={styles.relatedProductCard}>
                                <div className={styles.cardTag}>RECOMMENDED ITEM</div>
                                <div className={styles.cardMain}>
                                    <div className={styles.cardLeft}>
                                        <div className={styles.cardImage}>
                                            <img src={relatedProduct.image_url || '/no-image.png'} alt={relatedProduct.name} />
                                        </div>
                                        <div className={styles.cardPriceBox}>
                                            <span className={styles.cardPriceLabel}>販売価格</span>
                                            <span className={styles.cardPrice}>¥{relatedProduct.price.toLocaleString()}</span>
                                            <span className={styles.taxIn}>(税込)</span>
                                        </div>
                                    </div>

                                    <div className={styles.cardRight}>
                                        <span className={styles.cardMaker}>{relatedProduct.maker}</span>
                                        <h3 className={styles.cardTitle}>{relatedProduct.name}</h3>
                                        
                                        {/* スペック目次 (Descriptionから抜粋) */}
                                        <div className={styles.productSpecSummary}>
                                            <p className={styles.specSummaryTitle}>このモデルの主要スペック</p>
                                            <ul className={styles.specMiniList}>
                                                {relatedProduct.description?.split('/').slice(0, 4).map((spec: string, i: number) => (
                                                    <li key={i} className={styles.specMiniItem}>
                                                        <span className={styles.specIcon}>⚡</span>
                                                        {spec.trim()}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={styles.cardButtons}>
                                            <a href={relatedProduct.affiliate_url || relatedProduct.url} target="_blank" rel="nofollow noopener" className={styles.affiliateBtn}>
                                                公式サイトで詳細・納期を確認
                                            </a>
                                            <Link href={`/product/${relatedProduct.unique_id}`} className={styles.detailBtn}>
                                                徹底解説レビューを見る
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <footer className={styles.postFooter}>
                            <p className={styles.updateDate}>最終更新日: {formatDate(post.modified)}</p>
                        </footer>
                    </main>
                    
                    {/* 4. サイドバー */}
                    <aside className={styles.sidebarWrapper}>
                        <div className={styles.stickySidebar}>
                            <PostSidebar 
                                toc={toc} 
                                SITE_COLOR={COLORS.SITE_COLOR} 
                                ACCENT_COLOR={COLORS.ACCENT_COLOR} 
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}