/* /app/brand/duga/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// 🚀 修正ポイント: ショートカット関数に頼らず、定義済みの fetchAdultTaxonomyIndex を直接使う
import { 
    getUnifiedProducts, 
    fetchAdultTaxonomyIndex, 
    getDmmDynamicMenu 
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
 */
export default async function DugaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    // 1. パラメータの解決 (Next.js 15 Promise 対応)
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // 💡 バックエンドの命名規則に合わせる (例: actress -> actresses)
    const taxonomyType = category === 'actress' ? 'actresses' : `${category}s`;
    
    // DUGAのAPI引数名に変換
    const categoryKey = `${category}_id`;

    // --- 🏗️ 2. データ取得（並列実行） ---
    const [
        productData, 
        makersRes, 
        genresRes, 
        actressesRes,
        seriesRes,
        directorsRes,
        wpData
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'duga',
            [categoryKey]: id,
            page: currentPage,
            ordering: currentSort,
            limit: 24
        }).catch(() => ({ results: [], count: 0 })),
        
        // 🚀 修正: 関数が存在しないリスクを避け、確実に存在する fetchAdultTaxonomyIndex を使う
        fetchAdultTaxonomyIndex('makers', { limit: 40, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('genres', { limit: 40, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('actresses', { limit: 40, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('series', { limit: 40, api_source: 'duga' }).catch(() => ({ results: [] })), 
        fetchAdultTaxonomyIndex('directors', { limit: 40, api_source: 'duga' }).catch(() => ({ results: [] })),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // 表示タイトルの特定 (取得したマスタから名称を検索)
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
                        apiParam: categoryKey,
                        resultsFound: productData.results?.length,
                        taxonomyType
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="duga"
                title={`DUGA ${category.toUpperCase()}: ${decodeURIComponent(displayName)}`}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // サイドバー用データ
                makers={safeExtract(makersRes)}
                genres={safeExtract(genresRes)}
                actresses={safeExtract(actressesRes)}
                series={safeExtract(seriesRes)}
                directors={safeExtract(directorsRes)}
                
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