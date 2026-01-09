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
import { fetchPostList, fetchPCProducts } from '@/lib/api'; 
import styles from './MainPage.module.css';

// --- ユーティリティ ---
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || map[match] || match);
};

// --- メインページコンポーネント ---
export default async function Page(props: { searchParams: Promise<{ offset?: string }> }) {
    const searchParams = await props.params; // Next.jsの最新仕様に合わせる場合はawait
    const params = await props.searchParams;
    const currentOffset = parseInt(params.offset || '0', 10);
    const limit = 10;

    // ✅ 両方のAPIを並列取得
    // デフォルトのトップページ表示として 'Dell' を指定する構成にしています
    const [wpData, pcData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('Dell', currentOffset, limit) 
    ]);

    const posts = wpData.results || [];

    return (
        <div className={styles.wrapper}>
            
            {/* サイドバーのactiveMenuをdellに設定 */}
            <Sidebar activeMenu="dell" />

            <main className={styles.main}>
               
                {/* WordPress お知らせセクション */}
                <section style={{ marginBottom: '50px' }}>
                    <h2 className={styles.sectionTitle}>
                        <span style={{ marginRight: '8px' }}>📢</span> 最新のお知らせ
                    </h2>
                    <div className={styles.newsContainer}>
                        {posts.length === 0 ? (
                            <div style={{ padding: '20px', color: '#666', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <p>現在、表示できるお知らせはありません。</p>
                            </div>
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
                        製品ラインナップ
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '10px' }}>
                            <p>製品データを読み込み中、または取得できる製品がありません。</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {pcData.results.map((product) => (
                                    /* ProductCard内部でデル判定が行われ、
                                       適切なアフィリエイトリンク（個別またはデフォルト）が生成されます
                                    */
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

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