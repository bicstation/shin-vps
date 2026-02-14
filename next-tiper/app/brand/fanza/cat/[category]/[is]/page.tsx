import React from 'react';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';

export default async function DmmCategoryPage({ params, searchParams }: any) {
    const { category, id } = params;
    const offset = parseInt(searchParams.offset || '0');
    const ordering = searchParams.ordering || 'new';

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // DMM専用APIからデータを取得
    const [productRes, makerRes, genreRes] = await Promise.all([
        fetch(`${baseUrl}/api/dmm/products/?${category}id=${id}&offset=${offset}&ordering=${ordering}`, { next: { revalidate: 3600 } }),
        fetch(`${baseUrl}/api/dmm/makers/`, { next: { revalidate: 86400 } }),
        fetch(`${baseUrl}/api/dmm/genres/`, { next: { revalidate: 86400 } })
    ]);

    const data = await productRes.json();
    const makersData = await makerRes.json();
    const genresData = await genreRes.json();

    return (
        <ArchiveTemplate 
            products={data?.results || []}
            totalCount={data?.count || 0}
            platform="dmm" // これでオレンジ系テーマが適用
            title={`DMM ${category.toUpperCase()}: ${id}`}
            makers={makersData?.results || []}
            genres={genresData?.results || []}
            currentSort={ordering}
            currentOffset={offset}
            basePath={`/brand/dmm/${category}/${id}`}
            category={category}
            id={id}
        />
    );
}