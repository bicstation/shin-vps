/* /app/brand/fanza/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';

/**
 * 🛰️ API インポート
 * 物理構造 shared/lib/api/django/adult.ts に準拠
 */
import { 
    getUnifiedProducts, 
    getFanzaDynamicMenu 
} from '@/shared/lib/api/django/adult';

/**
 * ✅ 修正: 物理構造 shared/lib/utils/metadata.ts に合わせる
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

/**
 * ✅ 修正: 物理構造 shared/components/molecules/SystemDiagnosticHero.tsx に合わせる
 */
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

/**
 * 💡 カテゴリ表示名の定義
 */
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
    actress: '女優',
    genre: 'ジャンル',
    series: 'シリーズ',
    maker: 'メーカー',
    director: '監督',
    author: '著者',
};

/**
 * 💡 サービス名の日本語変換定義
 */
const SERVICE_NAME_MAP: Record<string, string> = {
    'digital': 'デジタル',
    'videoa': 'ビデオ',
    'videoc': 'ビデオ (C)',
    'anime': 'アニメ',
    'pc': 'PCソフト',
    'book': '電子書籍',
};

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    const decodedId = decodeURIComponent(id);
    const categoryLabel = CATEGORY_DISPLAY_NAMES[category] || category.toUpperCase();
    
    return constructMetadata({
        title: `FANZA ${categoryLabel} [${decodedId}] アーカイブ解析 | TIPER`,
        description: `FANZAの${categoryLabel}（ID:${decodedId}）に基づいた全作品アーカイブ。最新の市場解析データを表示。`,
        canonical: `/brand/fanza/cat/${category}/${id}`
    });
}

/**
 * 🔳 FANZA_CATEGORY_DETAIL_PAGE
 * 役割: 特定の属性(女優・ジャンル等)に基づいた商品一覧を表示し、名前の逆引き解決を行う。
 */
export default async function FanzaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    // 1. パラメータの非同期解決
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    const { category, id } = resolvedParams;

    const isDebug = resolvedSearchParams?.debug === 'true';
    const currentPage = Number(resolvedSearchParams?.page) || 1;
    const currentSort = resolvedSearchParams?.sort || '-release_date';

    // カテゴリキーの正規化 (API引数名に変換: actress -> actress_id)
    const categoryKey = `${category}_id`;

    // --- 🏗️ 2. データ取得（並列実行） ---
    const [
        productData, 
        dynamicMenu
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'fanza',
            [categoryKey]: id, 
            page: currentPage,
            ordering: currentSort,
            limit: 24,
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
    ]);

    // --- 🛠️ 3. 表示名の特定ロジック (Reverse Lookup) ---
    let displayName = id.toUpperCase();
    if ((productData.results?.length ?? 0) > 0) {
        const sample = productData.results[0];
        
        const targetMap: any = {
            actress: sample.actresses?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            maker: (String(sample.maker?.id) === id || sample.maker?.slug === id) ? sample.maker?.name : null,
            genre: sample.genres?.find((g: any) => String(g.id) === id || g.slug === id)?.name,
            series: (String(sample.series?.id) === id || sample.series?.slug === id) ? sample.series?.name : null,
            author: sample.authors?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            director: (String(sample.director?.id) === id || sample.director?.slug === id) ? sample.director?.name : null,
        };
        
        displayName = targetMap[category] || displayName;
    }

    const categoryLabel = CATEGORY_DISPLAY_NAMES[category] || category.toUpperCase();

    // --- 🛡️ 4. サイドバー用階層データの整理 ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const translatedServiceName = SERVICE_NAME_MAP[serviceName.toLowerCase()] || serviceName;

        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: translatedServiceName,
            service_code: content.code,
            floors: floorItems,
        };
    }).filter(item => item.floors.length > 0);

    return (
        <>
            {/* 🐞 診断ツール: shared/components/molecules/SystemDiagnosticHero.tsx */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'BRAND_CAT_DETAIL',
                        platform: 'FANZA',
                        fetchTime: 'Parallel-Stream',
                        productCount: productData?.count || 0,
                    }}
                    raw={{
                        category,
                        targetId: id,
                        resolvedName: displayName,
                        currentPage,
                        apiParam: categoryKey
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={`${categoryLabel}: ${decodeURIComponent(displayName)}`}
                products={productData?.results || []}
                totalCount={productData?.count || 0}
                
                officialHierarchy={fanzaHierarchy} 
                
                currentPage={currentPage}
                currentSort={currentSort}
                
                basePath={`/brand/fanza/cat/${category}/${id}`}
                categoryPathPrefix="/brand/fanza/cat" 
                category={category}
                id={id}

                extraParams={{ 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}