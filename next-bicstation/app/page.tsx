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

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 10;

    const makers = ['Lenovo', 'HP', 'Dell'];

    // API呼び出し（サイドバー用にお知らせは常に取得）
    const [wpData, pcData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('', currentOffset, limit) 
    ]);

    const posts = wpData.results || [];

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makers} 
                    recentPosts={posts.map((p: any) => ({
                        id: p.id,
                        title: decodeHtml(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                {/* 🚩 currentOffset が 0 の時（1ページ目）だけお知らせを表示 */}
                {currentOffset === 0 && (
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
                                posts.map((post: any) => (
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
                )}

                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        {currentOffset === 0 ? "製品ラインナップ" : `製品ラインナップ (${currentOffset / limit + 1}ページ目)`}
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>製品データがありません。(Offset: {currentOffset})</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {pcData.results.map((product: any) => (
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