/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// ❌ headers削除

import { fetchPCProductDetail } from '@/shared/lib/api/django/pc/products';
import { fetchRelatedProducts, fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './ProductDetail.module.css';

import PriceHistoryChart from '@/shared/components/molecules/PriceHistoryChart';
import SpecRadarChart from '@/shared/components/atoms/RadarChart';
import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

interface PageProps {
    params: Promise<{ unique_id: string }>;
    searchParams: Promise<{ attribute?: string }>;
}

/** ✅ metadata修正 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { unique_id } = await props.params;

    const host = "bicstation.com"; // ← 固定
    const siteConfig = getSiteMetadata(host);
    
    try {
        const product = await fetchPCProductDetail(unique_id, host);
        if (!product) return { title: "製品が見つかりません" };

        const title = `${product.name} | ${product.maker}製品`;
        const description = `${product.name}の詳細レビュー・価格・スペック。`;

        return {
            title,
            description,
            alternates: { canonical: `https://${host}/product/${unique_id}` },
        };
    } catch {
        return { title: "製品詳細 | BICSTATION" };
    }
}

/** ✅ 本体 */
export default async function ProductDetailPage(props: PageProps) {
    const { unique_id } = await props.params;
    const { attribute } = await props.searchParams;

    const host = "bicstation.com"; // ← 固定
    const siteConfig = getSiteMetadata(host);

    const [product, rankingData] = await Promise.all([
        fetchPCProductDetail(unique_id, host).catch(() => null),
        fetchPCProductRanking('score', host).catch(() => [])
    ]);

    if (!product) notFound();

    const related = await fetchRelatedProducts(product.maker || '', unique_id, host).catch(() => []);

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>

                <h1>{product.name}</h1>

                <img src={product.image_url} alt={product.name} />

                <p>{product.price}</p>

                {product.ai_content && (
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {product.ai_content}
                    </ReactMarkdown>
                )}

                <div>
                    {related.map((item: any) => (
                        <Link key={item.unique_id} href={`/product/${item.unique_id}`}>
                            {item.name}
                        </Link>
                    ))}
                </div>

            </main>
        </div>
    );
}