/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPostList, fetchPCProducts, fetchMakers } from '@/lib/api'; 
import styles from './MainPage.module.css';

/**
 * HTMLエンティティをデコードするユーティリティ
 */
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
    
    // 💡 クエリパラメータの抽出（offset と attribute）
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 10;

    // 💡 fetchPCProducts に attribute を渡して絞り込みを有効化
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];

    // 表示用タイトルの動的決定
    const listTitle = attribute 
        ? `${attribute.toUpperCase()} 搭載製品一覧` 
        : "製品ラインナップ";

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={posts.map((p: any) => ({
                        id: p.id,
                        title: decodeHtml(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                {/* 🚩 絞り込み(attribute)がない時かつ1ページ目の時だけお知らせを表示 */}
                {!attribute && currentOffset === 0 && (
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
                        {currentOffset === 0 ? listTitle : `${listTitle} (${currentOffset / limit + 1}ページ目)`}
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>該当する製品データがありません。</p>
                            {attribute && (
                                <Link href="/" className={styles.resetLink} style={{ color: '#007bff', textDecoration: 'underline', marginTop: '10px', display: 'block' }}>
                                    絞り込みを解除する
                                </Link>
                            )}
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