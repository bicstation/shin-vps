import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '../ArchiveTemplate';
import { getUnifiedProducts, fetchMakers, fetchGenres } from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'DMM Archive | TIPER Archive',
    description: 'DMM.R18 / FANZA 共通基盤を含むアーカイブデータを統合。',
};

export default async function DmmBrandPage(props: {
    searchParams: Promise<{ page?: string; sort?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    const queryParams = {
        api_source: 'DMM', // DMMソースを指定
        page: currentPage,
        ordering: currentSort,
    };

    const [productData, makersRaw, genresRaw, wpData] = await Promise.all([
        getUnifiedProducts(queryParams).catch(() => ({ results: [], count: 0 })),
        fetchMakers({ limit: 15, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 15, ordering: '-product_count' }).catch(() => ({ results: [] })),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    return (
        <ArchiveTemplate 
            platform="dmm"
            title="DMM ARCHIVE"
            products={productData.results}
            totalCount={productData.count}
            makers={makersRaw.results}
            genres={genresRaw.results}
            recentPosts={wpData.results?.map((p: any) => ({
                id: p.id,
                title: p.title.rendered,
                slug: p.slug
            }))}
            currentPage={currentPage}
            currentSort={currentSort}
            basePath="/brand/dmm"
        />
    );
}