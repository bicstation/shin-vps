/* /app/brand/duga/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';

/**
 * 🛰️ API インポート
 * 物理構造 shared/lib/api/django/adult.ts に準拠
 */
import { 
    getUnifiedProducts, 
    fetchAdultTaxonomyIndex, 
} from '@/shared/lib/api/django/adult';

/**
 * ✅ 修正: Django Bridge 経由での取得に変更
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
    const decodedId = decodeURIComponent(id);
    
    return constructMetadata({
        title: `DUGA ${category.toUpperCase()} : ${decodedId} | 市場アーカイブ解析`,
        description: `DUGA(デュガ)の${category}（ID: ${decodedId}）に属する作品リスト。TIPERによる独自市場解析データを網羅。`,
        canonical: `/brand/duga/cat/${category}/${id}`
    });
}

/**
 * 🔳 DUGA_CATEGORY_DETAIL_PAGE
 * 役割: DUGA専用のタクソノミーを統合し、ArchiveTemplateへ供給する。
 */
export default async function DugaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    // 1. パラメータの解決
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    const { category, id } = resolvedParams;

    const isDebug = resolvedSearchParams?.debug === 'true';
    const currentPage = Number(resolvedSearchParams?.page) || 1;
    const currentSort = resolvedSearchParams?.sort || '-release_date';

    // DUGAのAPI引数名に変換
    const categoryKey = `${category}_id`;

    // --- 🏗️ 2. 並列データ取得（DUGA特化フェッチ） ---
    const [
        productData, 
        makersRes, 
        genresRes, 
        actressesRes,
        seriesRes,
        directorsRes,
        authorsRes,
        labelsRes,
        bridgeCms
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'duga',
            [categoryKey]: id,
            page: currentPage,
            ordering: currentSort,
            limit: 24
        }).catch(() => ({ results: [], count: 0 })),
        
        // サイドバー用のマスタデータ
        fetchAdultTaxonomyIndex('makers', { limit: 20, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('genres', { limit: 30, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('actresses', { limit: 20, api_source: 'duga', ordering: '-product_count' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('series', { limit: 15, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('directors', { limit: 15, api_source: 'duga' }).catch(() => ({ results: [] })),
        fetchAdultTaxonomyIndex('authors', { limit: 15, api_source: 'duga' }).catch(() => ({ results: [] })),
        fetchAdultTaxonomyIndex('labels', { limit: 15, api_source: 'duga' }).catch(() => ({ results: [] })),

        getWpPostsFromBridge({ limit: 8, brand: 'duga' }).catch(() => ({ results: [] }))
    ]);

    // 3. 🔍 表示用タイトルの特定
    const allMaster = [
        ...safeExtract(makersRes), 
        ...safeExtract(genresRes), 
        ...safeExtract(actressesRes)
    ];
    const currentItem = allMaster.find(m => String(m.slug) === id || String(m.id) === id);
    const displayName = currentItem ? currentItem.name : id.toUpperCase();

    // 4. 🎨 ArchiveTemplate への統合
    return (
        <>
            {/* 🐞 診断ツール: shared/components/molecules/SystemDiagnosticHero.tsx */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'BRAND_CAT_DETAIL',
                        platform: 'DUGA',
                        fetchTime: 'Parallel-Bridge-Duga',
                        productCount: productData?.count || 0,
                    }}
                    raw={{
                        category,
                        targetId: id,
                        currentPage,
                        apiStatus: (productData.results?.length ?? 0) > 0 ? 'ACTIVE' : 'NO_DATA'
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga"
                title={`DUGA ${category.toUpperCase()}: ${decodeURIComponent(displayName)}`}
                products={productData?.results || []}
                totalCount={productData?.count || 0}
                
                // 🛰️ サイドバー供給データ
                makers={safeExtract(makersRes)}
                genres={safeExtract(genresRes)}
                actresses={safeExtract(actressesRes)}
                series={safeExtract(seriesRes)}
                directors={safeExtract(directorsRes)}
                authors={safeExtract(authorsRes)}
                labels={safeExtract(labelsRes)}
                
                recentPosts={safeExtract(bridgeCms).map((p: any) => ({
                    id: p.id,
                    title: p.title || p.rendered_title || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}

                currentPage={currentPage}
                currentSort={currentSort}
                
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