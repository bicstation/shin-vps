/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@shared/blog/PostHeader';
import PostLayout from '@shared/layout/PostLayout'; // ✅ 先ほど作成した共通レイアウト
import { COLORS } from '@/constants';
import { fetchPostData, fetchProductDetail, fetchPostList } from '@shared/lib/api';
import Link from 'next/link';
import styles from './PostPage.module.css';

// --- ユーティリティ ---

/**
 * HTMLエンティティをデコードする
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
 * 日本語の日付形式に変換
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * 本文から目次を抽出・加工
 */
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

// --- SEO・メタデータ (Next.js 15 Async Params) ---

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const post = await fetchPostData(id);
  if (!post) return { title: "記事が見つかりません" };

  const title = `${safeDecode(post.title.rendered)} | BICSTATION`;
  const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

  return {
    title,
    openGraph: {
      title,
      description: post.excerpt?.rendered.replace(/<[^>]*>/g, '').slice(0, 120),
      images: eyeCatchUrl ? [eyeCatchUrl] : [],
    }
  };
}

// --- メインコンポーネント ---

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id: postId } = await props.params;
  const post = await fetchPostData(postId);
  
  if (!post) notFound();

  // 1. 本文加工と製品データの取得
  const { toc, processedContent } = processContent(post.content.rendered);
  const relatedProductId = post.acf?.related_product_id || null;
  const relatedProduct = relatedProductId ? await fetchProductDetail(relatedProductId) : null;
  const eyeCatchUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

  // 2. 関連記事・前後記事の取得 (fetchPostList の構造 { results: [] } に準拠)
  const postListData = await fetchPostList(10, 0);
  const allPosts = Array.isArray(postListData?.results) ? postListData.results : [];
  
  const currentIndex = allPosts.findIndex((p: any) => String(p.id) === String(post.id));
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  const recommendedPosts = allPosts
    .filter((p: any) => p.id !== post.id)
    .slice(0, 3);

  return (
    <article className={styles.article}>
      {/* Hero Section: アイキャッチ背景 */}
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
        {/* 目次セクション */}
        {toc.length > 0 && (
          <section className={styles.tocSection}>
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
          {/* 本文冒頭のアイキャッチ */}
          {eyeCatchUrl && (
            <div className={styles.mainEyeCatch}>
              <img 
                src={eyeCatchUrl} 
                alt={safeDecode(post.title.rendered)} 
                className={styles.articleMainImage} 
              />
            </div>
          )}

          {/* ✅ 修正ポイント: PostLayout を適用して CSS 変数でスタイルを制御 */}
          <PostLayout className={styles.wpContent}>
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          </PostLayout>

          {/* 商品紹介カード (Django 連携 CTA) */}
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
                      className={styles.ctaDetailBtn}
                    >
                      詳細スペックを確認
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 前後の記事ナビゲーション */}
          <nav className={styles.postNav}>
            {prevPost ? (
              <Link href={`/news/${prevPost.id}`} className={styles.prevLink}>
                <span className={styles.navLabel}>← 前の記事</span>
                <span className={styles.navTitle}>{safeDecode(prevPost.title.rendered)}</span>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link href={`/news/${nextPost.id}`} className={styles.nextLink}>
                <span className={styles.navLabel}>次の記事 →</span>
                <span className={styles.navTitle}>{safeDecode(nextPost.title.rendered)}</span>
              </Link>
            ) : <div />}
          </nav>

          {/* おすすめ記事 */}
          <section className={styles.recommendSection}>
            <h3 className={styles.recommendTitle}>💡 この記事を読んだ人におすすめ</h3>
            <div className={styles.recommendGrid}>
              {recommendedPosts.map((rPost: any) => (
                <Link key={rPost.id} href={`/news/${rPost.id}`} className={styles.recommendCard}>
                  <div className={styles.recommendThumb}>
                    <img 
                      src={rPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/no-image.png'} 
                      alt="" 
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
            <Link href="/" className={styles.backLink}>記事一覧へ戻る</Link>
            <p className={styles.modifiedDate}>最終更新日: {formatDate(post.modified)}</p>
          </footer>
        </main>
      </div>
    </article>
  );
}