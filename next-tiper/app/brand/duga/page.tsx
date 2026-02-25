/* /app/brand/duga/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

/**
 * 🛰️ METADATA_GENERATOR (DUGA)
 */
export async function generateMetadata(): Promise<Metadata> {
    return constructMetadata(
        'DUGA Archive | TIPER Archive',
        'DUGA（デュガ）プラットフォームの特化型アーカイブ。独自メーカーの解析データを網羅。',
        undefined,
        '/brand/duga'
    );
}

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
 * 🔳 DUGA_BRAND_PAGE
 * DUGAブランドのトップページ。
 * 女優だけでなく「著者(Author)」が重要な役割を果たすDUGA独自のデータ構造をサイドバーに反映します。
 */
export default async function DugaBrandPage(props: {
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // --- 🏗️ 1. データ取得（DUGA特化型フェッチ） ---
    // DUGAに関連する全マスタデータを並列取得し、サイドバーの密度を最大化します。
    const [
        productData, 
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
            api_source: 'DUGA',
            page: currentPage,
            ordering: currentSort,
            limit: 24,
        }).catch(() => ({ results: [], count: 0 })),

        fetchMakers({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []),
        fetchSeries({ limit: 30, api_source: 'duga' }).catch(() => []),
        fetchDirectors({ limit: 20, api_source: 'duga' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []),
        fetchLabels({ limit: 20, api_source: 'duga' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🎨 2. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 診断ツール (DUGA Source) */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id="BRAND_DUGA_ARCHIVE"
                    source="DUGA"
                    data={{
                        mode: 'SERVER_BRAND_PAGE_V4',
                        totalProducts: productData.count,
                        records: productData.results?.length,
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga" 
                title="DUGA ARCHIVE"
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 🛰️ サイドバー・フルデータ供給
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                labels={safeExtract(labelsArray)}
                actresses={safeExtract(actressesArray)}
                authors={safeExtract(authorsArray)}
                
                // 階層データ (DUGAは現状APIによる動的メニューがないため空、または静的定義)
                officialHierarchy={[]}

                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                currentPage={currentPage}
                currentSort={currentSort}
                basePath="/brand/duga"
                categoryPathPrefix="/brand/duga/cat" 

                extraParams={{ 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}