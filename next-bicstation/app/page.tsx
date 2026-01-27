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

    /**
     * 🚀 高速化の鍵: Promise.all の各リクエストにデフォルト値を設定
     * これにより、どれか一つのAPIが遅くても、タイムアウト時に空データで表示を開始できます。
     */
    const [wpData, pcData, makersData, rankingData, popularityData] = await Promise.all([
        fetchPostList(18).catch(() => ({ results: [], count: 0 })),
        fetchPCProducts('', 0, PRODUCT_LIMIT, attribute || '').catch(() => ({ results: [], count: 0 })),
        fetchMakers().catch(() => []),
        // ランキングはTOPでは3位までしか使わないため、API側が対応していれば件数を絞るのがベスト
        fetchPCProductRanking().catch(() => []),
        fetchPCPopularityRanking().catch(() => [])
    ]);

    // データの安全な抽出
    const pcResults = pcData?.results || [];
    const wpResults = wpData?.results || [];
    const topThree = (rankingData || []).slice(0, 3);
    const trendTopThree = (popularityData || []).slice(0, 3);
    const featuredPosts = wpResults.slice(0, 8);
    const archivePosts = wpResults.slice(8);

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
                                        <img 
                                            src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} 
                                            alt={product.name || 'PC製品'} 
                                        />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <span className={styles.topThreeMaker}>{product.maker}</span>
                                        <h3 className={styles.topThreeName}>{product.name}</h3>
                                        <div className={styles.topThreeScore}>
                                            <div className={styles.scoreValue}>{product.spec_score || 0}</div>
                                            <div className={styles.scoreLabel}>AI SCORE</div>
                                        </div>
                                        <div className={styles.chartMini}>
                                            {/* データが空の場合でもRadarChartが壊れないようにガード */}
                                            <RadarChart data={product.radar_chart || []} color={index === 0 ? "#ecc94b" : "#a0aec0"} />
                                        </div>
                                        <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>解析詳細</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 🔍 目的・スペック・形状から探す */}
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
                        <h3 className={styles.groupLabel}>最新プロセッサ・AI機能</h3>
                        <div className={styles.tagCloud}>
                            {[
                                { name: 'Core Ultra 9', slug: 'intel-core-ultra-9' },
                                { name: 'Core Ultra 7', slug: 'intel-core-ultra-7' },
                                { name: 'Ryzen AI 300', slug: 'amd-ryzen-ai-300' },
                                { name: 'Snapdragon X', slug: 'arm-snapdragon-x' },
                                { name: 'Copilot+ PC', slug: 'feature-copilot-plus' },
                                { name: 'NPU搭載 (AI PC)', slug: 'feature-npu-ai' },
                            ].map((tag) => (
                                <Link key={tag.slug} href={`/pc-products/?attribute=${tag.slug}`} className={styles.specTag}>
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={styles.searchGroup}>
                        <h3 className={styles.groupLabel}>形状・グラフィックス</h3>
                        <div className={styles.categoryGrid}>
                            {[
                                { name: 'デスクトップPC', slug: 'type-desktop', icon: '🖥️' },
                                { name: '小型・ミニPC', slug: 'type-mini-pc', icon: '📦' },
                                { name: '2-in-1 / タブレット', slug: 'type-2in1', icon: '🔄' },
                                { name: 'RTX 50シリーズ', slug: 'gpu-rtx-50-series', icon: '⚡' },
                                { name: 'RTX 40シリーズ', slug: 'gpu-rtx-40-series', icon: '🚀' },
                                { name: 'ワークステーション', slug: 'type-workstation', icon: '🛠️' },
                            ].map((cat) => (
                                <Link key={cat.slug} href={`/pc-products/?attribute=${cat.slug}`} className={styles.categoryCardSmall}>
                                    <span className={styles.catIcon}>{cat.icon}</span>
                                    <span className={styles.catNameSmall}>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 🔥 注目度ランキング */}
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
                                        <img 
                                            src={product.image_url?.replace('http://', 'https://') || '/no-image.png'} 
                                            alt={product.name || 'PC製品'} 
                                        />
                                    </div>
                                    <div className={styles.topThreeContent}>
                                        <span className={styles.topThreeMaker}>{product.maker}</span>
                                        <h3 className={styles.topThreeName}>{product.name}</h3>
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
                                    <img 
                                        src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url?.replace('http://', 'https://') || '/no-image.png'} 
                                        alt={safeDecode(post.title?.rendered || '')} 
                                        className={styles.eyecatch} 
                                        loading="lazy" 
                                    />
                                </div>
                                <div className={styles.contentBody}>
                                    <span className={styles.postDate}>{post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}</span>
                                    <h3 className={styles.articleTitle}>{safeDecode(post.title?.rendered || '')}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className={styles.viewMoreContainer}>
                        <Link href="/bicstation/" className={styles.catalogFullLink}>
                            すべてのPC記事を表示する ({wpData?.count || 0}件)
                        </Link>
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