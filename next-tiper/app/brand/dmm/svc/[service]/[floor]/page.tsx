/* /app/brand/dmm/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';

/**
 * 🛰️ API インポート
 * 物理構造 shared/lib/api/django/adult.ts に準拠
 */
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
} from '@/shared/lib/api/django/adult';

/**
 * ✅ 修正: Bridge 経由での取得に変更
 */
import { getWpPostsFromBridge } from '@/shared/lib/api/django-bridge';

/**
 * ✅ 修正: 物理構造 shared/lib/utils/metadata.ts に合わせる
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 

/**
 * ✅ 修正: 物理構造 shared/components/molecules/SystemDiagnosticHero.tsx に合わせる
 */
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';
export const revalidate = 60; 

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `DMM.com ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    
    return constructMetadata({
        title, 
        description: `DMM.comの${service}内${floor}フロアを解析。最新リリースと市場動向をトラッキングします。`,
        canonical: `/brand/dmm/svc/${service}/${floor}`
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
 * 🔳 DMM_FLOOR_LIST_PAGE
 * 役割: サービス/フロア階層を正規化し、ArchiveTemplateへ統合データを供給する。
 */
export default async function DmmFloorListPage(props: {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string; debug?: string }>;
}) {
    // 1. パラメータの非同期解決
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    const { service, floor } = resolvedParams;
    
    const isDebug = resolvedSearchParams?.debug === 'true';
    const sort = resolvedSearchParams.sort || '-release_date';
    const limit = 24;
    const currentPage = Number(resolvedSearchParams.page) || 1;

    // 2. 📡 並列データフェッチ
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
        bridgeCms
    ] = await Promise.all([
        getUnifiedProducts({ 
            api_source: 'dmm',
            api_service: service, // key名を getUnifiedProducts の期待値に合わせる
            floor_code: floor,    // key名を getUnifiedProducts の期待値に合わせる
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
        
        getWpPostsFromBridge({ limit: 8, brand: 'dmm' }).catch(() => ({ results: [] }))
    ]);

    // 3. 🛡️ 階層データの正規化
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
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            floors: floorItems,
            active: service === content.code,
        };
    }).filter(item => item.floors.length > 0);

    // 4. 🎨 ArchiveTemplate への流し込み
    return (
        <>
            {/* 🐞 診断ツール: shared/components/molecules/SystemDiagnosticHero.tsx */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'CORE_BRAND_SVC_STREAM',
                        platform: 'DMM',
                        fetchTime: 'Parallel-Bridge-Dmm',
                        productCount: dataRes?.count || 0,
                    }}
                    raw={{
                        service,
                        floor,
                        currentPage,
                        apiStatus: (dataRes.results?.length ?? 0) > 0 ? 'OK' : 'EMPTY'
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="dmm"
                title={`${floor.toUpperCase()} SECTOR`}
                products={dataRes?.results || []}
                totalCount={dataRes?.count || 0}
                
                // 🛰️ サイドバー・ナビゲーションデータ
                officialHierarchy={dmmHierarchy} 
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)} 
                actresses={safeExtract(actressesArray)}
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                authors={safeExtract(authorsArray)}
                labels={safeExtract(labelsArray)}
                
                recentPosts={safeExtract(bridgeCms).map((p: any) => ({
                    id: p.id,
                    title: p.title || p.rendered_title || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                currentPage={currentPage}
                currentSort={sort}
                
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