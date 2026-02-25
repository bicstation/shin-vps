/* /app/brand/dmm/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
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
import { constructMetadata } from '@shared/lib/metadata';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `DMM.com ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    return constructMetadata(
        title, 
        `DMM.comの${service}内${floor}フロアを解析。最新リリースと市場動向をトラッキングします。`,
        undefined,
        `/brand/dmm/svc/${service}/${floor}`
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
 * 🔳 DMM_FLOOR_LIST_PAGE (Structured Layout)
 * DMM特有のサービス/フロア階層を ArchiveTemplate に適合させて流し込みます。
 */
export default async function DmmFloorListPage(props: {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string; debug?: string }>;
}) {
    // 1. パラメータの解決
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { service, floor } = resolvedParams;
    
    const isDebug = resolvedSearchParams?.debug === 'true';
    const sort = resolvedSearchParams.sort || '-release_date';
    const limit = 24;
    const currentPage = Number(resolvedSearchParams.page) || 1;

    // --- 🏗️ 2. データ取得（並列） ---
    // サイドバーを「全サービス・全フロア」で埋めるために網羅的にフェッチします。
    const [
        dataRes, 
        dynamicMenu, 
        makersArray, 
        genresArray, 
        actressesArray,
        seriesArray,
        directorsArray,
        authorsArray,
        labelsArray,
        wRes
    ] = await Promise.all([
        getUnifiedProducts({ 
            api_source: 'dmm',
            service: service, 
            floor: floor,
            page: currentPage,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        
        getDmmDynamicMenu().catch(() => ({})), 

        fetchMakers({ limit: 30, api_source: 'dmm', ordering: '-product_count' }).catch(() => []),
        fetchGenres({ limit: 40, api_source: 'dmm', ordering: '-product_count' }).catch(() => []),
        fetchActresses({ limit: 20, api_source: 'dmm' }).catch(() => []),
        fetchSeries({ limit: 15, api_source: 'dmm' }).catch(() => []),
        fetchDirectors({ limit: 15, api_source: 'dmm' }).catch(() => []),
        fetchAuthors({ limit: 15, api_source: 'dmm' }).catch(() => []),
        fetchLabels({ limit: 15, api_source: 'dmm' }).catch(() => []),
        
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 3. サイドバー用データの整理（DMM階層構造をサイドバー用に正規化） ---
    const dmmHierarchy = Object.entries(dynamicMenu || {}).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            href: `/brand/dmm/svc/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: serviceName, // '動画', '電子書籍' など
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            floors: floorItems,
            active: service === content.code, // 現在選択中のサービスを強調
        };
    }).filter(item => item.floors.length > 0);

    // --- 🎨 4. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 デバッグモード用オーバーレイ */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id={`DMM_SVC_${service}_${floor}`}
                    source="DMM"
                    data={{
                        service,
                        floor,
                        totalCount: dataRes.count,
                        currentPage,
                        apiStatus: dataRes.results?.length > 0 ? 'OK' : 'EMPTY'
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="dmm"
                title={`${floor.toUpperCase()} SECTOR`}
                products={dataRes.results || []}
                totalCount={dataRes.count || 0}
                
                // 🛰️ サイドバーへの全データ供給
                officialHierarchy={dmmHierarchy} 
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)} 
                actresses={safeExtract(actressesArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                authors={safeExtract(authorsArray)}
                labels={safeExtract(labelsArray)}
                
                recentPosts={safeExtract(wRes).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                currentPage={currentPage}
                currentSort={sort}
                
                // ナビゲーションパスの整合性
                basePath={`/brand/dmm/svc/${service}/${floor}`}
                categoryPathPrefix="/brand/dmm/cat" 
                
                extraParams={{ 
                    service, 
                    floor, 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}