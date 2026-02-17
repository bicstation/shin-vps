/* /app/brand/duga/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; // 💡 相対パスを確認してください
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * 🛰️ METADATA_GENERATOR (DUGA)
 */
export async function generateMetadata(): Promise<Metadata> {
    return constructMetadata(
        'DUGA Archive | TIPER Archive',
        'DUGA（デュガ）プラットフォームの特化型アーカイブ。独自メーカーの解析データを網羅。',
        undefined,
        '/brand/duga'
    );
}

/**
 * 🔳 DUGA_BRAND_PAGE (Structured Layout)
 */
export default async function DugaBrandPage(props: {
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // --- 🏗️ 1. データ取得（並列） ---
    const [productData, makersRaw, genresRaw, wpData] = await Promise.all([
        getUnifiedProducts({
            api_source: 'DUGA',
            page: currentPage,
            ordering: currentSort,
        }).catch(() => ({ results: [], count: 0 })),
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => ({ results: [] })), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    // --- 🎨 2. ArchiveTemplate への流し込み ---
    return (
        <ArchiveTemplate 
            platform="duga" // 💡 テンプレート内でDUGAカラー（イエローやパープル等）に分岐
            title="DUGA ARCHIVE"
            products={productData.results || []}
            totalCount={productData.count || 0}
            
            // 補助マスタ
            makers={safeExtract(makersRaw)}
            genres={safeExtract(genresRaw)}
            
            // WPお知らせ
            recentPosts={safeExtract(wpData).map((p: any) => ({
                id: p.id,
                title: p.title?.rendered || 'No Title',
                slug: p.slug,
            }))}
            
            // 状態
            currentPage={currentPage}
            currentSort={currentSort}
            
            basePath="/brand/duga"
            extraParams={{ 
                brand: 'duga',
                debug: isDebug 
            }}
        />
    );
}