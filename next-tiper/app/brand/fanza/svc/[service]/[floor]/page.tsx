/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - FANZA Floor Listing (Server Entry)
 * ==============================================================================
 */
import React from 'react';
import { Metadata } from 'next';
import { getAdultProducts, fetchMakers, fetchGenres } from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import FanzaFloorListView from './FanzaFloorListView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * ✅ 1. メタデータ生成 (Server Componentのみ許可)
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    return constructMetadata(
        title, 
        `FANZAの${service}内${floor}フロアをAI解析。最新のリリース動向、メーカーシェア、作品属性をデータ化しています。`,
        undefined,
        `/brand/fanza/${service}/${floor}`
    );
}

interface PageProps {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}

export default async function FanzaFloorListPage(props: PageProps) {
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

    // --- データフェッチ ---
    const [dataRes, mRes, gRes, wRes] = await Promise.all([
        getAdultProducts({
            api_source: 'fanza',
            service: service,
            floor: floor,
            offset: currentOffset,
            ordering: sort,
            limit: limit
        }, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        fetchMakers({ limit: 100, ordering: '-product_count' }).catch(() => []),
        fetchGenres({ limit: 100, ordering: '-product_count' }).catch(() => []),
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
            mRes={mRes}
            gRes={gRes}
            wRes={wRes}
        />
    );
}