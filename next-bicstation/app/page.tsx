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

// 型定義を修正
interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    // searchParams を確実に await する
    const sParams = await searchParams;
    
    // offset の取得 (文字列の可能性を考慮)
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 10;

    // API呼び出し (currentOffset が正しく反映されているか確認)
    const [wpData, pcData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('', currentOffset, limit) 
    ]);

    const posts = wpData.results || [];

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar activeMenu="all" />
            </aside>

            <main className={styles.main}>
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

                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        製品ラインナップ
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
                                    baseUrl="/" // ここが "/" で offset パラメータが付与されるか確認
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}