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
    const PRODUCT_LIMIT = 10; 

    const [wpData, pcData, makersData, rankingData, popularityData] = await Promise.all([
        fetchPostList(18),
        fetchPCProducts('', 0, PRODUCT_LIMIT, attribute || ''), 
        fetchMakers(),
        fetchPCProductRanking(),
        fetchPCPopularityRanking()
    ]);

    const topThree = rankingData.slice(0, 3);
    const trendTopThree = popularityData.slice(0, 3);
    const featuredPosts = (wpData.results || []).slice(0, 8); 
    const archivePosts = (wpData.results || []).slice(8);

    const safeDecode = (str: string) => {
        if (!str) return '';
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={(wpData.results || []).slice(0, 10).map((p: any) => ({
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

                {/* 🏆 AIスペックランキング */}
                <section className={styles.rankingSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}><span className={styles.emoji}>👑</span> AIスペックランキング</h2>
                        <Link href="/ranking/" className={styles.rankingLink}>すべて見る →</Link>
                    </div>
                    <div className={styles.topThreeGrid}>
                        {topThree.map((product, index) => (
                            <div key={product.unique_id} className={`${styles.topThreeCard} ${styles[`rank_${index + 1}`]}`}>
                                <div className={styles.rankBadge}>{index + 1}位</div>
                                <div className={styles.topThreeImage}>
                                    <img src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} alt={product.name} />
                                </div>
                                <div className={styles.topThreeContent}>
                                    <span className={styles.topThreeMaker}>{product.maker}</span>
                                    <h3 className={styles.topThreeName}>{product.name}</h3>
                                    <div className={styles.topThreeScore}>
                                        <div className={styles.scoreValue}>{product.spec_score}</div>
                                        <div className={styles.scoreLabel}>AI SCORE</div>
                                    </div>
                                    <div className={styles.chartMini}>
                                        <RadarChart data={product.radar_chart || []} color={index === 0 ? "#ecc94b" : "#a0aec0"} />
                                    </div>
                                    <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>解析詳細</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🔍 目的・形状から探す（新規追加セクション） */}
                <section className={styles.categorySearchSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔍</span> 目的・形状から探す</h2>
                    <div className={styles.categoryGrid}>
                        {[
                            { name: 'ビジネス・事務', slug: 'usage-general', img: 'https://via.placeholder.com/400x225?text=Business+PC' },
                            { name: '動画編集・クリエイティブ', slug: 'usage-creator', img: 'https://via.placeholder.com/400x225?text=Creative+PC' },
                            { name: 'ゲーミングPC', slug: 'usage-gaming', img: 'https://via.placeholder.com/400x225?text=Gaming+PC' },
                            { name: 'モバイルノート', slug: 'type-laptop', img: 'https://via.placeholder.com/400x225?text=Laptop' },
                            { name: 'デスクトップ', slug: 'type-desktop', img: 'https://via.placeholder.com/400x225?text=Desktop' },
                            { name: 'ミニPC', slug: 'type-mini-pc', img: 'https://via.placeholder.com/400x225?text=Mini+PC' },
                            { name: 'タブレットPC', slug: 'type-tablet', img: 'https://via.placeholder.com/400x225?text=Mini+PC' },
                            { name: 'ワークステーション', slug: 'type-workstation', img: 'https://via.placeholder.com/400x225?text=Mini+PC' },
                        ].map((cat) => (
                            <Link key={cat.slug} href={`/catalog?attribute=${cat.slug}`} className={styles.categoryCard}>
                                <div className={styles.categoryImageWrapper}>
                                    <img src={cat.img} alt={cat.name} className={styles.categoryImage} />
                                    <div className={styles.categoryOverlay}><span className={styles.categoryName}>{cat.name}</span></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 🔥 注目度ランキング */}
                <section className={`${styles.rankingSection} ${styles.popularityBg}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔥</span> 注目度ランキング</h2>
                        <Link href="/ranking/popularity/" className={styles.rankingLink}>すべて見る →</Link>
                    </div>
                    <div className={styles.topThreeGrid}>
                        {trendTopThree.map((product, index) => (
                            <div key={`trend-${product.unique_id}`} className={`${styles.topThreeCard} ${styles.trendCard}`}>
                                <div className={`${styles.rankBadge} ${styles.trendBadge}`}>{index + 1}位</div>
                                <div className={styles.topThreeImage}>
                                    <img src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} alt={product.name} />
                                </div>
                                <div className={styles.topThreeContent}>
                                    <span className={styles.topThreeMaker}>{product.maker}</span>
                                    <h3 className={styles.topThreeName}>{product.name}</h3>
                                    <div className={styles.trendingInfo}>
                                        <span className={styles.trendLabel}>注目！</span>
                                        <div className={styles.trendPrice}>{product.price ? `¥${product.price.toLocaleString()}` : "価格情報なし"}</div>
                                    </div>
                                    <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>詳細を見る</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🚀 記事セクション */}
                <section className={styles.newsSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🚀</span> 注目のPCトピック</h2>
                    <div className={styles.newsGrid}>
                        {featuredPosts.map((post: any) => (
                            <Link href={`/bicstation/${post.slug}`} key={post.id} className={styles.newsCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url?.replace('http://', 'https://') || '/no-image.png'} alt={safeDecode(post.title.rendered)} className={styles.eyecatch} loading="lazy" />
                                </div>
                                <div className={styles.contentBody}>
                                    <span className={styles.postDate}>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
                                    <h3 className={styles.articleTitle}>{safeDecode(post.title.rendered)}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 📦 製品カタログ */}
                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}><span className={styles.titleIndicator}></span>最新PCカタログ</h2>
                    <div className={styles.productGrid}>
                        {pcData.results.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
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