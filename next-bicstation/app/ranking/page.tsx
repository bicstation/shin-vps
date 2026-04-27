/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
// ❌ headers削除
import Link from 'next/link';

import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import RadarChart from '@/shared/components/atoms/RadarChart';
import Pagination from '@/shared/components/molecules/Pagination';

import styles from './Ranking.module.css';

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
        title: `【2026年最新】PCランキング 第${page}ページ | BICSTATION`,
        description: `AIスコアによるPCランキング`,
    };
}

export default function RankingPage(props: PageProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RankingContent {...props} />
        </Suspense>
    );
}

async function RankingContent(props: PageProps) {
    const sParams = await props.searchParams;
    const currentPage = parseInt(sParams.page || '1', 10);
    const limit = 20;

    // ✅ 固定
    const host = "bicstation.com";

    const rawData = await fetchPCProductRanking('score', host).catch(() => []);

    const productsArray = Array.isArray(rawData)
        ? rawData
        : (rawData?.results || []);

    const offset = (currentPage - 1) * limit;
    const products = productsArray.slice(offset, offset + limit);
    const totalPages = Math.ceil(productsArray.length / limit);

    return (
        <main className={styles.container}>

            <header>
                <h1>PCランキング</h1>
            </header>

            <div className={styles.grid}>
                {products.map((product: any, index: number) => {
                    const rank = offset + index + 1;

                    const chartData = [
                        { subject: 'CPU', value: product.score_cpu || 0, fullMark: 100 },
                        { subject: 'GPU', value: product.score_gpu || 0, fullMark: 100 },
                        { subject: 'コスパ', value: product.score_cost || 0, fullMark: 100 },
                        { subject: '携帯性', value: product.score_portable || 0, fullMark: 100 },
                        { subject: 'AI性能', value: product.score_ai || 0, fullMark: 100 },
                    ];

                    return (
                        <div key={product.unique_id || index}>
                            <ProductCard product={product} rank={rank}>
                                <RadarChart data={chartData} color="#3b82f6" />
                            </ProductCard>
                        </div>
                    );
                })}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/ranking"
            />

        </main>
    );
}