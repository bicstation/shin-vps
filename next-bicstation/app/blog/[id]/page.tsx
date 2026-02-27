/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostHeader } from '@shared/blog/PostHeader';
import PostLayout from '@shared/layout/PostLayout';
import { COLORS } from '@shared/styles/constants';
// 修正されたAPIをインポート
import { fetchPostList, fetchPostData, getWpFeaturedImage } from '../../../shared/lib/api/wordpress';
import { fetchProductDetail } from '@shared/lib/api/django';
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

// --- SEO・メタデータ ---

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  // 引数を ('post', id) に修正
  const post = await fetchPostData('post', id);
  
  if (!post) return { title: "記事が見つかりません | BICSTATION" };

  const title = `${safeDecode(post.title.rendered)} | BICSTATION`;
  const description = post.excerpt?.rendered.replace(/<[^>]*>/g, '').slice(0, 120).trim();
  const eyeCatchUrl = getWpFeaturedImage(post, 'large');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: eyeCatchUrl ? [{ url: eyeCatchUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: eyeCatchUrl ? [eyeCatchUrl] : [],
    },
  };
}

// --- メインコンポーネント ---

export default async function PostPage({ params }: PageProps) {
  const { id: postId } = await params;
  
  // データの並列取得 (引数を修正)
  const post = await fetchPostData('post', postId);
  if (!post) notFound();

  const [postListData, { toc, processedContent }] = await Promise.all([
    fetchPostList('post', 20, 0), // 第1引数に 'post' を指定
    Promise.resolve(processContent(post.content.rendered))
  ]);

  // 1. 関連製品データの取得
  const relatedProductId = post.acf?.related_product_id || null;
  const relatedProduct = relatedProductId ? await fetchProductDetail(relatedProductId) : null;
  
  // 画像URLの解決に getWpFeaturedImage を使用
  const eyeCatchUrl = getWpFeaturedImage(post, 'large');

  // 2. 関連記事・前後ナビゲーションの算出
  const allPosts = Array.isArray(postListData?.results) ? postListData.results : [];
  const currentIndex = allPosts.findIndex((p: any) => String(p.id) === String(post.id));
  
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  const recommendedPosts = allPosts
    .filter((p: any) => String(p.id) !== String(post.id))
    .slice(0, 3);

  // 3. JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": safeDecode(post.title.rendered),
    "image": eyeCatchUrl ? [eyeCatchUrl] : [],
    "datePublished": post.date,
    "dateModified": post.modified,
    "author": [{
        "@type": "Organization",
        "name": "BICSTATION",
        "url": "https://bicstation.com"
    }]
  };

  return (
    <article className={styles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className={styles.heroSection}>
        {eyeCatchUrl && (
          <div className={styles.eyeCatchWrapper}>
            <img 
              src={eyeCatchUrl} 
              alt="" 
              className={styles.eyeCatchImage} 
              style={{ objectFit: 'cover' }}
            />
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
        {/* 目次セクション */}
        {toc.length > 0 && (
          <section className={styles.tocSection} aria-label="目次">
            <div className={styles.tocHeader}>
              <span className={styles.tocIcon}>INDEX</span>
              <h2 className={styles.tocTitle}>目次</h2>
            </div>
            <ul className={styles.tocList}>
              {toc.map((item, idx) => (
                <li key={item.id} className={`${styles.tocItem} ${item.level === 3 ? styles.tocItemH3 : ''}`}>
                  <a href={`#${item.id}`}>
                    <span className={styles.tocNumber}>{idx + 1}</span>
                    {safeDecode(item.text)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <main className={styles.mainContent}>
          {eyeCatchUrl && (
            <div className={styles.mainEyeCatch}>
              <img 
                src={eyeCatchUrl} 
                alt={safeDecode(post.title.rendered)} 
                className={styles.articleMainImage} 
                loading="eager"
              />
            </div>
          )}

          {/* 本文コンテンツ */}
          <PostLayout className={styles.wpContent}>
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          </PostLayout>

          {/* 関連製品カード */}
          {relatedProduct && (
            <section className={styles.enhancedCTA}>
              <div className={styles.ctaBadge}>PICK UP ITEM</div>
              <div className={styles.ctaContainer}>
                <div className={styles.ctaImageArea}>
                  <img 
                    src={relatedProduct.image_url || '/no-image.png'} 
                    alt={relatedProduct.name} 
                  />
                </div>
                <div className={styles.ctaInfoArea}>
                  <span className={styles.ctaMaker}>{relatedProduct.maker}</span>
                  <h3 className={styles.ctaTitle}>
                    {relatedProduct.name || "製品名データなし"}
                  </h3>
                  
                  <div className={styles.ctaSpecBox}>
                    {relatedProduct.cpu_model && <span className={styles.ctaSpecTag}>{relatedProduct.cpu_model}</span>}
                    {relatedProduct.gpu_model && <span className={styles.ctaSpecTag}>{relatedProduct.gpu_model}</span>}
                    {relatedProduct.memory_gb && <span className={styles.ctaSpecTag}>{relatedProduct.memory_gb}GB</span>}
                  </div>

                  <div className={styles.ctaPriceRow}>
                    <span className={styles.ctaPriceLabel}>市場想定価格</span>
                    <span className={styles.ctaPriceValue}>
                      ¥{Number(relatedProduct.price) > 0 
                        ? Number(relatedProduct.price).toLocaleString() 
                        : '---'}
                      <small>(税込)</small>
                    </span>
                  </div>

                  <div className={styles.ctaActionButtons}>
                    <a 
                      href={relatedProduct.affiliate_url} 
                      target="_blank" 
                      rel="nofollow noopener" 
                      className={styles.ctaShopBtn}
                    >
                      公式サイトで在庫を見る <span>➔</span>
                    </a>
                    <Link 
                      href={`/product/${relatedProduct.unique_id}`} 
                      className={styles.detailBtn} // クラス名は適宜調整
                    >
                      詳細スペックを確認
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 記事ナビゲーション: パスを /blog/ に統一 */}
          <nav className={styles.postNav} aria-label="前後記事ナビゲーション">
            {prevPost ? (
              <Link href={`/blog/${prevPost.id}`} className={styles.prevLink}>
                <span className={styles.navLabel}>← 前の記事</span>
                <span className={styles.navTitle}>{safeDecode(prevPost.title.rendered)}</span>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link href={`/blog/${nextPost.id}`} className={styles.nextLink}>
                <span className={styles.navLabel}>次の記事 →</span>
                <span className={styles.navTitle}>{safeDecode(nextPost.title.rendered)}</span>
              </Link>
            ) : <div />}
          </nav>

          {/* おすすめ記事: パスを /blog/ に統一 */}
          <section className={styles.recommendSection}>
            <h3 className={styles.recommendTitle}>💡 この記事を読んだ人におすすめ</h3>
            <div className={styles.recommendGrid}>
              {recommendedPosts.map((rPost: any) => (
                <Link key={rPost.id} href={`/blog/${rPost.id}`} className={styles.recommendCard}>
                  <div className={styles.recommendThumb}>
                    <img 
                      src={getWpFeaturedImage(rPost, 'medium')} 
                      alt="" 
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.recommendContent}>
                    <time>{formatDate(rPost.date)}</time>
                    <h4>{safeDecode(rPost.title.rendered)}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <footer className={styles.postFooter}>
            <Link href="/" className={styles.backLink}>トップへ戻る</Link>
            <p className={styles.modifiedDate}>最終更新日: {formatDate(post.modified)}</p>
          </footer>
        </main>
      </div>
    </article>
  );
}