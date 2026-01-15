/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPCProducts, fetchPostList, fetchMakers } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './BrandPage.module.css';

/**
 * 💡 サーバーサイド用の簡易エスケープ解除
 */
const safeDecode = (str: string) => {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
};

interface PageProps {
    params: Promise<{ slug?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;

    let title = "すべてのPC製品一覧";
    if (maker) title = `${maker.toUpperCase()} の製品一覧`;
    else if (attribute) title = `${attribute.toUpperCase()} 搭載モデル一覧`;

    return {
        title: `${title} | BICSTATION`,
        description: `最新のPC製品を一覧で比較。${maker ? maker + 'を中心に' : ''}スペックや価格をリアルタイムで確認できます。`,
    };
}

export default async function PCProductsPage({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const makerQuery = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts(makerQuery || '', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];
    const primaryColor = COLORS?.SITE_COLOR || '#007bff';

    const pageTitle = makerQuery 
        ? `${makerQuery.toUpperCase()} の製品一覧` 
        : attribute 
            ? `${attribute.toUpperCase()} 搭載モデル一覧` 
            : "すべてのPC製品一覧";

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu={makerQuery || ''} 
                    makers={makersData} 
                    recentPosts={posts.map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.brandHeader}>
                    <div className={styles.brandInfo}>
                        <h1 className={styles.brandTitle}>
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
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {pcData.results.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <div className={styles.paginationWrapper}>
                                <Pagination currentOffset={currentOffset} limit={limit} totalCount={pcData.count} baseUrl={`/pc-products`} />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}