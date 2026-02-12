/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - DUGA Intelligence Listing (Server Entry)
 * ==============================================================================
 */
import React from 'react';
import { Metadata } from 'next';
import { getAdultProducts, fetchMakers, fetchGenres } from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import DugaPageView from './DugaPageView'; // 下記のクライアントビューをインポート

/**
 * ✅ 1. メタデータ生成 (Server Componentのみで動作)
 */
export async function generateMetadata(): Promise<Metadata> {
    return constructMetadata(
        "DUGA 統合アーカイブ | 市場解析データ一覧",
        "DUGAプラットフォームの全作品をAI解析。個人出版からメーカー作品まで、最新の流通データを可視化しています。",
        undefined,
        "/brand/duga"
    );
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * 🎬 DUGA 統合一覧ページ (サーバーサイドロジック)
 */
export default async function DugaPage({ searchParams }: { searchParams: Promise<any> }) {
    const sParams = await searchParams;
    
    const limit = 24;
    const offset = Number(sParams.offset) || 0;
    const ordering = sParams.ordering || '-release_date';

    // --- データフェッチ ---
    const [data, makersData, genresData, wpData] = await Promise.all([
        getAdultProducts({ 
            api_source: 'duga', 
            offset, 
            ordering, 
            limit 
        }, '/unified-adult-products/').catch(() => ({ results: [], count: 0 })),
        
        fetchMakers({ limit: 100, ordering: '-product_count' }).catch(() => []),
        fetchGenres({ limit: 100, ordering: '-product_count' }).catch(() => []),
        getSiteMainPosts(0, 5).catch(() => ({ results: [] }))
    ]);

    // Viewに必要なデータをPropsとして渡す
    return (
        <DugaPageView 
            data={data}
            makersData={makersData}
            genresData={genresData}
            wpData={wpData}
            offset={offset}
            ordering={ordering}
        />
    );
}