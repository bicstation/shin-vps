/* /app/brand/dmm/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - DMM Floor Listing Page (Server Entry)
 * ==============================================================================
 */
import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@shared/lib/metadata';
import { 
    getAdultProducts, 
    fetchMakers, 
    fetchGenres, 
    getFanzaDynamicMenu // 💡 共通メニュー取得を追加
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import DmmFloorListView from '@/app/brand/dmm/svc/[service]/[floor]/DmmFloorListView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * ✅ メタデータ生成
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `DMM ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    return constructMetadata(
        title, 
        `DMM ${service}内 ${floor}フロアの作品データをAI解析。最新のリリース状況とマーケットシェアを可視化。`,
        undefined,
        `/brand/dmm/svc/${service}/${floor}`
    );
}

interface PageProps {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}

export default async function DmmFloorListPage(props: PageProps) {
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;

    const { service, floor } = resolvedParams;
    const sort = (Array.isArray(resolvedSearchParams.sort) ? resolvedSearchParams.sort[0] : resolvedSearchParams.sort) || '-release_date';
    const limit = 24;

    let currentOffset = 0;
    if (resolvedSearchParams.offset) {
        currentOffset = Number(resolvedSearchParams.offset) || 0;
    } else if (resolvedSearchParams.page) {
        const pageNum = Number(resolvedSearchParams.page) || 1;
        currentOffset = (pageNum - 1) * limit;
    }

    // --- 📡 最新のパラメータ名と並列データフェッチ ---
    const [dataRes, dynamicMenu, mRes, gRes, wRes] = await Promise.all([
        getAdultProducts({
            api_source: 'dmm',     // DMMデータも現在は統合ソース 'fanza' で管理
            service_code: service,   // 💡 service → service_code に修正
            floor_code: floor,       // 💡 floor → floor_code に修正
            offset: currentOffset,
            ordering: sort,
            limit: limit
        }, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), // 💡 サイドバー用の共通メニューを追加
        
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })),
        getSiteMainPosts(0, 5).catch(() => ({ results: [] }))
    ]);

    // Viewに必要なデータを渡す
    return (
        <DmmFloorListView 
            service={service}
            floor={floor}
            sort={sort}
            currentOffset={currentOffset}
            limit={limit}
            dataRes={dataRes}
            officialHierarchy={dynamicMenu} // 💡 これを渡してサイドバーに表示させる
            mRes={mRes}
            gRes={gRes}
            wRes={wRes}
        />
    );
}