/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
// ❌ headers削除
import Link from 'next/link';
import { TrendingUp, Activity, Flame } from 'lucide-react';

import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

import styles from './Popularity.module.css';

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

/** metadata */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const sParams = await props.searchParams;
    const page = sParams.page || '1';
    
    return {
        title: `【2026年最新】人気PCランキング 第${page}ページ | BICSTATION`,
        description: '人気PCランキング',
    };
}

export default function PopularityRankingPage(props: PageProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PopularityContent {...props} />
        </Suspense>
    );
}

async function PopularityContent(props: PageProps) {
    const sParams = await props.searchParams;
    const currentPage = parseInt(sParams.page || '1', 10);
    const limit = 20;

    // ✅ 固定
    const host = "bicstation.com";

    const rawData = await fetchPCProductRanking('popularity', host).catch(() => []);

    const allProducts = Array.isArray(rawData)
        ? rawData
        : (rawData?.results || []);

    const offset = (currentPage - 1) * limit;
    const products = allProducts.slice(offset, offset + limit);
    const totalPages = Math.ceil(allProducts.length / limit);

    return (
        <main className={styles.container}>

            <header>
                <h1>人気ランキング</h1>
            </header>

            <div className={styles.grid}>
                {products.map((product: any, index: number) => {
                    const rank = offset + index + 1;

                    return (
                        <div key={product.unique_id || index}>
                            <ProductCard product={product} rank={rank}>
                                {rank <= 3 && <span>🔥 人気</span>}
                            </ProductCard>
                        </div>
                    );
                })}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/popularity"
            />

        </main>
    );
}