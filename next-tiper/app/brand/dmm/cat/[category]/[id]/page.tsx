/* /app/brand/dmm/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // DMM系は1時間キャッシュ

// メタデータの生成
export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { category, id } = await params;
    const title = `DMM ${category.toUpperCase()} (ID:${id}) アーカイブ | TIPER`;
    return constructMetadata(
        title,
        `DMM/FANZAの${category} (ID:${id}) カテゴリーに属する全作品リスト。`,
        undefined,
        `/brand/dmm/${category}/${id}`
    );
}

/**
 * DMM/FANZA カテゴリー詳細ページ
 * 🛠️ 司令塔(ArchiveTemplate)へ、サイドバー網羅用の全データを供給します。
 */
export default async function DmmCategoryPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}) {
    // App Router の仕様に基づき Promise を解決
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { category, id } = resolvedParams;

    // パラメータの整理
    const limit = 24;
    const sort = resolvedSearchParams.sort || '-release_date';
    const currentPage = Number(resolvedSearchParams.page || 1);
    const offset = resolvedSearchParams.offset 
        ? Number(resolvedSearchParams.offset) 
        : (currentPage - 1) * limit;

    // --- 🚀 統合APIパラメータの構築 ---
    const apiParams: any = {
        api_source: 'fanza', 
        offset: offset,
        ordering: sort,
        limit: limit,
    };

    // カテゴリーに応じたフィルタリングキーを設定
    if (category === 'genre') apiParams.genre_id = id;
    else if (category === 'maker') apiParams.maker_id = id;
    else if (category === 'actress') apiParams.actress_id = id;
    else if (category === 'series') apiParams.series_id = id;
    else if (category === 'author') apiParams.author_id = id;
    else if (category === 'director') apiParams.director_id = id;
    else if (category === 'label') apiParams.label_id = id;

    // --- 📡 サイドバー網羅のための並列データフェッチ ---
    // ここで取得したデータが、ArchiveTemplate を通じてサイドバーに反映されます。
    const [
        dataRes, 
        dynamicMenu, 
        makersRes, 
        genresRes, 
        actressesRes,
        seriesRes,
        authorsRes,
        directorsRes,
        labelsRes
    ] = await Promise.all([
        getAdultProducts(apiParams, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        getFanzaDynamicMenu().catch(() => ({})),
        fetchMakers({ limit: 20, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 30, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchActresses({ limit: 20, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchSeries({ limit: 15 }).catch(() => ({ results: [] })),
        fetchAuthors({ limit: 15 }).catch(() => ({ results: [] })),
        fetchDirectors({ limit: 15 }).catch(() => ({ results: [] })),
        fetchLabels({ limit: 15 }).catch(() => ({ results: [] })),
    ]);

    return (
        <ArchiveTemplate 
            products={dataRes?.results || []}
            totalCount={dataRes?.count || 0}
            platform="dmm" 
            title={`DMM ${category.toUpperCase()}: ${id}`}
            
            // --- 🛰️ サイドバーへ供給する網羅データ ---
            officialHierarchy={dynamicMenu} 
            makers={makersRes?.results || []}
            genres={genresRes?.results || []}
            actresses={actressesRes?.results || []}
            series={seriesRes?.results || []}
            authors={authorsRes?.results || []}
            directors={directorsRes?.results || []}
            labels={labelsRes?.results || []}

            currentSort={sort}
            currentPage={currentPage}
            basePath={`/brand/dmm/${category}/${id}`}
            category={category}
            id={id}
        />
    );
}