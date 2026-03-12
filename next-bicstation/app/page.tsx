// /home/maya/shin-dev/shin-vps/next-bicstation/app/page.tsx

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const revalidate = 600;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import styles from './page.module.css';

import { fetchPostList } from '@/shared/lib/api/django-bridge';
import { fetchPCProducts, fetchPCProductRanking } from '@/shared/lib/api/django/pc';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 🏅 部門別ランキングセクション用コンポーネント
 */
function RankingCategory({ title, products, icon }: { title: string, products: any[], icon: string }) {
    if (!products || products.length === 0) return null;
    const topThree = products.slice(0, 3);

    return (
        <section className={styles.categoryRankingSection}>
            <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>
                    <span className={styles.categoryIcon}>{icon}</span>
                    {title} <span className={styles.topThreeLabel}>TOP 3</span>
                </h3>
                <div className={styles.titleLine}></div>
            </div>
            <div className={styles.rankingGrid}>
                {topThree.map((p, i) => (
                    <ProductCard 
                        key={p.unique_id || p.id} 
                        product={p} 
                        rank={i + 1} 
                    />
                ))}
            </div>
        </section>
    );
}

export default async function Page({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
        try {
            const data = await promise;
            return data ?? fallback;
        } catch (e) {
            console.error("[BICSTATION API ERROR]:", e);
            return fallback;
        }
    }

    // データの並列取得
    const [wpData, pcData, rankingData, gamingData, creatorData, mobileData] = await Promise.all([
        safeFetch(fetchPostList('post', 6), { results: [], count: 0 }), // ニュースは6件程度がグリッドで見栄えが良い
        safeFetch(fetchPCProducts({ limit: 12, attribute: attribute || '' }), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking(), []),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gaming-pc' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gpu-professional' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'size-mobile' }), { results: [] }),
    ]);

    const pcResults = pcData?.results || [];
    const wpResults = wpData?.results || [];
    const topThreeOverall = (rankingData || []).slice(0, 3);

    return (
        <article className={styles.mainContainer}>
            {/* 🚀 ヒーローセクション */}
            <header className={styles.heroHeader}>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>BICSTATION AI LAB</span>
                    <h1 className={styles.mainTitle}>
                        AIが解析する<br />
                        <span className={styles.highlight}>次世代PCスペック比較ポータル</span>
                    </h1>
                    <p className={styles.pageDescription}>
                        膨大なスペックデータと実測値をAIが独自にスコアリング。
                    </p>
                </div>
            </header>

            {/* 🏆 総合ランキング */}
            {topThreeOverall.length > 0 && (
                <section className={styles.overallSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>🏆 総合 AIスペックランキング</h2>
                        <Link href="/ranking/" className={styles.rankingLink}>ランキング一覧を見る →</Link>
                    </div>
                    <div className={styles.rankingGrid}>
                        {topThreeOverall.map((p, i) => (
                            <ProductCard 
                                key={p.unique_id || p.id} 
                                product={p} 
                                rank={i + 1} 
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 🔍 目的・スペックから探す (中略) */}
            <section className={styles.attributeSearchSection}>
                 <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🔍 目的・スペックから探す</h2>
                </div>
                <div className={styles.categoryGrid}>
                    {[
                        { name: 'ビジネス・法人向け', slug: 'usage-business', icon: '💼' },
                        { name: 'ゲーミングPC', slug: 'gaming-pc', icon: '🎮' },
                        { name: 'クリエイター向け', slug: 'gpu-professional', icon: '🎨' },
                        { name: 'AI開発・生成AI', slug: 'usage-ai-dev', icon: '🤖' },
                        { name: '軽量・1kg未満', slug: 'feat-lightweight', icon: '🪶' },
                        { name: 'モバイルノート', slug: 'size-mobile', icon: '💻' },
                    ].map((cat) => (
                        <Link key={cat.slug} href={`/catalog/?attribute=${cat.slug}`} className={styles.categoryCardSmall}>
                            <span className={styles.catIcon}>{cat.icon}</span>
                            <span className={styles.catNameSmall}>{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 🏅 部門別ランキングエリア */}
            <div className={styles.departmentArea}>
                <RankingCategory title="ゲーミングPC部門" products={gamingData.results} icon="🎮" />
                <RankingCategory title="クリエイター・プロ向け" products={creatorData.results} icon="🎨" />
                <RankingCategory title="モバイル・超軽量ノート" products={mobileData.results} icon="🏃" />
            </div>

            {/* 🚀 最新トピック (画像表示版) */}
            <section className={styles.newsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🚀 PC業界・最新トピック</h2>
                    <Link href="/news" className={styles.rankingLink}>ニュース一覧へ →</Link>
                </div>
                <div className={styles.newsGrid}>
                    {wpResults.map((post: any) => {
                        const displayTitle = (typeof post.title === 'string' ? post.title : post.title?.rendered) || 'No Title';
                        // 画像URLの取得 (Django API経由のimage または WP経由のmain_image_url)
                        const imageUrl = post.image || post.main_image_url;

                        return (
                            <Link href={`/news/${post.id}`} key={post.id} className={styles.newsCard}>
                                <div className={styles.newsImageContainer}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={displayTitle} className={styles.newsThumbnail} />
                                    ) : (
                                        <div className={styles.newsNoImage}>AI VISUALIZING...</div>
                                    )}
                                    <span className={styles.newsCategoryBadge}>
                                        {post.category || 'TECH'}
                                    </span>
                                </div>
                                <div className={styles.newsBody}>
                                    <time className={styles.postDate}>
                                        {post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}
                                    </time>
                                    <h3 className={styles.articleTitle}>
                                        {displayTitle.replace(/&nbsp;/g, ' ')}
                                    </h3>
                                    <span className={styles.newsReadMore}>READ ARTICLE</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* 📦 製品カタログ */}
            <section className={styles.productSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.productGridTitle}>最新PC製品カタログ</h2>
                    <span className={styles.countBadge}>{pcData.count || 0} 件の製品</span>
                </div>
                <div className={styles.productGrid}>
                    {pcResults.map((product: any) => (
                        <ProductCard 
                            key={product.unique_id || product.id} 
                            product={product} 
                        />
                    ))}
                </div>
                <div className={styles.viewMoreContainer}>
                    <Link href="/catalog/" className={styles.fullCatalogBtn}>
                        カタログを詳しく見る
                    </Link>
                </div>
            </section>
        </article>
    );
}