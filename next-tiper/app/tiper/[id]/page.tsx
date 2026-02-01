/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdultProducts } from '@shared/lib/api'; 
import ProductCard from '@shared/components/cards/AdultProductCard';
import styles from './page.module.css';

/**
 * 💡 個別記事データ取得
 */
async function fetchPostData(postSlug: string) {
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/tiper?slug=${postSlug}&_embed&per_page=1&_t=${Date.now()}`; 
    try {
        const res = await fetch(WP_API_URL, {
            headers: { 'Host': 'localhost:8083', 'Accept': 'application/json' },
            next: { revalidate: 60 } // 60秒キャッシュ
        });
        if (!res.ok) return null;
        const data = await res.json();
        return (Array.isArray(data) && data.length > 0) ? data[0] : null;
    } catch (error) { return null; }
}

/**
 * 💡 サイドバー用：同じカテゴリーの人気・最新記事を取得
 */
async function fetchRelatedCategoryPosts(categories: number[], excludeId: number) {
    const categoryQuery = categories && categories.length > 0 ? `&categories=${categories.join(',')}` : '';
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/tiper?_embed&per_page=5&exclude=${excludeId}${categoryQuery}`;
    
    try {
        const res = await fetch(WP_API_URL, {
            headers: { 'Host': 'localhost:8083' },
            next: { revalidate: 300 }
        });
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

/**
 * 💡 前後の記事を取得
 */
async function fetchNeighborPosts(currentDate: string) {
    const headers = { 'Host': 'localhost:8083', 'Accept': 'application/json' };
    const nextUrl = `http://nginx-wp-v2/wp-json/wp/v2/tiper?after=${currentDate}&order=asc&per_page=1`;
    const prevUrl = `http://nginx-wp-v2/wp-json/wp/v2/tiper?before=${currentDate}&order=desc&per_page=1`;

    try {
        const [nextRes, prevRes] = await Promise.all([
            fetch(nextUrl, { headers }),
            fetch(prevUrl, { headers })
        ]);
        const [nextData, prevData] = await Promise.all([
            nextRes.ok ? nextRes.json() : [],
            prevRes.ok ? prevRes.json() : []
        ]);
        return { next: nextData[0] || null, prev: prevData[0] || null };
    } catch { return { next: null, prev: null }; }
}

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (m) => map[m] || m);
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const postSlug = decodeURIComponent(id);
    const post = await fetchPostData(postSlug);
    if (!post) notFound();

    const categoryIds = post.categories || [];
    
    // 💡 データの並列フェッチ
    const [neighbors, relatedPosts, productData] = await Promise.all([
        fetchNeighborPosts(post.date),
        fetchRelatedCategoryPosts(categoryIds, post.id),
        getAdultProducts({ limit: 4 })
    ]);

    const postTitle = decodeHtml(post.title.rendered);
    const featuredImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || "MAGAZINE";

    return (
        <div className={styles.container}>
            
            <header className={styles.header}>
                <div className={styles.decoration} />
                <div className={styles.headerContent}>
                    <Link href="/tiper" className={styles.backLink}>
                        <span>«</span> BACK TO MAGAZINE
                    </Link>
                    <div className={styles.categoryBadge}>{categoryName}</div>
                    <h1 className={styles.title}>{postTitle}</h1>
                    <div className={styles.metaInfo}>
                        <div className={styles.author}>
                            <img src={post._embedded?.author?.[0]?.avatar_urls?.['48'] || ''} className={styles.authorAvatar} alt="" />
                            <span>{post._embedded?.author?.[0]?.name || 'Admin'}</span>
                        </div>
                        <div className={styles.divider} />
                        <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                    </div>
                </div>
            </header>

            {featuredImageUrl && (
                <div className={styles.featuredImageWrapper}>
                    <div className={styles.featuredImage}>
                        <img src={featuredImageUrl} alt={postTitle} />
                    </div>
                </div>
            )}

            <div className={styles.mainLayout}>
                <article>
                    <div 
                        className={styles.tiperBody} 
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                    />

                    <nav className={styles.postNavigation}>
                        {neighbors.prev ? (
                            <Link href={`/tiper/${neighbors.prev.slug}`} className={styles.navCard}>
                                <span className={styles.navLabel}>PREVIOUS ARTICLE</span>
                                <span className={styles.navTitle}>{decodeHtml(neighbors.prev.title.rendered)}</span>
                            </Link>
                        ) : <div />}
                        {neighbors.next ? (
                            <Link href={`/tiper/${neighbors.next.slug}`} className={`${styles.navCard} ${styles.navNext}`}>
                                <span className={styles.navLabel}>NEXT ARTICLE</span>
                                <span className={styles.navTitle}>{decodeHtml(neighbors.next.title.rendered)}</span>
                            </Link>
                        ) : <div />}
                    </nav>
                </article>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <h3 className={styles.sidebarTitle}>
                            RELATED <small>in {categoryName}</small>
                        </h3>
                        <div className={styles.latestList}>
                            {relatedPosts.map((rp) => (
                                <div key={rp.id} className={styles.latestItem}>
                                    <Link href={`/tiper/${rp.slug}`} className={styles.latestLink}>
                                        <span className={styles.sidebarCategoryBadge}>
                                            {rp._embedded?.['wp:term']?.[0]?.[0]?.name}
                                        </span>
                                        <span className={styles.latestText}>{decodeHtml(rp.title.rendered)}</span>
                                        <span className={styles.latestDate}>{new Date(rp.date).toLocaleDateString('ja-JP')}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sidebarWidget}>
                        <h3 className="text-[11px] font-black tracking-widest text-white mb-6 border-l-2 border-[#00d1b2] pl-3">SHARE</h3>
                        <div className="flex gap-2">
                            {['X', 'FB', 'LINE'].map(sns => (
                                <button key={sns} className="flex-1 py-3 bg-[#1f1f3a] border border-[#333] rounded-lg text-[10px] font-black hover:border-[#00d1b2] hover:text-[#00d1b2] transition-all">
                                    {sns}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* 関連商品セクション */}
            {productData?.results?.length > 0 && (
                <section className={styles.relatedSection}>
                    <div className={styles.relatedContainer}>
                        <div className={styles.relatedHeader}>
                            <div>
                                <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Recommended</h2>
                                <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">For readers of this article</p>
                            </div>
                            <Link href="/products" className="text-[#00d1b2] text-[10px] font-black tracking-[0.2em] no-underline hover:underline">
                                VIEW ALL VIDEOS →
                            </Link>
                        </div>
                        <div className={styles.relatedGrid}>
                            {productData.results.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}