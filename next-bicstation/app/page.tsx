/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// /home/maya/dev/shin-vps/next-bicstation/app/page.tsx

export const revalidate = 3600;

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RadarChart from '@shared/ui/RadarChart';
import ProductCard from '@shared/cards/ProductCard';
import styles from './MainPage.module.css';

// ✅ 名前付きインポートで確実に接続
import { fetchPostList } from '@shared/lib/api/wordpress';
import { fetchPCProducts, fetchPCProductRanking, fetchPCPopularityRanking } from '@shared/lib/api/django/pc';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    // 🛡️ APIが一部失敗しても画面を止めないガード
    async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
        try {
            const data = await promise;
            return data ?? fallback;
        } catch (e) {
            console.error("[BICSTATION API ERROR]:", e);
            return fallback;
        }
    }

    // 🚀 APIデータを並列取得
    const [wpData, pcData, rankingData, popularityData] = await Promise.all([
        safeFetch(fetchPostList('post', 8), { results: [], count: 0 }),
        safeFetch(fetchPCProducts('', 0, 12, attribute || ''), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking(), []),
        safeFetch(fetchPCPopularityRanking(), [])
    ]);

    const pcResults = pcData?.results || [];
    const wpResults = wpData?.results || [];
    const topThree = rankingData.slice(0, 3);

    const safeDecode = (str: string) => {
        if (!str) return '';
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    };

    return (
        <article className={styles.mainContainer}>
            <header className={styles.pageHeader}>
                <h1 className={styles.mainTitle}>
                    BICSTATION <span className={styles.subTitle}>PCスペック比較・最安値カタログ</span>
                </h1>
                <p className={styles.pageDescription}>
                    主要メーカーのPCをAIスコアで徹底比較。最新の価格、詳細スペックを網羅した専門ポータルです。
                </p>
            </header>

            {/* 🏆 ランキングセクション */}
            {topThree.length > 0 && (
                <section className={styles.rankingSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>👑 AIスペックランキング</h2>
                        <Link href="/ranking/" className={styles.rankingLink}>すべて見る →</Link>
                    </div>
                    <div className={styles.topThreeGrid}>
                        {topThree.map((p, i) => (
                            <div key={p.unique_id || i} className={`${styles.topThreeCard} ${styles[`rank_${i + 1}`]}`}>
                                <div className={styles.rankBadge}>{i + 1}位</div>
                                <div className={styles.topThreeImage}>
                                    <Image src={p.image_url || '/no-image.png'} alt={p.name} fill unoptimized className={styles.rankingImgTag} />
                                </div>
                                <div className={styles.topThreeContent}>
                                    <p className={styles.topThreeMaker}>{p.maker}</p>
                                    <h3 className={styles.topThreeName}>{p.name}</h3>
                                    <div className={styles.topThreeScore}>
                                        <p className={styles.scoreValue}>{p.spec_score || 0}</p>
                                        <p className={styles.scoreLabel}>PERFORMANCE SCORE</p>
                                    </div>
                                    <Link href={`/product/${p.unique_id}`} className={styles.detailButton}>詳細を見る</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 🚀 最新ニュース */}
            <section className={styles.newsSection}>
                <h2 className={styles.sectionTitle}>🚀 PC業界・最新トピック</h2>
                <div className={styles.newsGrid}>
                    {wpResults.length > 0 ? wpResults.map((post: any) => (
                        <Link href={`/blog/${post.id}`} key={post.id} className={styles.newsCard}>
                            <div className={styles.contentBody}>
                                <time className={styles.postDate}>{post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}</time>
                                <h3 className={styles.articleTitle}>{safeDecode(post.title?.rendered || '')}</h3>
                            </div>
                        </Link>
                    )) : <p>最新ニュースを読み込み中です。</p>}
                </div>
            </section>

            {/* 📦 製品カタログ */}
            <section className={styles.productSection}>
                <h2 className={styles.productGridTitle}>最新PC製品カタログ</h2>
                <div className={styles.productGrid}>
                    {pcResults.length > 0 ? (
                        pcResults.map((product: any) => (
                            <ProductCard key={product.unique_id} product={product} />
                        ))
                    ) : (
                        <p>製品情報を取得しています...</p>
                    )}
                </div>
            </section>
        </article>
    );
}