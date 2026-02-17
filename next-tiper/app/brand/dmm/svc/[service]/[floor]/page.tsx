/* /app/brand/dmm/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    getDmmDynamicMenu // 💡 getFanzaDynamicMenu から getDmmDynamicMenu に変更
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';

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
 * 🔳 DMM_FLOOR_LIST_PAGE (Structured Layout)
 */
export default async function DmmFloorListPage(props: {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}) {
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { service, floor } = resolvedParams;
    
    const sort = resolvedSearchParams.sort || '-release_date';
    const limit = 24;
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const currentOffset = resolvedSearchParams.offset 
        ? Number(resolvedSearchParams.offset) 
        : (currentPage - 1) * limit;

    // --- 🏗️ 1. データ取得（並列） ---
    const [dataRes, dynamicMenu, mRes, gRes, wRes] = await Promise.all([
        getAdultProducts({
            api_source: 'dmm',
            service_code: service,
            floor_code: floor,
            offset: currentOffset,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        
        // 🚀 「表示されるコード」と同じ関数を使用
        getDmmDynamicMenu().catch(() => ({})), 
        
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（「表示されるコード」を完全再現） ---
    // getDmmDynamicMenuの結果を直接Object.entriesで回します
    const dmmHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            // 💡 階層構造に合わせた href
            href: `/brand/dmm/svc/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            floors: floorItems,
            items: floorItems,
            active: service === content.code,
        };
    });

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    // --- 🎨 3. ArchiveTemplate への流し込み ---
    return (
        <ArchiveTemplate 
            platform="dmm"
            title={`${floor.toUpperCase()} SECTOR`}
            products={dataRes.results || []}
            totalCount={dataRes.count || 0}
            
            // 🚀 正しく整形された階層データ
            officialHierarchy={dmmHierarchy} 
            
            makers={safeExtract(mRes)}
            genres={[]} 
            recentPosts={safeExtract(wRes).map((p: any) => ({
                id: p.id,
                title: p.title?.rendered || 'No Title',
                slug: p.slug,
            }))}
            
            currentPage={currentPage}
            currentSort={sort}
            currentService={service}
            currentFloor={floor}
            
            basePath={`/brand/dmm/svc/${service}/${floor}`}
            extraParams={{ 
                brand: 'dmm'
            }}
        />
    );
}