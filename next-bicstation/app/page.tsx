/* eslint-disable react/no-unescaped-entities */

/**
 * ✅ 爆速の鍵: ISR (Incremental Static Regeneration)
 * 1時間（3600秒）ごとにバックグラウンドで再生成。
 * ユーザーには常に生成済みの超軽量HTMLが返るため、0.62sという速度が実現します。
 */
export const revalidate = 3600; 

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

    /**
     * 🚀 APIリクエストの並列化 (Parallel Data Fetching)
     */
    const [wpData, pcData, makersData, rankingData, popularityData] = await Promise.all([
        fetchPostList(10).catch(() => ({ results: [], count: 0 })),
        fetchPCProducts('', 0, PRODUCT_LIMIT, attribute || '').catch(() => ({ results: [], count: 0 })),
        fetchMakers().catch(() => []),
        fetchPCProductRanking().catch(() => []),
        fetchPCPopularityRanking().catch(() => [])
    ]);

    const pcResults = pcData?.results || [];
    const wpResults = wpData?.results || [];
    const topThree = (rankingData || []).slice(0, 3);
    const trendTopThree = (popularityData || []).slice(0, 3);
    const featuredPosts = wpResults.slice(0, 8);

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

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar
                    activeMenu="all"
                    makers={makersData || []}
                    recentPosts={wpResults.slice(0, 10).map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title?.rendered || ''),
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
                {topThree.length > 0 && (
                    <section className={styles.rankingSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}><span className={styles.emoji}>👑</span> AIスペックランキング</h2>
                            <Link href="/ranking/" className={styles.rankingLink}>すべて見る →</Link>
                        </div>
                        <div className={styles.topThreeGrid}>
                            {topThree.map((product, index) => (
                                <div key={product.unique_id || index} className={`${styles.topThreeCard} ${styles[`rank_${index + 1}`]}`}>
                                    <div className={styles.rankBadge}>{index + 1}位</div>
                                    <div className={styles.topThreeImage}>
                                        <Image 
                                            src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} 
                                            alt={product.name || 'PC製品'} 
                                            fill
                                            priority={index === 0} 
                                            unoptimized={true}
                                            className={styles.rankingImgTag}
                                        />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <div className={styles.topThreeNameArea}>
                                            <span className={styles.topThreeMaker}>{product.maker}</span>
                                            <h3 className={styles.topThreeName}>{product.name}</h3>
                                        </div>
                                        <div className={styles.topThreeScore}>
                                            <div className={styles.scoreValue}>{product.spec_score || 0}</div>
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
                )}

                {/* 🔍 カテゴリー・スペック検索 */}
                <section className={styles.categorySearchSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔍</span> 目的・スペックから探す</h2>
                    <div className={styles.searchGroup}>
                        <h3 className={styles.groupLabel}>用途・スタイル</h3>
                        <div className={styles.categoryGrid}>
                            {[
                                { name: 'ビジネス・法人向け', slug: 'usage-business', icon: '💼' },
                                { name: 'ゲーミングPC', slug: 'usage-gaming', icon: '🎮' },
                                { name: 'クリエイター向け', slug: 'usage-creator', icon: '🎨' },
                                { name: 'AI開発・生成AI', slug: 'usage-ai-dev', icon: '🤖' },
                                { name: '軽量・1kg未満', slug: 'feat-lightweight', icon: '🪶' },
                                { name: 'モバイルノート', slug: 'size-mobile', icon: '💻' },
                            ].map((cat) => (
                                <Link key={cat.slug} href={`/pc-products/?attribute=${cat.slug}`} className={styles.categoryCardSmall}>
                                    <span className={styles.catIcon}>{cat.icon}</span>
                                    <span className={styles.catNameSmall}>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={styles.searchGroup}>
                        <h3 className={styles.groupLabel}>最新AIプロセッサ</h3>
                        <div className={styles.tagCloud}>
                            {[
                                { name: 'Core Ultra 9', slug: 'intel-core-ultra-9' },
                                { name: 'Core Ultra 7', slug: 'intel-core-ultra-7' },
                                { name: 'Ryzen AI 300', slug: 'amd-ryzen-ai-300' },
                                { name: 'Snapdragon X', slug: 'arm-snapdragon-x' },
                                { name: 'Copilot+ PC', slug: 'feature-copilot-plus' },
                            ].map((tag) => (
                                <Link key={tag.slug} href={`/pc-products/?attribute=${tag.slug}`} className={styles.specTag}>
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 🔥 注目度ランキング (背景色あり) */}
                {trendTopThree.length > 0 && (
                    <section className={`${styles.rankingSection} ${styles.popularityBg}`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔥</span> 注目度ランキング</h2>
                            <Link href="/ranking/popularity/" className={styles.rankingLink}>すべて見る →</Link>
                        </div>
                        <div className={styles.topThreeGrid}>
                            {trendTopThree.map((product, index) => (
                                <div key={`trend-${product.unique_id || index}`} className={`${styles.topThreeCard} ${styles.trendCard}`}>
                                    <div className={`${styles.rankBadge} ${styles.trendBadge}`}>{index + 1}位</div>
                                    <div className={styles.topThreeImage}>
                                        <Image 
                                            src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} 
                                            alt={product.name || 'PC製品'} 
                                            fill
                                            unoptimized={true}
                                            className={styles.rankingImgTag}
                                        />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <div className={styles.topThreeNameArea}>
                                            <span className={styles.topThreeMaker}>{product.maker}</span>
                                            <h3 className={styles.topThreeName}>{product.name}</h3>
                                        </div>
                                        <div className={styles.trendingInfo}>
                                            <span className={styles.trendLabel}>注目！</span>
                                            <div className={styles.trendPrice}>
                                                {product.price ? `¥${product.price.toLocaleString()}` : "価格情報なし"}
                                            </div>
                                        </div>
                                        <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>詳細を見る</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 🚀 記事セクション */}
                <section className={styles.newsSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🚀</span> 注目のPCトピック</h2>
                    <div className={styles.newsGrid}>
                        {featuredPosts.map((post: any) => (
                            <Link href={`/bicstation/${post.slug}`} key={post.id} className={styles.newsCard}>
                                <div className={styles.imageWrapper}>
                                    <Image 
                                        src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url?.replace('http://', 'https://') || '/no-image.png'} 
                                        alt={safeDecode(post.title?.rendered || '')} 
                                        fill
                                        unoptimized={true}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.contentBody}>
                                    <span className={styles.postDate}>{post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}</span>
                                    <h3 className={styles.articleTitle}>{safeDecode(post.title?.rendered || '')}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 📦 製品カタログ */}
                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}><span className={styles.titleIndicator}></span>最新PCカタログ</h2>
                    <div className={styles.productGrid}>
                        {pcResults.length > 0 ? (
                            pcResults.map((product: any) => (
                                <ProductCard key={product.id || product.unique_id} product={product} />
                            ))
                        ) : (
                            <p>製品データが見つかりませんでした。</p>
                        )}
                    </div>
                    <div className={styles.viewMoreContainer}>
                        <Link href="/catalog/" className={styles.catalogFullLink}>
                            すべての製品カタログを表示する ({pcData?.count || 0}件)
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}