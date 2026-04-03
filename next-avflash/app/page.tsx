/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * 🛰️ [CORE SERVICES]
 * 最新の django/posts.ts を使用。旧 bridge は商品データ取得(DUGA)に限定。
 */
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import SafeImage from '@/shared/components/atoms/SafeImage';
import { UnifiedPost } from '@/shared/lib/api/types';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 レンダリングポリシー
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🛡️ API通信の安全な実行
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [API_SKIP]:`, e.message);
        return fallback;
    }
}

export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AV FLASH';

    // 🛡️ Middlewareから渡された判定済みプロジェクトIDを取得
    const headerList = await headers();
    const project = headerList.get('x-django-host') || 'avflash'; 

    /**
     * 🚀 並列データ取得実行
     * 1. 商品データ (DUGA) -> 旧Bridge経由（AdultProduct型）
     * 2. サイト記事 (UnifiedPost) -> 新Postサービス直結
     */
    const [productRes, articleRes] = await Promise.all([
        safeFetch(
            fetchDjangoBridgeContent({ 
                content_type: 'product', 
                api_source: 'DUGA', 
                limit: 12, 
                host: project 
            }),
            { results: [], count: 0 }
        ),
        safeFetch(
            fetchPostList(6, 0, project),
            { results: [], count: 0 }
        )
    ]);

    const products = productRes?.results || [];
    const totalCount = productRes?.count || 0;
    const articles: UnifiedPost[] = articleRes?.results || [];

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

            {/* --- 📰 LATEST ARTICLES (UnifiedPost形式) --- */}
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
                            <Link href={`/posts/${post.slug}`} key={post.id} className={styles.articleCard}>
                                <div className={styles.articleThumb}>
                                    <SafeImage 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="object-cover w-full h-full"
                                    />
                                    <div className={styles.articleDate}>
                                        [{new Date(post.created_at).toLocaleDateString('ja-JP')}]
                                    </div>
                                </div>
                                <div className={styles.articleBody}>
                                    <h3 className={styles.articleTitle}>{post.title}</h3>
                                    <p className={styles.articleExerpt}>
                                        {post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 60) : ""}...
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

            {/* --- 💎 DUGA NEW RELEASES --- */}
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
                            <AdultProductCard key={item.id} product={item} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3>CONNECTING_TO_MATRIX...</h3>
                            <p>
                                Djangoサーバー <code>DUGA_STREAM</code> を待機中...<br />
                                Project: <strong>{project}</strong>
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