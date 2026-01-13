/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPCProducts, fetchPostList, fetchMakers } from '@/lib/api';
import styles from './BrandPage.module.css'; // 既存のスタイルを継承

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

interface PageProps {
    // pc-products配下には slug がないので params は空になります
    params: Promise<{ slug?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PCProductsPage({ params, searchParams }: PageProps) {
    // 💡 searchParams を await してクエリを取得
    const sParams = await searchParams;
    
    // 💡 各種クエリパラメータの抽出
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const makerQuery = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    // 💡 並列データ取得
    // fetchPCProducts の第一引数(maker)には、URLに ?maker=xxx があればそれを渡し、なければ空にします
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts(makerQuery || '', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];

    // 表示用タイトルの動的決定
    const pageTitle = makerQuery 
        ? `${makerQuery.toUpperCase()} の製品一覧` 
        : attribute 
            ? `${attribute} 搭載モデル一覧` 
            : "すべてのPC製品一覧";

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                {/* Sidebarに現在のメーカー(makerQuery)を渡し、ハイライトを有効化。
                    APIから取得した makersData で件数付きリストを表示。
                */}
                <Sidebar 
                    activeMenu={makerQuery || ''} 
                    makers={makersData} 
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
                            {pageTitle}
                        </h1>
                        <p className={styles.productCount}>
                            該当件数: <strong>{pcData.count}</strong> 件
                        </p>
                    </div>
                </header>

                <section className={styles.productSection}>
                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>該当する製品データが見つかりませんでした。</p>
                            <p style={{fontSize: '0.9rem', color: '#999', marginTop: '10px'}}>
                                条件をクリアして再度お試しください。
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
                                    // 💡 全製品ページなのでベースURLは固定
                                    baseUrl={`/pc-products`} 
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}