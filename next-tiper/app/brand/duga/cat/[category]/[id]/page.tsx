/* /app/brand/duga/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { 
    getUnifiedProducts, 
    fetchAdultTaxonomyIndex, 
} from '@shared/lib/api/django/adult';

import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

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
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    return {
        title: `DUGA ${category.toUpperCase()} : ${id} | ARCHIVE_SCAN`,
        description: `DUGAの${category} ID: ${id} に基づく商品アーカイブ。`,
    };
}

/**
 * 🔳 DUGA_CATEGORY_DETAIL_PAGE (商品一覧)
 * 司令塔(ArchiveTemplate)へ、DUGA専用のサイドバーデータを供給します。
 */
export default async function DugaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    // 1. パラメータの解決
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // バックエンドの命名規則に合わせる
    const taxonomyType = category === 'actress' ? 'actresses' : `${category}s`;
    
    // DUGAのAPI引数名に変換
    const categoryKey = `${category}_id`;

    // --- 🏗️ 2. データ取得（並列実行・DUGA特化） ---
    // 他ブランドと同様、サイドバーを埋めるために全タクソノミーを取得。
    const [
        productData, 
        makersRes, 
        genresRes, 
        actressesRes,
        seriesRes,
        directorsRes,
        authorsRes,
        labelsRes,
        wpData
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'duga',
            [categoryKey]: id,
            page: currentPage,
            ordering: currentSort,
            limit: 24
        }).catch(() => ({ results: [], count: 0 })),
        
        // 🚀 DUGAソースのマスタを確実に取得
        fetchAdultTaxonomyIndex('makers', { limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('genres', { limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('actresses', { limit: 40, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('series', { limit: 30, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('directors', { limit: 30, api_source: 'duga' }).catch(() => ({ results: [] })),
        fetchAdultTaxonomyIndex('authors', { limit: 20, api_source: 'duga' }).catch(() => ({ results: [] })),
        fetchAdultTaxonomyIndex('labels', { limit: 20, api_source: 'duga' }).catch(() => ({ results: [] })),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // 表示タイトルの特定
    const allMaster = [
        ...safeExtract(makersRes), 
        ...safeExtract(genresRes), 
        ...safeExtract(actressesRes)
    ];
    const currentItem = allMaster.find(m => String(m.slug) === id || String(m.id) === id);
    const displayName = currentItem ? currentItem.name : id.toUpperCase();

    return (
        <>
            {/* 🐞 デバッグモード */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id={`DUGA_CAT_${category}_${id}`}
                    source="DUGA"
                    data={{
                        category,
                        targetId: id,
                        totalCount: productData.count,
                        taxonomyType
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga"
                title={`DUGA ${category.toUpperCase()}: ${decodeURIComponent(displayName)}`}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 🛰️ サイドバーへの全データ供給（DUGA専用）
                makers={safeExtract(makersRes)}
                genres={safeExtract(genresRes)}
                actresses={safeExtract(actressesRes)}
                series={safeExtract(seriesRes)}
                directors={safeExtract(directorsRes)}
                authors={safeExtract(authorsRes)}
                labels={safeExtract(labelsRes)}
                
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}

                currentPage={currentPage}
                currentSort={currentSort}
                
                // パンくず・ページネーション用
                basePath={`/brand/duga/cat/${category}/${id}`}
                categoryPathPrefix="/brand/duga/cat" 
                category={category}
                id={id}

                extraParams={{ 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}