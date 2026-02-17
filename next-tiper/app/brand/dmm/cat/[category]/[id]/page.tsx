/* /app/brand/dmm/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
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

export default async function DmmCategoryPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}) {
    // App Router の最新仕様に基づき Promise を解明
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { category, id } = resolvedParams;

    // パラメータの整理
    const limit = 24;
    const sort = resolvedSearchParams.sort || '-release_date';
    const offset = resolvedSearchParams.offset 
        ? Number(resolvedSearchParams.offset) 
        : (Number(resolvedSearchParams.page || 1) - 1) * limit;

    // --- 🚀 統合APIパラメータの構築 ---
    // APIが期待する形式（genre_id / maker_id / actress_id）にマッピング
    const apiParams: any = {
        api_source: 'fanza', // DMM商品の取得も現在はfanzaソース経由
        offset: offset,
        ordering: sort,
        limit: limit,
    };

    // カテゴリーに応じたフィルタリングキーを設定
    if (category === 'genre') apiParams.genre_id = id;
    else if (category === 'maker') apiParams.maker_id = id;
    else if (category === 'actress') apiParams.actress_id = id;
    else if (category === 'series') apiParams.series_id = id;

    // --- 📡 並列データフェッチ ---
    const [dataRes, dynamicMenu, makersData, genresData] = await Promise.all([
        // 商品一覧（統合APIを使用）
        getAdultProducts(apiParams, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        // 共通サイドメニュー（階層ナビゲーション）
        getFanzaDynamicMenu().catch(() => ({})),
        // 共通パーツ用
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] }))
    ]);

    return (
        <ArchiveTemplate 
            products={dataRes?.results || []}
            totalCount={dataRes?.count || 0}
            platform="dmm" // 🍊 オレンジテーマを適用
            title={`DMM ${category.toUpperCase()}: ${id}`}
            makers={makersData?.results || []}
            genres={genresData?.results || []}
            officialHierarchy={dynamicMenu} // 💡 共通サイドメニューを流し込み
            currentSort={sort}
            currentOffset={offset}
            basePath={`/brand/dmm/${category}/${id}`}
            category={category}
            id={id}
        />
    );
}