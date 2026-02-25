/* /app/blog/[id]/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-danger */

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

// 共通ライブラリのインポート
import { getUnifiedProducts } from '@shared/lib/api/django/adult'; 
import { fetchPostData as fetchWpPost, fetchPostList } from '@shared/lib/api/wordpress';
import { getWpConfig } from '@shared/lib/api/config';
import ProductCard from '@shared/cards/AdultProductCard';
import { constructMetadata } from '@shared/lib/metadata';

// CSSモジュール
import styles from './page.module.css';

/**
 * 💡 SEO: メタデータの動的生成
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { siteKey } = getWpConfig();
    const post = await fetchWpPost(siteKey, id);

    if (!post) return constructMetadata("Post Not Found", "");

    const title = decodeHtml(post.title.rendered);
    const description = post.excerpt?.rendered.replace(/<[^>]*>/g, '').slice(0, 120) || "";
    const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // 💡 URLを /blog/${id} に修正
    return constructMetadata(title, description, image, `/blog/${id}`);
}

/**
 * 💡 ユーティリティ: HTMLデコード
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (m) => map[m] || m);
};

/**
 * 💡 メインコンポーネント: ブログ詳細記事
 */
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { siteKey } = getWpConfig();
    
    // 1. 記事本体の取得
    const post = await fetchWpPost(siteKey, id);
    if (!post) notFound();

    const postTitle = decodeHtml(post.title.rendered);
    const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || "MAGAZINE";
    const featuredImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // 2. 関連データの取得 (統一API getUnifiedProducts を使用)
    const [relatedPosts, productData] = await Promise.all([
        fetchPostList(siteKey, 6, 0).catch(() => ({ results: [] })), 
        getUnifiedProducts({ limit: 4 }).catch(() => ({ results: [] }))
    ]);

    // JSON-LD 構造化データ
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": postTitle,
        "image": featuredImageUrl,
        "datePublished": post.date,
        "author": {
            "@type": "Person",
            "name": post._embedded?.author?.[0]?.name || 'Admin'
        }
    };

    return (
        <div className={styles.container}>
            {/* 構造化データ */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <header className={styles.header}>
                <div className={styles.decoration} />
                <div className={styles.headerContent}>
                    {/* パンくず/戻るリンクを /blog に修正 */}
                    <Link href="/blog" className={styles.backLink}>
                        <span>«</span> BLOG INDEX
                    </Link>
                    <div className={styles.categoryBadge}>{categoryName}</div>
                    <h1 className={styles.title}>{postTitle}</h1>
                    <div className={styles.metaInfo}>
                        <div className={styles.author}>
                            <img 
                                src={post._embedded?.author?.[0]?.avatar_urls?.['48'] || '/shared/assets/default-avatar.png'} 
                                className={styles.authorAvatar} 
                                alt="" 
                            />
                            <span>{post._embedded?.author?.[0]?.name || 'Admin'}</span>
                        </div>
                        <div className={styles.divider} />
                        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('ja-JP')}</time>
                    </div>
                </div>
            </header>

            {featuredImageUrl && (
                <div className={styles.featuredImageWrapper}>
                    <div className={styles.featuredImage}>
                        <img src={featuredImageUrl} alt={postTitle} loading="eager" />
                    </div>
                </div>
            )}

            <div className={styles.mainLayout}>
                <article className={styles.article}>
                    <div 
                        className={styles.tiperBody} 
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                    />

                    {/* シェアボタンセクション */}
                    <div className="mt-12 p-8 border-t border-white/5 bg-[#16162d] rounded-2xl">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-[#e94560] mb-6 uppercase text-center">Share this article</h3>
                        <div className="flex gap-4 max-w-xs mx-auto">
                            {['X', 'LINE', 'FB'].map(sns => (
                                <button key={sns} className="flex-1 py-3 bg-[#0a0a14] border border-white/10 rounded-xl text-xs font-bold hover:border-[#e94560] transition-all">
                                    {sns}
                                </button>
                            ))}
                        </div>
                    </div>
                </article>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <h3 className={styles.sidebarTitle}>
                            LATEST <small className="text-[#e94560]">POSTS</small>
                        </h3>
                        <div className={styles.latestList}>
                            {/* 💡 リンク先を /blog/[id] に修正 */}
                            {relatedPosts.results.filter((p: any) => p.id !== post.id).slice(0, 5).map((rp: any) => (
                                <div key={rp.id} className={styles.latestItem}>
                                    <Link href={`/blog/${rp.id}`} className={styles.latestLink}>
                                        <span className={styles.latestText}>{decodeHtml(rp.title.rendered)}</span>
                                        <span className={styles.latestDate}>{new Date(rp.date).toLocaleDateString('ja-JP')}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sticky top-8">
                        <div className="p-6 bg-gradient-to-br from-[#1f1f3a] to-[#0a0a14] rounded-2xl border border-white/5 text-center">
                            <p className="text-[#e94560] text-[10px] font-black tracking-widest uppercase mb-2">Platform</p>
                            <h4 className="text-white font-bold text-sm mb-4">TIPER ANALYTICS</h4>
                            <div className="h-[1px] bg-white/10 w-12 mx-auto" />
                        </div>
                    </div>
                </aside>
            </div>

            {/* ✅ おすすめ商品セクション (共通 ProductCard) */}
            {productData?.results?.length > 0 && (
                <section className={styles.relatedSection}>
                    <div className={styles.relatedContainer}>
                        <div className={styles.relatedHeader}>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-1 uppercase italic tracking-tighter">Recommended Items</h2>
                                <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">Handpicked for you</p>
                            </div>
                            <Link href="/brand/fanza" className="text-[#e94560] text-[10px] font-black tracking-widest no-underline border-b border-[#e94560]">
                                VIEW ARCHIVE
                            </Link>
                        </div>
                        <div className={styles.relatedGrid}>
                            {productData.results.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}