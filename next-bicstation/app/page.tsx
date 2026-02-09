/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

/**
 * ✅ 爆速の鍵: ISR (Incremental Static Regeneration)
 * 1時間（3600秒）ごとにバックグラウンドで再生成し、静的ファイルとして配信。
 */
export const revalidate = 3600;

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@shared/layout/Sidebar';
import RadarChart from '@shared/ui/RadarChart';

/**
 * ✅ インポートパスの正規化
 */
import ProductCard from '@shared/cards/ProductCard';

import {
    fetchPostList,
    fetchPCProducts,
    fetchMakers,
    fetchPCProductRanking,
    fetchPCPopularityRanking
} from '@shared/lib/api';
import styles from './MainPage.module.css';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * BICSTATION メインページ
 * 統合データフェッチにより、WP記事とDjango製品データを単一ビューに集約。
 */
export default async function Page({ searchParams }: PageProps) {
    // Next.js 15 では searchParams は Promise として扱う
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const PRODUCT_LIMIT = 12;

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

    /**
     * WPのタイトル等のHTMLエンティティをデコード
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

    return (
        <div className={styles.wrapper}>
            {/* ✅ サイドバー: 
                トップページでは `product` を渡さないことで、
                スペックカードを表示させず、共通ナビゲーションのみを表示。
            */}
            {/* Page.tsx 内の該当箇所 */}
            <aside className={styles.sidebarSection}>
                <Sidebar
                    activeMenu="all"
                    // メーカー一覧: APIレスポンスが配列であることを確認
                    makers={Array.isArray(makersData) ? makersData : []}
                    // 最新記事: オブジェクト構造をサイドバーの期待値に合わせる
                    recentPosts={wpResults.map((p: any) => ({
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

                {/* 🏆 AIスペックランキング (スコア上位) */}
                {topThree.length > 0 && (
                    <section className={styles.rankingSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.emoji}>👑</span> AIスペックランキング
                            </h2>
                            <Link href="/ranking/" className={styles.rankingLink}>ランキング一覧 →</Link>
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
                                        <Link href={`/product/${product.unique_id}`} className={styles.detailButton}>スペック詳細</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 🔍 カテゴリー・スペック検索クイックリンク */}
                <section className={styles.categorySearchSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔍</span> 条件から探す</h2>
                    <div className={styles.searchGroup}>
                        <h3 className={styles.groupLabel}>利用シーン別</h3>
                        <div className={styles.categoryGrid}>
                            {[
                                { name: 'ビジネス', slug: 'usage-business', icon: '💼' },
                                { name: 'ゲーミング', slug: 'usage-gaming', icon: '🎮' },
                                { name: 'クリエイティブ', slug: 'usage-creator', icon: '🎨' },
                                { name: 'AI・開発', slug: 'usage-ai-dev', icon: '🤖' },
                                { name: '1kg未満', slug: 'feat-lightweight', icon: '🪶' },
                                { name: 'モバイル', slug: 'size-mobile', icon: '💻' },
                            ].map((cat) => (
                                <Link key={cat.slug} href={`/pc-products/?attribute=${cat.slug}`} className={styles.categoryCardSmall}>
                                    <span className={styles.catIcon}>{cat.icon}</span>
                                    <span className={styles.catNameSmall}>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={styles.searchGroup}>
                        <h3 className={styles.groupLabel}>最新プロセッサ</h3>
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

                {/* 🔥 注目度ランキング (PV/トレンド上位) */}
                {trendTopThree.length > 0 && (
                    <section className={`${styles.rankingSection} ${styles.popularityBg}`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}><span className={styles.emoji}>🔥</span> 注目度急上昇</h2>
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
                                            <span className={styles.trendLabel}>TREND</span>
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

                {/* 🚀 記事セクション (WPから取得) */}
                <section className={styles.newsSection}>
                    <h2 className={styles.sectionTitle}><span className={styles.emoji}>🚀</span> PC最新トピック</h2>
                    <div className={styles.newsGrid}>
                        {featuredPosts.map((post: any) => (
                            <Link href={`/news/${post.id}`} key={post.id} className={styles.newsCard}>
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

                {/* 📦 最新製品カタログ一覧 */}
                <section className={styles.productSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.productGridTitle}><span className={styles.titleIndicator}></span>最新カタログ</h2>
                    </div>
                    <div className={styles.productGrid}>
                        {pcResults.length > 0 ? (
                            pcResults.map((product: any) => (
                                <ProductCard key={product.id || product.unique_id} product={product} />
                            ))
                        ) : (
                            <p className={styles.noData}>製品データがありません。</p>
                        )}
                    </div>
                    <div className={styles.viewMoreContainer}>
                        <Link href="/catalog/" className={styles.catalogFullLink}>
                            すべての製品を表示 ({pcData?.count || 0}件)
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}