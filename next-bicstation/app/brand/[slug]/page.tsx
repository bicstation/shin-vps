/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPCProducts, fetchPostList, fetchMakers } from '@/lib/api'; // fetchMakersを追加
import styles from './BrandPage.module.css';

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandPage({ params, searchParams }: PageProps) {
    // params と searchParams を await
    const { slug } = await params;
    const sParams = await searchParams;
    
    // offset の取得
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    // サイドバー用のデータ、製品データ、および動的メーカーリストを並列取得
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts(slug, currentOffset, limit),
        fetchMakers() // 🔥 Djangoから件数付きメーカーリストを取得
    ]);

    const posts = wpData.results || [];

    // 表示用メーカー名の整形（dell -> DELL）
    const displayMakerName = slug.toUpperCase();

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                {/* Sidebarに現在のslugを渡し、ハイライトを有効化。
                    APIから取得した makersData を渡すことで、件数表示を反映。
                */}
                <Sidebar 
                    activeMenu={slug} 
                    makers={makersData} // 🔥 静的な配列から動的なAPIデータに変更
                    recentPosts={posts.map((p: any) => ({
                        id: p.id,
                        title: decodeHtml(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.brandHeader}>
                    <div className={styles.brandInfo}>
                        <h1 className={styles.brandTitle}>
                            <span className={styles.titleLine}></span>
                            {displayMakerName} の製品一覧
                        </h1>
                        <p className={styles.productCount}>
                            該当件数: <strong>{pcData.count}</strong> 件
                        </p>
                    </div>
                </header>

                <section className={styles.productSection}>
                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>{displayMakerName} の製品データが見つかりませんでした。</p>
                            <p style={{fontSize: '0.9rem', color: '#999', marginTop: '10px'}}>
                                (条件: maker="{slug}")
                            </p>
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
                                    baseUrl={`/brand/${slug}`} 
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}