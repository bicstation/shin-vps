/* /app/brand/fanza/cat/[category]/[id]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getUnifiedProducts, 
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

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
 * APIから返ってくる 'videoa' などのコードを日本語に変換します。
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
 * 🔳 FANZA_CATEGORY_DETAIL_PAGE (Optimized Data Stream)
 */
export default async function FanzaCategoryDetailPage(props: {
    params: Promise<{ category: string; id: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // カテゴリキーの正規化 (API引数名に変換: actress -> actress_id)
    const categoryKey = `${category}_id`;

    // --- 🏗️ 1. データ取得 ---
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

    // --- 🛠️ 2. 表示名の特定ロジック (重要) ---
    // 💡 スラッグ(id)ではなく、商品データから「本名(name)」を抽出
    let displayName = id.toUpperCase();
    if (productData.results?.length > 0) {
        const sample = productData.results[0];
        
        // 取得した1件目の商品に含まれる各タクソノミー配列から、IDが一致するものを探す
        const targetMap: any = {
            actress: sample.actresses?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            maker: sample.maker?.id === Number(id) || sample.maker?.slug === id ? sample.maker?.name : null,
            genre: sample.genres?.find((g: any) => String(g.id) === id || g.slug === id)?.name,
            series: sample.series?.id === Number(id) || sample.series?.slug === id ? sample.series?.name : null,
            author: sample.authors?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            director: sample.director?.id === Number(id) || sample.director?.slug === id ? sample.director?.name : null,
        };
        
        displayName = targetMap[category] || displayName;
    }

    // カテゴリの日本語名を取得（例: actress -> 女優）
    const categoryLabel = CATEGORY_DISPLAY_NAMES[category] || category.toUpperCase();

    // --- 🛡️ 3. サイドバー用階層データの整理 ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        // 💡 サービス名(serviceName)が英語コード（videoa等）の場合は日本語に置換
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
            name: translatedServiceName, // 日本語化された名前をセット
            service_code: content.code,
            floors: floorItems,
        };
    }).filter(item => item.floors.length > 0);

    return (
        <>
            {/* 🐞 デバッグモード */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id={`FANZA_CAT_${category}_${id}_STREAM`}
                    source="FANZA"
                    data={{
                        category,
                        targetId: id,
                        resolvedName: displayName,
                        totalCount: productData.count,
                        currentPage,
                        apiParam: categoryKey
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                // 💡 メインタイトルを 「女優: 三上悠亜」 のような形式に修正
                title={`${categoryLabel}: ${decodeURIComponent(displayName)}`}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // パンくず用データ
                officialHierarchy={fanzaHierarchy} 
                
                currentPage={currentPage}
                currentSort={currentSort}
                
                // ページネーションとパンくず用
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