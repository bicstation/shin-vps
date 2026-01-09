/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPostList, fetchPCProducts } from '@/lib/api'; 
import styles from './MainPage.module.css';

// --- ユーティリティ ---
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

// --- メインページコンポーネント ---
export default async function Page(props: { 
    params: Promise<{ id?: string }>; 
    searchParams: Promise<{ offset?: string }> 
}) {
    // Next.js 15+ の非同期 params / searchParams に対応
    const params = await props.searchParams;
    const currentOffset = parseInt(params.offset || '0', 10);
    const limit = 10;

    // ✅ 両方のAPIを並列取得
    const [wpData, pcData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('Dell', currentOffset, limit) 
    ]);

    const posts = wpData.results || [];

    return (
        <div className={styles.wrapper}>
            {/* サイドバー：スマホ時はCSSで非表示または調整 */}
            <aside className={styles.sidebarSection}>
                <Sidebar activeMenu="dell" />
            </aside>

            <main className={styles.main}>
               
                {/* WordPress お知らせセクション */}
                <section className={styles.newsSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.emoji}>📢</span> 最新のお知らせ
                    </h2>
                    <div className={styles.newsContainer}>
                        {posts.length === 0 ? (
                            <div className={styles.noData}>
                                <p>現在、表示できるお知らせはありません。</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <Link 
                                    href={`/bicstation/${post.slug}`} 
                                    key={post.id} 
                                    className={styles.newsLink}
                                >
                                    <span className={styles.newsDate}>
                                        {new Date(post.date).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className={styles.newsTitle}>
                                        {decodeHtml(post.title.rendered)}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Django 製品一覧セクション */}
                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        製品ラインナップ
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>製品データを読み込み中、または取得できる製品がありません。</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {pcData.results.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            <div className={styles.paginationWrapper}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={pcData.count}
                                    baseUrl="/"
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}