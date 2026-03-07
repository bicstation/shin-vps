/* /app/brand/dmm/cat/[category]/[id]/page.tsx */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';

/**
 * 🛰️ API インポート
 * 物理構造 shared/lib/api/django/adult.ts に準拠
 */
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getDmmDynamicMenu 
} from '@/shared/lib/api/django/adult';

// ✅ Django Bridge 経由での WP 取得
import { getWpPostsFromBridge } from '@/shared/lib/api/django-bridge';

/**
 * ✅ 修正: 物理構造 shared/lib/utils/metadata.ts に合わせる
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; 

/**
 * 🛠️ 補助関数: 安全なデータ抽出
 */
const safeExtract = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
};

/**
 * 🛡️ DMMソースに限定してフィルタリング
 */
const filterByBrand = (list: any) => {
    const rawList = safeExtract(list);
    return rawList.filter((item: any) => {
        const source = (item.api_source || '').toUpperCase(); 
        return source === 'DMM' || source === 'COMMON' || source === '';
    });
};

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata(props: { params: Promise<{ category: string; id: string }> }): Promise<Metadata> {
    const { category, id } = await props.params;
    const decodedId = decodeURIComponent(id);
    
    // ✅ constructMetadata の引数をオブジェクト形式に修正
    return constructMetadata({
        title: `DMM ${category.toUpperCase()} [${decodedId}] アーカイブ解析 | TIPER`,
        description: `DMM/FANZAの${category}軸（ID:${decodedId}）に基づいた全作品アーカイブ。`,
        canonical: `/brand/dmm/cat/${category}/${id}`
    });
}

/**
 * 🔳 DMM_CATEGORY_DETAIL_PAGE
 * 役割: 特定のタクソノミー（女優・メーカー等）に紐づく作品一覧の表示
 */
export default async function DmmCategoryPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string; debug?: string }>;
}) {
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    
    const { category, id } = resolvedParams;
    const limit = 24;
    const sort = resolvedSearchParams.sort || '-release_date';
    const currentPage = Number(resolvedSearchParams.page || 1);
    const offset = resolvedSearchParams.offset 
        ? Number(resolvedSearchParams.offset) 
        : (currentPage - 1) * limit;

    // APIパラメータの構築
    const apiParams: any = {
        api_source: 'dmm', 
        offset: offset,
        ordering: sort,
        limit: limit,
    };

    const categoryKeyMap: Record<string, string> = {
        genre: 'genre_id',
        maker: 'maker_id',
        actress: 'actress_id',
        series: 'series_id',
        author: 'author_id',
        director: 'director_id',
        label: 'label_id'
    };

    if (categoryKeyMap[category]) {
        apiParams[categoryKeyMap[category]] = id;
    }

    /**
     * 📡 並列データフェッチ
     */
    const [
        dataRes, 
        dynamicMenu, 
        bridgeCmsData,
        makersRes, 
        genresRes, 
        actressesRes,
        seriesRes,
        authorsRes,
        directorsRes,
        labelsRes
    ] = await Promise.all([
        getAdultProducts(apiParams, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        getDmmDynamicMenu().catch(() => ({})),
        getWpPostsFromBridge({ limit: 8, brand: 'dmm' }).catch(() => ({ results: [] })),
        fetchMakers({ limit: 12, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 20, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchActresses({ limit: 12, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchSeries({ limit: 10, api_source: 'dmm' }).catch(() => []), 
        fetchAuthors({ limit: 10, api_source: 'dmm' }).catch(() => []),
        fetchDirectors({ limit: 10, api_source: 'dmm' }).catch(() => []),
        fetchLabels({ limit: 10, api_source: 'dmm' }).catch(() => []),
    ]);

    return (
        <ArchiveTemplate 
            products={dataRes?.results || []}
            totalCount={dataRes?.count || 0}
            platform="dmm"
            title={`${category.toUpperCase()}: ${decodeURIComponent(id)}`}
            
            // サイドバー・ナビゲーション
            officialHierarchy={dynamicMenu} 
            makers={filterByBrand(makersRes)}
            genres={filterByBrand(genresRes)}
            actresses={filterByBrand(actressesRes)} 
            series={filterByBrand(seriesRes)}
            authors={filterByBrand(authorsRes)} 
            directors={filterByBrand(directorsRes)}
            labels={filterByBrand(labelsRes)}

            // ✅ Bridge データの安全なマッピング
            recentPosts={safeExtract(bridgeCmsData).map((p: any) => ({
                id: p.id,
                title: p.title || p.rendered_title || 'No Title',
                slug: p.slug,
                date: p.date
            }))}

            // 状態伝播
            currentSort={sort}
            currentPage={currentPage}
            basePath={`/brand/dmm/cat/${category}/${id}`}
            category={category}
            id={id}
            extraParams={{ debug: resolvedSearchParams.debug }}
        />
    );
}