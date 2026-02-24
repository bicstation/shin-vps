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

    // --- 🏗️ 1. データ取得（最小並列構成） ---
    // 💡 サイドバー用の fetchMakers 等の大群をすべて削除。
    // コンテンツ表示に必要な「商品リスト」と「パンくず用階層」のみに絞ります。
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

    // --- 🛠️ 2. 表示名の特定ロジック ---
    // 別途マスターAPIを叩かずに、取得した商品データの最初の1件から
    // 該当するカテゴリの名称（女優名やメーカー名）を抽出してタイトルにします。
    let displayName = id.toUpperCase();
    if (productData.results?.length > 0) {
        const sample = productData.results[0];
        // カテゴリに応じたフィールドから名称を探す
        const targetMap: any = {
            actress: sample.actresses?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            maker: sample.maker?.name,
            genre: sample.genres?.find((g: any) => String(g.id) === id || g.slug === id)?.name,
            series: sample.series?.name,
            author: sample.authors?.find((a: any) => String(a.id) === id || a.slug === id)?.name,
            director: sample.director?.name,
        };
        displayName = targetMap[category] || displayName;
    }

    // --- 🛡️ 3. サイドバー用階層データの整理（パンくず生成用） ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
        }));
        return {
            id: content.code,
            name: serviceName,
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
                // 💡 解読された名称をタイトルに適用
                title={`${category.toUpperCase()}: ${decodeURIComponent(displayName)}`}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // パンくず用データ
                officialHierarchy={fanzaHierarchy} 
                
                // 💡 最適化: タクソノミーPropsは Layout 側が自動注入するため、ここでは空のままでOK
                
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