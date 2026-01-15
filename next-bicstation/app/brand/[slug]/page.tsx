/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPCProducts, fetchPostList, fetchMakers } from '@/lib/api';
import { COLORS } from "@/constants";
import styles from './BrandPage.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const sParams = await searchParams;
    const brandName = slug.toUpperCase();
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const titleSuffix = attribute ? ` > ${attribute.toUpperCase()}` : "";
    
    return {
        title: `${brandName}${titleSuffix} の製品一覧`,
        description: `${brandName}の最新PCスペック情報をリアルタイム更新。メーカー公式ストアの情報を網羅しています。`,
    };
}

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

export default async function BrandPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const sParams = await searchParams;
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts(slug, currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];
    const displayMakerName = slug.toUpperCase();
    const activeFilterLabel = attribute ? ` > ${attribute.toUpperCase()}` : "";
    const primaryColor = COLORS?.SITE_COLOR || '#007bff';

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu={slug} 
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
                            {displayMakerName} の製品一覧
                            <span style={{ fontSize: '0.7em', color: primaryColor, marginLeft: '10px' }}>
                                {activeFilterLabel}
                            </span>
                        </h1>
                        <p className={styles.productCount}>
                            該当件数: <strong>{pcData.count}</strong> 件
                        </p>
                    </div>
                </header>

                <section className={styles.productSection}>
                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>{displayMakerName} の中で、指定された条件に一致する製品が見つかりませんでした。</p>
                            {attribute && (
                                <Link href={`/brand/${slug}`} className={styles.resetLink}>
                                    絞り込みを解除して全件表示する
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