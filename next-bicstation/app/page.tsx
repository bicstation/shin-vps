/* /app/page.tsx (BICSTATION) */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const revalidate = 600;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import SafeImage from '@/shared/components/atoms/SafeImage';
import styles from './page.module.css';

// APIブリッジ
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
    
    // 安全なデータ取得用ラッパー
    async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
        try {
            const data = await promise;
            return data ?? fallback;
        } catch (e) {
            console.error("[BICSTATION API ERROR]:", e);
            return fallback;
        }
    }

    // 🏎️ 全データの並列取得 (ハイブリッドニュース + PC製品各種)
    const [newsData, pcData, rankingData, gamingData, creatorData, mobileData] = await Promise.all([
        safeFetch(fetchPostList('news', 6), { results: [], count: 0 }), 
        safeFetch(fetchPCProducts({ limit: 12, attribute: attribute || '' }), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking(), []),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gaming-pc' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gpu-professional' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'size-mobile' }), { results: [] }),
    ]);

    const pcResults = pcData?.results || [];
    const newsResults = newsData?.results || [];
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
                        あなたのクリエイティビティを最大化する1台を、論理的に導き出します。
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

            {/* 🔍 目的・スペックから探す */}
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

            {/* 🚀 最新インテリジェンス (Django AIニュース) */}
            <section className={styles.newsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.titleIcon}>🚀</span> PC業界・最新インテリジェンス
                    </h2>
                    <Link href="/news" className={styles.rankingLink}>全レポートを閲覧する →</Link>
                </div>
                
                <div className={styles.newsGrid}>
                    {newsResults.length > 0 ? (
                        newsResults.map((post: any) => {
                            const identifier = post.slug || post.id;
                            const displayTitle = post.title || 'Untitled Report';
                            const imageUrl = post.image || post.main_image_url;

                            return (
                                <Link href={`/news/${identifier}`} key={identifier} className={styles.newsCard}>
                                    <div className={styles.newsImageContainer}>
                                        <SafeImage 
                                            src={imageUrl} 
                                            alt={displayTitle} 
                                            className={styles.newsThumbnail}
                                            fallback="/no-image.jpg"
                                        />
                                        <div className={styles.newsCategoryBadge}>
                                            {post.category || 'ANALYSIS'}
                                        </div>
                                    </div>
                                    <div className={styles.newsBody}>
                                        <div className={styles.newsMeta}>
                                            <time className={styles.postDate}>
                                                {post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}
                                            </time>
                                            {post.site && <span className={styles.newsSource}>{post.site}</span>}
                                        </div>
                                        <h3 className={styles.articleTitle}>
                                            {displayTitle}
                                        </h3>
                                        <p className={styles.newsExcerpt}>
                                            {post.description || (post.body_text ? post.body_text.substring(0, 60).replace(/[#*]/g, '') : '最新のデバイス動向と市場分析レポートをチェック。')}...
                                        </p>
                                        <span className={styles.newsReadMore}>VIEW REPORT _</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className={styles.emptyNews}>
                            📡 ネットワークから最新のインテリジェンスを同期中です...
                        </div>
                    )}
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