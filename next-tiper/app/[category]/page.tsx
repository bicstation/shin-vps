/* app/[category]/page.tsx */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAdultTaxonomyIndex } from '@/shared/lib/api/django/adult';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';
import TaxonomyClientContent from './TaxonomyClientContent'; // 後ほど作成する子コンポーネント

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
    const titleMap: Record<string, string> = {
        genres: 'ジャンル一覧', actresses: '女優一覧', makers: 'メーカー一覧',
        series: 'シリーズ一覧', directors: '監督一覧', authors: '著者一覧',
    };
    const title = titleMap[params.category] || 'カテゴリ一覧';
    return {
        title: `${title} | 大人向け総合マトリックス`,
        description: `${title}を商品数順・50音順で自在にソートして探せます。`,
    };
}

export default async function CategoryTaxonomyPage({ params }: { params: { category: string } }) {
    const { category } = params;
    const validCategories = ['genres', 'actresses', 'makers', 'series', 'directors', 'authors'];
    if (!validCategories.includes(category)) notFound();

    const taxonomy = await fetchAdultTaxonomyIndex(category as any);

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <SystemDiagnosticHero 
                title={`${category.toUpperCase()} MASTER INDEX`}
                status="OPERATIONAL"
                stats={[
                    { label: 'DATA_POINTS', value: taxonomy.total_count },
                    { label: 'PATH_FORMAT', value: `/${category}/[slug]` },
                    { label: 'INDEX_STATUS', value: 'READY' }
                ]}
            />

            <div className="container mx-auto px-4 py-8">
                {/* 🚀 クライアントコンポーネントへデータを渡す */}
                <TaxonomyClientContent 
                    initialData={taxonomy.results} 
                    category={category} 
                    totalCount={taxonomy.total_count}
                />
            </div>
        </div>
    );
}