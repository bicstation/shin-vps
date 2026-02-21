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
    description: 'DMM.R18 / FANZA 共通基盤を含むアーカイブデータを統合。',
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

    // --- 🏗️ 1. データ取得（並列・DMM特化） ---
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

        fetchMakers({ limit: 40, api_source: 'dmm' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'dmm' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'dmm' }).catch(() => []), 
        fetchSeries({ limit: 40, api_source: 'dmm' }).catch(() => []), 
        fetchDirectors({ limit: 40, api_source: 'dmm' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'dmm' }).catch(() => []),
        fetchLabels({ limit: 40, api_source: 'dmm' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);
    const duration = Date.now() - startTime;

    // --- 🛡️ 2. サイドバー用データの整理 ---
    // 🚀 スクショの構造 `svc/[service]/[floor]` に基づくリンク生成
    const dmmHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            // 💡 修正: /brand/dmm/svc/[service]/[floor] 形式
            href: `/brand/dmm/svc/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            // 💡 修正: サービス単体は /brand/dmm/svc/[service] (その下のpage.tsxで処理)
            href: `/brand/dmm/svc/${content.code}`,
            floors: floorItems,
            items: floorItems,
            active: currentService === content.code,
        };
    });

    const filteredActresses = filterByBrand(actressesArray);
    const filteredMakers = filterByBrand(makersArray);
    const filteredGenres = filterByBrand(genresArray);
    const filteredSeries = filterByBrand(seriesArray);
    const filteredDirectors = filterByBrand(directorsArray);
    const filteredAuthors = filterByBrand(authorsArray);
    const filteredLabels = filterByBrand(labelsArray);

    return (
        <>
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        fetchTime: `${duration}ms`,
                        mode: 'SERVER_DMM_PAGE_V4',
                        platform: 'dmm',
                        productCount: productData.count,
                    }}
                    raw={{ dmmHierarchy, params: { currentService, currentFloor } }}
                />
            )}

            <ArchiveTemplate 
                platform="dmm"
                title={currentFloor ? `DMM - ${currentFloor.toUpperCase()}` : "DMM ARCHIVE"}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                officialHierarchy={dmmHierarchy} 
                
                makers={filteredMakers}
                genres={filteredGenres}
                actresses={filteredActresses} 
                authors={filteredAuthors} 
                series={filteredSeries}
                directors={filteredDirectors}
                labels={filteredLabels}
                
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