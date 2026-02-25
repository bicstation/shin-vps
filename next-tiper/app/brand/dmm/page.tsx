/* /app/brand/dmm/page.tsx (またはルートの構成に応じて) */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '../ArchiveTemplate'; 
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getDmmDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'DMM Archive | TIPER Archive',
    description: 'DMM.R18 / FANZA 共通基盤を含むアーカイブデータを統合解析。',
};

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
 * 🛠️ 補助関数: ブランド（DMM/COMMON）に属するもののみフィルタリング
 */
const filterByBrand = (list: any) => {
    const rawList = safeExtract(list);
    return rawList.filter((item: any) => {
        const source = (item.api_source || '').toUpperCase(); 
        return source === 'DMM' || source === 'COMMON' || source === '';
    });
};

/**
 * 🔳 DMM_BRAND_ROOT_PAGE
 * DMMブランドの全データを統括するメインハブページ。
 */
export default async function DmmBrandPage(props: {
    searchParams: Promise<{ 
        page?: string; 
        sort?: string; 
        service?: string; 
        floor?: string;
        debug?: string; 
     }>;
}) {
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';
    
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. データ取得（DMM特化の全方位フェッチ） ---
    // 司令塔(ArchiveTemplate)のサイドバーを埋め尽くすための全マスタデータを取得します。
    const startTime = Date.now();
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
            api_source: 'dmm',
            page: currentPage,
            ordering: currentSort,
            api_service: currentService,
            floor_code: currentFloor,
        }).catch(() => ({ results: [], count: 0 })),
        
        getDmmDynamicMenu().catch(() => ({})), 

        fetchMakers({ limit: 40, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'dmm', ordering: '-product_count' }).catch(() => []), 
        fetchSeries({ limit: 30, api_source: 'dmm' }).catch(() => []), 
        fetchDirectors({ limit: 30, api_source: 'dmm' }).catch(() => []),
        fetchAuthors({ limit: 30, api_source: 'dmm' }).catch(() => []),
        fetchLabels({ limit: 30, api_source: 'dmm' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);
    const duration = Date.now() - startTime;

    // --- 🛡️ 2. サイドバー用階層データの整理 ---
    const dmmHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            href: `/brand/dmm/svc/${content.code}/${f.code}`, // フロア階層へ
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            href: `/brand/dmm/svc/${content.code}`, // サービス階層へ
            floors: floorItems,
            items: floorItems,
            active: currentService === content.code,
        };
    }).filter(item => item.floors.length > 0);

    return (
        <>
            {/* 🐞 診断ツール */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        fetchTime: `${duration}ms`,
                        mode: 'SERVER_DMM_HUB_V4',
                        platform: 'dmm',
                        productCount: productData.count,
                    }}
                    raw={{ dmmHierarchy, currentService, currentFloor }}
                />
            )}

            <ArchiveTemplate 
                platform="dmm"
                title={currentFloor ? `DMM - ${currentFloor.toUpperCase()}` : "DMM ARCHIVE"}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 🛰️ 司令塔(ArchiveTemplate)に全データをパス
                officialHierarchy={dmmHierarchy} 
                makers={filterByBrand(makersArray)}
                genres={filterByBrand(genresArray)}
                actresses={filterByBrand(actressesArray)} 
                authors={filterByBrand(authorsArray)} 
                series={filterByBrand(seriesArray)}
                directors={filterByBrand(directorsArray)}
                labels={filterByBrand(labelsArray)}
                
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                currentPage={currentPage}
                currentSort={currentSort}
                basePath="/brand/dmm"
                categoryPathPrefix="/brand/dmm/cat"
                
                extraParams={{ 
                    service: currentService,
                    floor: currentFloor,
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}