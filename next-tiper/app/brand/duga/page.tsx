/* /app/brand/duga/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 

/**
 * 🛰️ API インポートセクション
 * 物理構造 shared/lib/api/ 配下を参照
 */
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels
} from '@/shared/lib/api/django/adult';

// ✅ ツリー上の api/index.ts または django.ts から WordPress 系の取得関数を想定
import { fetchPostData as getSiteMainPosts } from '@/shared/lib/api/index'; 

/**
 * ✅ 修正: 物理構造 shared/lib/utils/metadata.ts に合わせる
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

/**
 * ✅ 修正: 物理構造 shared/components/molecules/SystemDiagnosticHero.tsx に合わせる
 */
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata(): Promise<Metadata> {
    return constructMetadata({
        title: 'DUGA Archive | TIPER Archive',
        description: 'DUGA（デュガ）プラットフォームの特化型アーカイブ。独自メーカーや人気著者の解析データを網羅。',
        canonical: '/brand/duga'
    });
}

/**
 * 🛠️ Helper: 安全なデータ抽出
 */
const safeExtract = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
};

/**
 * 🔳 DUGA_BRAND_PAGE
 */
export default async function DugaBrandPage(props: {
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // --- 🏗️ 1. データ取得（DUGA専用パラレルフェッチ） ---
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

        // API定義に合わせて引数を調整（例: fetchPostData('duga', slug) 等）
        getSiteMainPosts('duga', '').catch(() => ({ results: [] }))
    ]);

    // --- 🎨 2. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 デバッグ診断: パス修正済み */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'SERVER_BRAND_PAGE_V4',
                        fetchTime: 'Parallel-Duga',
                        platform: 'DUGA',
                        productCount: productData?.count || 0,
                    }}
                    raw={{
                        records: productData?.results?.length,
                        currentPage
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga" 
                title="DUGA ARCHIVE"
                products={productData?.results || []}
                totalCount={productData?.count || 0}
                
                // 🛰️ サイドバーデータ供給
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                labels={safeExtract(labelsArray)}
                actresses={safeExtract(actressesArray)}
                authors={safeExtract(authorsArray)}
                
                // DUGAは階層メニューが現在無いため空配列
                officialHierarchy={[]}

                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || p.title || 'No Title',
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