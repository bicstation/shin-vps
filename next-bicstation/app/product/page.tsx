/* eslint-disable @next/next/no-img-element */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// ❌ headers削除

import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';
import { fetchPCProducts } from '@/shared/lib/api/django/pc/products';

import styles from './ProductsPage.module.css';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = sParams.maker ? sParams.maker.toUpperCase() : '';
    const attrRaw = sParams.attribute || sParams.gpu || sParams.cpu || sParams.os || sParams.memory || sParams.feature || '';
    const attrLabel = attrRaw.replace(/-/g, ' ').toUpperCase();
    const query = sParams.q || '';
    
    return {
        title: `${maker || attrLabel || query || '製品一覧'} | PC製品カタログ | BICSTATION`,
        description: `${maker || attrLabel || '最新'}のPC製品をAIスコアや性能順でリアルタイム比較。`,
    };
}

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
        offset?: string;
        attribute?: string; 
        gpu?: string;
        cpu?: string;
        os?: string;
        memory?: string;
        feature?: string;
    }>;
}

export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageContent {...props} />
        </Suspense>
    );
}

async function ProductsPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    const limit = 20;
    const currentPage = parseInt(sParams.page || '1');
    const currentOffset = (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';

    const currentAttr = 
        sParams.attribute || 
        sParams.gpu || 
        sParams.cpu || 
        sParams.os || 
        sParams.memory || 
        sParams.feature || 
        '';

    // ✅ 固定に変更
    const host = "bicstation.com";

    const response = await fetchPCProducts(
        searchQuery,
        currentOffset,
        limit,
        currentMaker,
        host,
        currentSort,
        currentAttr
    ).catch(() => ({ results: [], count: 0 }));

    const results = response?.results || [];
    const count = response?.count || 0;
    const totalPages = Math.ceil(count / limit);

    return (
        <main className={styles.container}>

            <header className={styles.header}>
                <h1>{count} ITEMS</h1>
            </header>

            <section className={styles.gridArea}>
                {results.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {results.map((product: any, index: number) => (
                                <ProductCard 
                                    key={product.id || index} 
                                    product={product} 
                                />
                            ))}
                        </div>

                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl="/product"
                        />
                    </>
                ) : (
                    <div>NO DATA</div>
                )}
            </section>
        </main>
    );
}