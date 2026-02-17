/* /app/brand/fanza/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; // 💡 テンプレートに変更

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    return constructMetadata(
        title, 
        `FANZAの${service}内${floor}フロアを解析。`,
        undefined,
        `/brand/fanza/svc/${service}/${floor}`
    );
}

export default async function FanzaFloorListPage(props: {
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
            api_source: 'fanza',
            service_code: service,
            floor_code: floor,
            offset: currentOffset,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        getFanzaDynamicMenu().catch(() => ({})), 
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（FANZA形式） ---
    // APIレスポンスから "fanza" キーを安全に抽出
    const fanzaRawData = dynamicMenu?.fanza || dynamicMenu || {};
    const fanzaHierarchy = Object.entries(fanzaRawData).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
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
    }).filter(item => item.floors.length > 0);

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    // --- 🎨 3. ArchiveTemplate への流し込み ---
    return (
        <ArchiveTemplate 
            platform="fanza"
            title={`${floor.toUpperCase()} SECTOR`}
            products={dataRes.results || []}
            totalCount={dataRes.count || 0}
            
            officialHierarchy={fanzaHierarchy} 
            
            makers={safeExtract(mRes)}
            genres={safeExtract(gRes)} 
            
            recentPosts={safeExtract(wRes).map((p: any) => ({
                id: p.id,
                title: p.title?.rendered || 'No Title',
                slug: p.slug,
            }))}
            
            currentPage={currentPage}
            currentSort={sort}
            currentService={service}
            currentFloor={floor}
            
            basePath={`/brand/fanza/svc/${service}/${floor}`}
            extraParams={{ brand: 'fanza' }}
        />
    );
}