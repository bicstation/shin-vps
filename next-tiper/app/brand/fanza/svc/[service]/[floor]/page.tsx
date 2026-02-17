/* /app/brand/fanza/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    getFanzaDynamicMenu // 💡 階層メニュー取得を追加
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import FanzaFloorListView from '@/app/brand/fanza/svc/[service]/[floor]/FanzaFloorListView';


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
    const currentOffset = resolvedSearchParams.offset ? Number(resolvedSearchParams.offset) : (Number(resolvedSearchParams.page || 1) - 1) * limit;

    // --- 🚀 全データを並列フェッチ ---
    const [dataRes, dynamicMenu, mRes, gRes, wRes] = await Promise.all([
        getAdultProducts({
            api_source: 'fanza',
            service_code: service,
            floor_code: floor,
            offset: currentOffset,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        getFanzaDynamicMenu().catch(() => ({})), // 💡 サイドバー用の階層を取得
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        getSiteMainPosts(0, 5).catch(() => ({ results: [] }))
    ]);

    return (
        <FanzaFloorListView 
            service={service}
            floor={floor}
            sort={sort}
            currentOffset={currentOffset}
            limit={limit}
            dataRes={dataRes}
            officialHierarchy={dynamicMenu} // 💡 これをViewに渡す
            mRes={mRes}
            gRes={gRes}
            wRes={wRes}
        />
    );
}