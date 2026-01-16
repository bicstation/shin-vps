/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { COLORS } from '@/constants';
import { fetchPostData, fetchProductDetail } from '@/lib/api';
import Link from 'next/link';
import styles from './PostPage.module.css';

// --- ユーティリティ ---

/**
 * 💡 HTMLエンティティのデコード
 */
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

/**
 * 💡 日本語形式の日付フォーマット
 */
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
};

/**
 * 💡 本文を解析して目次(H2/H3)を作成し、IDを注入する
 * SEO評価を高めるために階層構造をサポート
 */
function processContent(content: string) {
    const toc: { text: string; id: string; level: number }[] = [];
    let processedContent = content;

    // h2とh3タグを探して、IDを付与する
    let index = 0;
    processedContent = content.replace(/<(h2|h3)[^>]*>(.*?)<\/\1>/g, (match, tag, title) => {
        const cleanTitle = title.replace(/<[^>]*>/g, '').trim(); // タグ除去
        const id = `toc-${index}`;
        toc.push({ text: cleanTitle, id, level: parseInt(tag.replace('h', '')) });
        index++;
        return `<${tag} id="${id}">${title}</${tag}>`;
    });

    return { toc, processedContent };
}

/**
 * 💡 SEOメタデータの動的生成 (100点設定)
 */
export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    if (!post) return { title: "記事が見つかりません" };

    const title = `${safeDecode(post.title.rendered)} | BICSTATION`;
    const description = post.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 120).trim();
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://bicstation.com/og-image.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: eyeCatchUrl, width: 1200, height: 630, alt: title }],
            type: 'article',
            publishedTime: post.date,
            modifiedTime: post.modified,
            siteName: 'BICSTATION PCカタログ',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [eyeCatchUrl],
        }
    };
}

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const post = await fetchPostData(decodeURIComponent(params.id));
    if (!post) notFound();

    // 💡 コンテンツ加工
    const { toc, processedContent } = processContent(post.content.rendered);

    const productId = post.acf?.related_product_id || null;
    const relatedProduct = productId ? await fetchProductDetail(productId) : null;
    const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    const finalAffiliateUrl = relatedProduct?.affiliate_url?.trim() 
        ? relatedProduct.affiliate_url 
        : relatedProduct?.url || '#';

    const hasValidPrice = relatedProduct && relatedProduct.price && Number(relatedProduct.price) > 0;

    /**
     * 💡 JSON-LD 構造化データ
     */
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": safeDecode(post.title.rendered),
        "image": eyeCatchUrl || 'https://bicstation.com/og-image.png',
        "datePublished": post.date,
        "dateModified": post.modified,
        "author": [{
            "@type": "Person",
            "name": post.author_name || 'BICSTATION 編集部',
            "url": "https://bicstation.com"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "BICSTATION",
            "logo": {
                "@type": "ImageObject",
                "url": "https://bicstation.com/logo.png"
            }
        },
        "description": post.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 120)
    };

    return (
        <article className={styles.article} style={{ backgroundColor: COLORS.BACKGROUND }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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
                {/* 💡 目次セクション (階層構造対応) */}
                {toc.length > 0 && (
                    <section className={styles.inlineToc}>
                        <div className={styles.tocHeader}>
                            <span className={styles.tocIcon}>📋</span>
                            <h2 className={styles.tocTitle}>この記事の目次</h2>
                        </div>
                        <ul className={styles.tocList}>
                            {toc.map((item, index) => (
                                <li key={index} className={`${styles.tocItem} ${item.level === 3 ? styles.tocItemH3 : ''}`}>
                                    <a href={`#${item.id}`} className={styles.tocLink}>
                                        <span className={styles.tocNumber}>{index + 1}</span>
                                        {safeDecode(item.text)}
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

                    <div 
                        className={`${styles.wpContent} animate-in`} 
                        dangerouslySetInnerHTML={{ __html: processedContent }} 
                    />

                    {/* 💡 関連商品カード (重複排除ロジック適用) */}
                    {relatedProduct && (
                        <section className={styles.relatedProductCard}>
                            <div className={styles.cardTag}>RECOMMENDED ITEM</div>
                            <div className={styles.cardMain}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.cardImage}>
                                        <img src={relatedProduct.image_url || '/no-image.png'} alt={relatedProduct.name} />
                                    </div>
                                    <div className={styles.cardPriceBox}>
                                        {hasValidPrice ? (
                                            <>
                                                <span className={styles.cardPriceLabel}>販売価格</span>
                                                <span className={styles.cardPrice}>¥{Number(relatedProduct.price).toLocaleString()}</span>
                                                <span className={styles.taxIn}>(税込)</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.cardPriceLabel} style={{ marginBottom: '5px' }}>価格・在庫状況</span>
                                                <span className={styles.taxIn} style={{ fontSize: '0.85rem' }}>公式サイトにてご確認ください</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.cardRight}>
                                    <span className={styles.cardMaker}>{relatedProduct.maker}</span>
                                    <h3 className={styles.cardTitle}>{relatedProduct.name}</h3>
                                    <div className={styles.productSpecSummary}>
                                        <p className={styles.specSummaryTitle}>主要スペック</p>
                                        <ul className={styles.specMiniList}>
                                            {Array.from(new Set(relatedProduct.description?.split('/').map((s: string) => s.trim())))
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