/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPCProducts, fetchPostList, fetchMakers } from '@/lib/api';
// 🚩 COLORS（テーマカラー）をインポート
import { COLORS } from "@/constants";
// 🚩 Sidebarと同じスタイルを使用することで整合性を保つ
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
    params: Promise<{ slug?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PCProductsPage(props: PageProps) {
    // 💡 params と searchParams を両方 await
    const params = await props.params;
    const sParams = await props.searchParams;
    
    // 💡 各種クエリパラメータの抽出
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const makerQuery = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    // 💡 並列データ取得
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts(makerQuery || '', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];
    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    // 表示用タイトルの動的決定
    const pageTitle = makerQuery 
        ? `${makerQuery.toUpperCase()} の製品一覧` 
        : attribute 
            ? `${attribute} 搭載モデル一覧` 
            : "すべてのPC製品一覧";

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
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
                            {/* 🚩 サイトカラーを縦線に適用 */}
                            <span className={styles.titleLine} style={{ backgroundColor: primaryColor }}></span>
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