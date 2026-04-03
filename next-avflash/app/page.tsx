/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * 🛰️ [BRIDGE] 統合サービス層を介してデータを取得
 * siteConfig の Single Truth (唯一の真実) を利用するため、
 * ページ側でのドメイン判定ロジックは不要になります。
 */
import { fetchDjangoBridgeContent, fetchPostList } from '@shared/lib/api/bridge';
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
    // --- 🛠️ 初期状態 ---
    let products = [];
    let articles = [];
    let totalCount = 0;
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AV FLASH';

    // 🛡️ Middlewareが焼いた判定済みHostを取得 (API通信の命綱)
    const headerList = await headers();
    const djangoHost = headerList.get('x-django-host') || '';

    try {
        /**
         * 🚀 データ取得実行 (並列実行で高速化)
         * 1. 商品データ (DUGA)
         * 2. ブログ記事 (News)
         */
        const [productRes, articleRes] = await Promise.all([
            fetchDjangoBridgeContent({ 
                content_type: 'product',
                api_source: 'DUGA',
                limit: 12,
                host: djangoHost 
            }),
            fetchPostList(6, 0, djangoHost)
        ]);

        // 商品データの格納
        if (productRes) {
            products = productRes.results || [];
            totalCount = productRes.count || 0;
        }

        // 記事データの格納
        if (articleRes) {
            articles = articleRes.results || [];
        }

        console.log(`[AvFlash] Data Sync Success | Products: ${products.length} | Articles: ${articles.length}`);
        
    } catch (error) {
        console.error("[AvFlash] API Connection Error:", error);
    }

    return (
        <div className={styles.container}>
            
            {/* --- 🛸 ヒーローヘッダー --- */}
            <header className={styles.heroHeader}>
                <div className={styles.heroBadge}>AI ANALYSIS & ARCHIVE</div>
                <h1 className={styles.heroTitle}>{title}</h1>
                <p className={styles.heroSubtitle}>
                    AI解析によって厳選された <span style={{ color: '#ffc107' }}>DUGA</span> の最新作品と、業界のディープな分析記事
                </p>
                <div className={styles.statsInfo}>
                    Total <strong>{totalCount.toLocaleString()}</strong> curated items
                </div>
            </header>

            {/* --- 📰 LATEST ARTICLES (ブログ記事セクション) --- */}
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
                                    <img src={post.thumbnail || '/img/no-image.png'} alt={post.title} />
                                </div>
                                <div className={styles.articleBody}>
                                    <span className={styles.articleDate}>{post.created_at?.split('T')[0]}</span>
                                    <h3 className={styles.articleTitle}>{post.title}</h3>
                                    <p className={styles.articleExerpt}>{post.excerpt?.substring(0, 50)}...</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.emptyStateSimple}>記事データを読み込み中...</div>
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
                                現在、Host: <strong>{djangoHost}</strong> のコンテンツを同期しています。
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ページ下部：インフォメーション */}
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