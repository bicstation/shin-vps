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
 * 🔳 DUGA_BRAND_PAGE (Structured Layout)
 */
export default async function DugaBrandPage(props: {
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // --- 🏗️ 1. データ取得（ブランド特化型リクエスト） ---
    // DUGAに関連するマスタデータのみをフィルタリングして取得
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
        }).catch(() => ({ results: [], count: 0 })),

        fetchMakers({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'duga' }).catch(() => []),
        fetchSeries({ limit: 40, api_source: 'duga' }).catch(() => []),
        fetchDirectors({ limit: 40, api_source: 'duga' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'duga' }).catch(() => []),
        fetchLabels({ limit: 40, api_source: 'duga' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🎨 2. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 デバッグモード (DUGA特化) */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id="BRAND_DUGA_ARCHIVE"
                    source="DUGA"
                    data={{
                        mode: 'SERVER_BRAND_PAGE',
                        totalProducts: productData.count,
                        makersFound: safeExtract(makersArray).length,
                        genresFound: safeExtract(genresArray).length,
                        authorsFound: safeExtract(authorsArray).length,
                    }}
                    rawJson={{ 
                        firstProduct: productData.results?.[0],
                        authorSample: safeExtract(authorsArray)[0]
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga" 
                title="DUGA ARCHIVE"
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 補助マスタ (DUGAに紐づくもの)
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                labels={safeExtract(labelsArray)}

                // 🚀 女優と著者を分離して渡す
                actresses={safeExtract(actressesArray)}
                authors={safeExtract(authorsArray)}
                
                // 階層データ (DUGAはフラットなため空配列)
                officialHierarchy={[]}

                // WP最新投稿
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                // 状態
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