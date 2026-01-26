/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { COLORS } from '@/constants';
// 🚀 fetchPosts を fetchPostList に変更
import { fetchPostData, fetchProductDetail, fetchPostList } from '@/lib/api';
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

function processContent(content: string) {
    const toc: { text: string; id: string; level: number }[] = [];
    let index = 0;
    const processedContent = content.replace(/<(h2|h3)[^>]*>(.*?)<\/\1>/g, (match, tag, title) => {
        const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
        const id = `toc-${index}`;
        toc.push({ text: cleanTitle, id, level: parseInt(tag.replace('h', '')) });
        index++;
        return `<${tag} id="${id}">${title}</${tag}>`;
    });
    return { toc, processedContent };
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(params.id);
    if (!post) return { title: "記事が見つかりません" };

    const title = `${safeDecode(post.title.rendered)} | BICSTATION`;
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

    return {
        title,
        openGraph: {
            title,
            images: [eyeCatchUrl],
        }
    };
}

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(params.id);
    
    if (!post) notFound();

    const { toc, processedContent } = processContent(post.content.rendered);
    const relatedProductId = post.acf?.related_product_id || null;
    const relatedProduct = relatedProductId ? await fetchProductDetail(relatedProductId) : null;
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    // 🚀 fetchPostList を実行。戻り値は { results, count, ... } なので destructuring する
    const { results: allPosts } = await fetchPostList(10, 0);
    
    const currentIndex = allPosts.findIndex((p: any) => p.id === post.id);
    const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    const recommendedPosts = allPosts.filter((p: any) => p.id !== post.id).slice(0, 3);

    return (
        <article className={styles.article}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                {eyeCatchUrl && (
                    <div className={styles.eyeCatchWrapper}>
                        <img src={eyeCatchUrl} alt="" className={styles.eyeCatchImage} />
                        <div className={styles.eyeCatchOverlay}></div>
                    </div>
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
                {/* 目次 */}
                {toc.length > 0 && (
                    <section className={styles.tocSection}>
                        <div className={styles.tocHeader}>
                            <span className={styles.tocIcon}>INDEX</span>
                            <h2 className={styles.tocTitle}>目次</h2>
                        </div>
                        <ul className={styles.tocList}>
                            {toc.map((item, index) => (
                                <li key={index} className={`${styles.tocItem} ${item.level === 3 ? styles.tocItemH3 : ''}`}>
                                    <a href={`#${item.id}`}>
                                        <span className={styles.tocNumber}>{index + 1}</span>
                                        {safeDecode(item.text)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <main className={styles.mainContent}>
                    <div className={styles.wpContent} dangerouslySetInnerHTML={{ __html: processedContent }} />

                    {/* 商品紹介カード */}
                    {relatedProduct && (
                        <section className={styles.enhancedCTA}>
                            <div className={styles.ctaBadge}>PICK UP ITEM</div>
                            <div className={styles.ctaContainer}>
                                <div className={styles.ctaImageArea}>
                                    <img src={relatedProduct.image_url} alt={relatedProduct.name} />
                                </div>
                                <div className={styles.ctaInfoArea}>
                                    <span className={styles.ctaMaker}>{relatedProduct.maker}</span>
                                    <h3 className={styles.ctaTitle}>{relatedProduct.name}</h3>
                                    <div className={styles.ctaPriceRow}>
                                        <span className={styles.ctaPriceValue}>
                                            ¥{Number(relatedProduct.price).toLocaleString()}<small>(税込)</small>
                                        </span>
                                    </div>
                                    <div className={styles.ctaActionButtons}>
                                        <Link href={`/product/${relatedProduct.unique_id}`} className={styles.ctaDetailBtn}>詳細を見る</Link>
                                        <a href={relatedProduct.affiliate_url} target="_blank" rel="nofollow" className={styles.ctaShopBtn}>販売ページへ</a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ナビゲーション */}
                    <nav className={styles.postNav}>
                        {prevPost ? (
                            <Link href={`/bicstation/${prevPost.slug}`} className={styles.prevLink}>
                                <span className={styles.navLabel}>← 前の記事</span>
                                <span className={styles.navTitle}>{safeDecode(prevPost.title.rendered)}</span>
                            </Link>
                        ) : <div />}
                        {nextPost ? (
                            <Link href={`/bicstation/${nextPost.slug}`} className={styles.nextLink}>
                                <span className={styles.navLabel}>次の記事 →</span>
                                <span className={styles.navTitle}>{safeDecode(nextPost.title.rendered)}</span>
                            </Link>
                        ) : <div />}
                    </nav>

                    <section className={styles.recommendSection}>
                        <h3 className={styles.recommendTitle}>おすすめの記事</h3>
                        <div className={styles.recommendGrid}>
                            {recommendedPosts.map((rPost: any) => (
                                <Link key={rPost.id} href={`/bicstation/${rPost.slug}`} className={styles.recommendCard}>
                                    <div className={styles.recommendThumb}>
                                        <img src={rPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/no-image.png'} alt="" />
                                    </div>
                                    <div className={styles.recommendContent}>
                                        <h4>{safeDecode(rPost.title.rendered)}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </article>
    );
}