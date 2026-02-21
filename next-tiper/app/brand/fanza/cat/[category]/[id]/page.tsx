/* /app/brand/fanza/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    fetchActresses, 
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

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
 * 🔳 FANZA_CATEGORY_DETAIL_PAGE (商品一覧)
 */
export default async function FanzaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // カテゴリキーの正規化 (API引数名に変換)
    // actress -> actress_id, maker -> maker_id ...
    const categoryKey = `${category}_id`;

    // --- 🏗️ 1. データ取得（並列） ---
    const [
        productData, 
        dynamicMenu, 
        makersArray, 
        genresArray, 
        actressesArray,
        seriesArray,
        directorsArray,
        authorsArray,
        labelsArray,
        wpData
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'fanza',
            [categoryKey]: id, // 動的にカテゴリIDを指定
            page: currentPage,
            ordering: currentSort,
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 

        fetchMakers({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchSeries({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchDirectors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchLabels({ limit: 40, api_source: 'fanza' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // 該当するアイテムの名前を特定するロジック（簡易版）
    // 本来は各カテゴリの単体取得APIを叩くのが理想ですが、一覧から探します
    const allMaster = [
        ...safeExtract(makersArray), 
        ...safeExtract(genresArray), 
        ...safeExtract(actressesArray),
        ...safeExtract(authorsArray),
        ...safeExtract(seriesArray)
    ];
    const currentItem = allMaster.find(m => String(m.slug) === id || String(m.id) === id);
    const displayName = currentItem ? currentItem.name : id.toUpperCase();

    // --- 🛡️ 2. サイドバー用データの整理 ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
        }));
        return {
            id: content.code,
            name: serviceName,
            service_code: content.code,
            floors: floorItems,
        };
    }).filter(item => item.floors.length > 0);

    return (
        <>
            {/* 🐞 デバッグモード */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id={`FANZA_CAT_${category}_${id}`}
                    source="FANZA"
                    data={{
                        category,
                        targetId: id,
                        totalCount: productData.count,
                        apiParam: categoryKey
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={`${category.toUpperCase()}: ${decodeURIComponent(displayName)}`}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 共通サイドバーデータ
                officialHierarchy={fanzaHierarchy} 
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)}
                actresses={safeExtract(actressesArray)}
                authors={safeExtract(authorsArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                labels={safeExtract(labelsArray)}
                
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}

                currentPage={currentPage}
                currentSort={currentSort}
                
                // ページネーションとパンくず用
                basePath={`/brand/fanza/cat/${category}/${id}`}
                categoryPathPrefix="/brand/fanza/cat" 
                category={category}
                id={id}

                extraParams={{ 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}