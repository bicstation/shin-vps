/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import RadarChart from '@/components/RadarChart'; 
import ProductCard from '@/components/product/ProductCard';
import { 
    fetchPostList, 
    fetchPCProducts, 
    fetchMakers, 
    fetchPCProductRanking,
    fetchPCPopularityRanking 
} from '@/lib/api'; 
import styles from './MainPage.module.css';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    // 💡 トップページ用に表示件数を絞る
    const PRODUCT_LIMIT = 10; 

    // データの並列取得
    const [wpData, pcData, makersData, rankingData, popularityData] = await Promise.all([
        fetchPostList(18), // 記事は多めに取得して分配
        fetchPCProducts('', 0, PRODUCT_LIMIT, attribute || ''), 
        fetchMakers(),
        fetchPCProductRanking(),
        fetchPCPopularityRanking()
    ]);

    const topThree = rankingData.slice(0, 3);
    const trendTopThree = popularityData.slice(0, 3);
    
    const allPosts = wpData.results || [];
    const featuredPosts = allPosts.slice(0, 8); 
    const archivePosts = allPosts.slice(6);

    const safeDecode = (str: string) => {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={allPosts.slice(0, 10).map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.mainTitle}>
                        BICSTATION <span className={styles.subTitle}>PCスペック比較・最安価格カタログ</span>
                    </h1>
                </header>

                {/* 🏆 AIスペックランキングセクション */}
                <section className={styles.rankingSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.emoji}>👑</span> AIスペックランキング TOP 3
                        </h2>
                        <Link href="/ranking/" className={styles.rankingLink}>すべて見る →</Link>
                    </div>
                    
                    <div className={styles.topThreeGrid}>
                        {topThree.map((product, index) => {
                            const rank = index + 1;
                            const chartColor = rank === 1 ? "#ecc94b" : rank === 2 ? "#a0aec0" : "#ed8936";
                            return (
                                <div key={product.unique_id} className={`${styles.topThreeCard} ${styles[`rank_${rank}`]}`}>
                                    <div className={styles.rankBadge}>{rank}位</div>
                                    <div className={styles.topThreeImage}>
                                        <img src={product.image_url || '/no-image.png'} alt={product.name} />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <div className={styles.productBaseInfo}>
                                            <span className={styles.topThreeMaker}>{product.maker}</span>
                                            <h3 className={styles.topThreeName}>{product.name}</h3>
                                        </div>
                                        <div className={styles.topThreeScore}>
                                            <div className={styles.scoreValue}>{product.spec_score}</div>
                                            <div className={styles.scoreLabel}>AI SCORE</div>
                                        </div>
                                        <div className={styles.chartMini}>
                                            <RadarChart data={product.radar_chart || []} color={chartColor} />
                                        </div>
                                        <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>
                                            解析詳細
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 🔥 注目度ランキングセクション */}
                <section className={`${styles.rankingSection} ${styles.popularityBg}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.emoji}>🔥</span> 注目度ランキング TOP 3
                        </h2>
                        <Link href="/ranking/popularity/" className={styles.rankingLink}>すべて見る →</Link>
                    </div>
                    
                    <div className={styles.topThreeGrid}>
                        {trendTopThree.map((product, index) => {
                            const rank = index + 1;
                            return (
                                <div key={`trend-${product.unique_id}`} className={`${styles.topThreeCard} ${styles.trendCard}`}>
                                    <div className={`${styles.rankBadge} ${styles.trendBadge}`}>{rank}位</div>
                                    <div className={styles.topThreeImage}>
                                        <img src={product.image_url || '/no-image.png'} alt={product.name} />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <div className={styles.productBaseInfo}>
                                            <span className={styles.topThreeMaker}>{product.maker}</span>
                                            <h3 className={styles.topThreeName}>{product.name}</h3>
                                        </div>
                                        <div className={styles.trendingInfo}>
                                            <span className={styles.trendLabel}>今売れてます！</span>
                                            <div className={styles.trendPrice}>
                                                {product.price ? `¥${product.price.toLocaleString()}` : "価格情報なし"}
                                            </div>
                                        </div>
                                        <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>
                                            詳細を見る
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 🚀 注目のPCトピック */}
                <section className={styles.newsSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.emoji}>🚀</span> 注目のPCトピック
                    </h2>
                    <div className={styles.newsGrid}>
                        {featuredPosts.length > 0 ? (
                            featuredPosts.map((post: any) => {
                                const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/no-image.png';
                                return (
                                    <Link href={`/bicstation/${post.slug}`} key={post.id} className={styles.newsCard}>
                                        <div className={styles.imageWrapper}>
                                            <img src={imageUrl} alt={safeDecode(post.title.rendered)} className={styles.eyecatch} loading="lazy" />
                                        </div>
                                        <div className={styles.contentBody}>
                                            <span className={styles.postDate}>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                                            <h3 className={styles.articleTitle}>{safeDecode(post.title.rendered)}</h3>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p>新着記事はありません。</p>
                        )}
                    </div>
                </section>

                {/* 📝 以前の記事アーカイブ */}
                {archivePosts.length > 0 && (
                    <section className={styles.archiveSection}>
                        <h2 className={styles.sectionTitleSmall}>
                            <span className={styles.emoji}>📝</span> 以前の記事を読む
                        </h2>
                        <ul className={styles.archiveList}>
                            {archivePosts.map((post: any) => (
                                <li key={post.id} className={styles.archiveItem}>
                                    <span className={styles.archiveDate}>{new Date(post.date).toLocaleDateString('ja-JP').replace(/\//g, '.')}</span>
                                    <Link href={`/bicstation/${post.slug}`} className={styles.archiveLink}>
                                        {safeDecode(post.title.rendered)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.archiveFooter}>
                            <Link href="/bicstation" className={styles.viewAllButton}>すべての記事一覧へ</Link>
                        </div>
                    </section>
                )}

                {/* 📦 新着製品カタログ（厳選表示） */}
                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        最新PCカタログ
                    </h2>
                    <div className={styles.productGrid}>
                        {pcData.results.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    
                    {/* 🚀 カタログ全件ページへの導線を強化 */}
                    <div className={styles.viewMoreContainer}>
                        <Link href="/catalog/" className={styles.catalogFullLink}>
                            すべての製品カタログを表示する ({pcData.count}件)
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}