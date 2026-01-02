/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPostList, fetchPCProducts } from '@/lib/api'; // ✅ APIをインポート
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
export default async function Page(props: { searchParams: Promise<{ offset?: string }> }) {
    const searchParams = await props.searchParams;
    const currentOffset = parseInt(searchParams.offset || '0', 10);
    const limit = 10;

    // ✅ 分離したAPI関数を使用
    const [posts, pcData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('Lenovo', currentOffset, limit)
    ]);

    return (
        <div className={styles.wrapper}>
            
            <Sidebar activeMenu="lenovo" />

            <main className={styles.main}>
                
                {/* 🛠️ デバッグパネル */}
                <div className={styles.debugPanel}>
                    <strong>API Status:</strong> {pcData.results.length > 0 ? `✅ OK (${pcData.count} items)` : '❌ Failed'} | 
                    <strong> WP Posts:</strong> {posts.length > 0 ? `✅ ${posts.length} items` : '⚠️ No data'} |
                    <strong> URL:</strong> <code>{pcData.debugUrl}</code>
                </div>

                {/* WordPress お知らせセクション */}
                <section style={{ marginBottom: '50px' }}>
                    <h2 className={styles.sectionTitle}>
                        <span style={{ marginRight: '8px' }}>📢</span> 最新のお知らせ
                    </h2>
                    <div className={styles.newsContainer}>
                        {posts.length === 0 ? (
                            <p style={{ padding: '20px', color: '#999' }}>現在、新しいお知らせはありません。</p>
                        ) : (
                            posts.map((post) => (
                                <Link 
                                    href={`/bicstation/${post.slug}`} 
                                    key={post.id} 
                                    className={styles.newsLink}
                                >
                                    <div className={styles.newsDate}>
                                        {new Date(post.date).toLocaleDateString('ja-JP')}
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{decodeHtml(post.title.rendered)}</div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Django 製品一覧セクション */}
                <section>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        Lenovo 製品ラインナップ
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '10px' }}>
                            <p>データを読み込み中、または取得に失敗しました。</p>
                        </div>
                    ) : (
                        <>
                            {/* 商品グリッド */}
                            <div className={styles.productGrid}>
                                {pcData.results.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* ページネーションパーツ */}
                            <Pagination 
                                currentOffset={currentOffset}
                                limit={limit}
                                totalCount={pcData.count}
                                baseUrl="/"
                            />
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}