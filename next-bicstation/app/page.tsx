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
    
    async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
        try {
            const data = await promise;
            return data ?? fallback;
        } catch (e) {
            console.error("[BICSTATION API ERROR]:", e);
            return fallback;
        }
    }

    // 🏎️ 並列取得
    const [newsData, pcData, rankingData, gamingData, creatorData, mobileData] = await Promise.all([
        safeFetch(fetchPostList('news', 8), { results: [], count: 0 }), 
        safeFetch(fetchPCProducts({ limit: 12, attribute: attribute || '' }), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking(), []),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gaming-pc' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'gpu-professional' }), { results: [] }),
        safeFetch(fetchPCProducts({ limit: 3, attribute: 'size-mobile' }), { results: [] }),
    ]);

    // 🛡️ アダルト混入対策：タイトルのキーワードフィルタリング (API側が直るまでの暫定)
    const ADULT_KEYWORDS = ['セフレ', '中出し', 'アヘアヘ', 'マン']; 
    const newsResults = (newsData?.results || []).filter((post: any) => {
        const title = post.title || '';
        return !ADULT_KEYWORDS.some(keyword => title.includes(keyword));
    });

    const pcResults = pcData?.results || [];
    const topThreeOverall = (rankingData || []).slice(0, 3);

    return (
        <article className={styles.mainContainer}>
            {/* 🚀 改良版：スマート・ヒーローセクション */}
            <header className={styles.smartHero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroTextSide}>
                        <div className={styles.heroBadgeRow}>
                            <span className={styles.heroLabel}>BICSTATION v3.9</span>
                            <span className={styles.aiStatus}>● AI Engine Online</span>
                        </div>
                        <h1 className={styles.smartTitle}>
                            論理で選ぶ、<br />
                            <span className={styles.textGradient}>次世代スペック解析。</span>
                        </h1>
                        <p className={styles.smartDescription}>
                            膨大な実測値をAIが独自にスコアリング。
                            あなたのクリエイティビティを最大化する1台を、論理的に導き出します。
                        </p>
                        <div className={styles.heroActionArea}>
                            <Link href="/catalog/" className={styles.primaryBtn}>カタログを探索する</Link>
                            <Link href="/ranking/" className={styles.secondaryBtn}>最新ランキング</Link>
                        </div>
                    </div>
                    
                    <div className={styles.heroVisualSide}>
                        {/* 統計カード風のデザインパーツ */}
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Analyzed Devices</span>
                            <span className={styles.statValue}>12,480+</span>
                        </div>
                        <div className={styles.statCardSmall}>
                            <span className={styles.statLabel}>Update Rate</span>
                            <span className={styles.statValue}>Real-time</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 🏆 総合ランキング */}
            {topThreeOverall.length > 0 && (
                <section className={styles.overallSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>🏆 総合 AIスペックランキング</h2>
                        <Link href="/ranking/" className={styles.rankingLink}>もっと見る →</Link>
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

            {/* 🔍 目的から探す（アイコンをシンプル化） */}
            <section className={styles.attributeSearchSection}>
                <div className={styles.categoryGrid}>
                    {[
                        { name: 'ビジネス', slug: 'usage-business', icon: '💼' },
                        { name: 'ゲーミング', slug: 'gaming-pc', icon: '🎮' },
                        { name: 'クリエイター', slug: 'gpu-professional', icon: '🎨' },
                        { name: 'AI開発', slug: 'usage-ai-dev', icon: '🤖' },
                        { name: '1kg未満', slug: 'feat-lightweight', icon: '🪶' },
                        { name: 'モバイル', slug: 'size-mobile', icon: '💻' },
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
            </div>

            {/* 🚀 最新インテリジェンス */}
            <section className={styles.newsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🚀 PC業界・最新レポート</h2>
                    <Link href="/news" className={styles.rankingLink}>全件表示 →</Link>
                </div>
                
                <div className={styles.newsGrid}>
                    {newsResults.length > 0 ? (
                        newsResults.slice(0, 6).map((post: any) => {
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
                                    </div>
                                    <div className={styles.newsBody}>
                                        <div className={styles.newsMeta}>
                                            <time>{post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}</time>
                                        </div>
                                        <h3 className={styles.articleTitle}>{displayTitle}</h3>
                                        <span className={styles.newsReadMore}>READ MORE _</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className={styles.emptyNews}>📡 最新のデータを同期中です...</div>
                    )}
                </div>
            </section>

            {/* 📦 製品カタログ */}
            <section className={styles.productSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.productGridTitle}>最新カタログ</h2>
                    <span className={styles.countBadge}>{pcData.count || 0} 件</span>
                </div>
                <div className={styles.productGrid}>
                    {pcResults.slice(0, 8).map((product: any) => (
                        <ProductCard 
                            key={product.unique_id || product.id} 
                            product={product} 
                        />
                    ))}
                </div>
                <div className={styles.viewMoreContainer}>
                    <Link href="/catalog/" className={styles.fullCatalogBtn}>カタログ全文を見る</Link>
                </div>
            </section>
        </article>
    );
}