/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * 🛰️ [BRIDGE] 統合サービス層
 * tsconfig.json で定義した @/shared エイリアスを使用してインポート。
 */
import { fetchDjangoBridgeContent, fetchPostList } from '@/shared/lib/api/django-bridge';
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import SafeImage from '@/shared/components/atoms/SafeImage';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 レンダリングポリシー
 * リクエストごとに最新データを Django から取得します。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🛡️ API通信の安全な実行（Django停止時でもフロントを落とさない）
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [${new Date().toISOString()}] API_SKIP:`, e.message);
        return fallback;
    }
}

export default async function Page() {
    // --- 🛠️ データ格納用変数 ---
    let products = [];
    let articles = [];
    let totalCount = 0;
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AV FLASH';

    // 🛡️ Middlewareから渡された判定済みホストを取得
    const headerList = await headers();
    const djangoHost = headerList.get('x-django-host') || '';

    try {
        /**
         * 🚀 並列データ取得実行
         * 1. 商品データ (DUGA)
         * 2. サイト固有のブログ記事 (News)
         */
        const [productRes, articleRes] = await Promise.all([
            safeFetch(
                fetchDjangoBridgeContent({ 
                    content_type: 'product', 
                    api_source: 'DUGA', 
                    limit: 12, 
                    host: djangoHost 
                }),
                { results: [], count: 0 }
            ),
            safeFetch(
                fetchPostList(6, 0, djangoHost),
                { results: [], count: 0 }
            )
        ]);

        // 各データの展開
        products = productRes?.results || [];
        totalCount = productRes?.count || 0;
        articles = articleRes?.results || [];

        console.log(`[AvFlash] Sync Success | Host: ${djangoHost} | Products: ${products.length} | News: ${articles.length}`);
    } catch (error) {
        console.error("[AvFlash] Critical Page Load Error:", error);
    }

    return (
        <div className={styles.container}>
            
            {/* --- 🛸 ヒーローヘッダー --- */}
            <header className={styles.heroHeader}>
                <div className={styles.heroBadge}>AI ANALYSIS & ARCHIVE</div>
                <h1 className={styles.heroTitle}>{title}</h1>
                <p className={styles.heroSubtitle}>
                    AI解析によって厳選された <span style={{ color: '#ffc107' }}>DUGA</span> 最新作品と業界分析記事
                </p>
                <div className={styles.statsInfo}>
                    Total <strong>{totalCount.toLocaleString()}</strong> curated items
                </div>
            </header>

            {/* --- 📰 LATEST ARTICLES (ブログ記事) --- */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.sectionTitle}>LATEST ARTICLES</h2>
                        <div className={styles.titleLine} />
                    </div>
                    <Link href="/posts" className={styles.viewAllLink}>
                        VIEW ALL ARTICLES →
                    </Link>
                </div>

                <div className={styles.articleGrid}>
                    {articles.length > 0 ? (
                        articles.map((post) => (
                            <Link href={`/posts/${post.id}`} key={post.id} className={styles.articleCard}>
                                <div className={styles.articleThumb}>
                                    <SafeImage 
                                        src={post.thumbnail || '/img/no-image.png'} 
                                        alt={post.title} 
                                        className="object-cover w-full h-full"
                                    />
                                    <div className={styles.articleDate}>[{post.created_at?.split('T')[0] || 'RECENT'}]</div>
                                </div>
                                <div className={styles.articleBody}>
                                    <h3 className={styles.articleTitle}>{post.title}</h3>
                                    <p className={styles.articleExerpt}>
                                        {post.excerpt ? post.excerpt.substring(0, 50) : post.title.substring(0, 30)}...
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-lg">
                            <p className={styles.glitchText}>NO_INTELLIGENCE_DATA_IN_STREAM</p>
                        </div>
                    )}
                </div>
            </section>

            {/* --- 💎 DUGA NEW RELEASES (商品グリッド) --- */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.sectionTitle}>NEW RELEASES</h2>
                        <div className={styles.titleLine} />
                    </div>
                    <Link href="/brand/duga" className={styles.viewAllLink}>
                        VIEW ALL DUGA →
                    </Link>
                </div>
                
                <div className={styles.productGrid}>
                    {products.length > 0 ? (
                        products.map((item) => (
                            <AdultProductCard key={item.id || item.slug} product={item} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3>CONNECTING_TO_MATRIX...</h3>
                            <p>
                                Djangoサーバー <code>DUGA_STREAM</code> を待機中...<br />
                                Host: <strong>{djangoHost || 'Detecting...'}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* --- 🛡️ インフォメーション --- */}
            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <h3>AI ANALYSIS SITE</h3>
                    <p>
                        本ポータルは、最新のアダルトコンテンツをAI技術を用いて多角的に分析し、
                        ユーザーの好みに最適な作品を提案する次世代のエンタメポータルです。
                    </p>
                </div>
            </section>
        </div>
    );
}