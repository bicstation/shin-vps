/* /app/brand/fanza/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { 
    getUnifiedProducts, // 💡 getAdultProducts から修正
    fetchMakers, 
    fetchGenres, 
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    return constructMetadata(
        title, 
        `FANZAの${service}内${floor}フロアを解析。最新のAI解析データと商品アーカイブ。`,
        undefined,
        `/brand/fanza/svc/${service}/${floor}`
    );
}

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
 * 🔳 FANZA_FLOOR_LIST_PAGE
 */
export default async function FanzaFloorListPage(props: {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { service, floor } = resolvedParams;
    
    const isDebug = resolvedSearchParams?.debug === 'true';
    const sort = resolvedSearchParams.sort || '-release_date';
    const limit = 24;
    const currentPage = Number(resolvedSearchParams.page) || 1;

    // --- 🏗️ 1. データ取得（並列） ---
    const [
        dataRes, 
        dynamicMenu, 
        makersArray, 
        genresArray, 
        actressesArray,
        seriesArray,
        directorsArray,
        authorsArray,
        labelsArray,
        wRes
    ] = await Promise.all([
        getUnifiedProducts({ // 💡 正しい関数名を使用
            api_source: 'fanza',
            service: service, // adult.ts 内で service_code に自動変換されます
            floor: floor,     // adult.ts 内で floor_code に自動変換されます
            page: currentPage,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 

        // カテゴリ別マスタ取得
        fetchMakers({ limit: 40, api_source: 'fanza', ordering: '-product_count' }).catch(() => []),
        fetchGenres({ limit: 40, api_source: 'fanza', ordering: '-product_count' }).catch(() => []),
        fetchActresses({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchSeries({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchDirectors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchLabels({ limit: 40, api_source: 'fanza' }).catch(() => []),
        
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（FANZA階層構造） ---
    // dynamicMenu は getFanzaDynamicMenu() によりサービス一覧(services)が返ってきている想定
    const fanzaHierarchy = Object.entries(dynamicMenu || {}).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            floors: floorItems,
            active: service === content.code,
        };
    }).filter(item => item.floors.length > 0);

    // --- 🎨 3. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 デバッグモード */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id={`FANZA_SVC_${service}_${floor}`}
                    source="FANZA"
                    data={{
                        service,
                        floor,
                        totalCount: dataRes.count,
                        currentPage,
                        actressesFound: safeExtract(actressesArray).length,
                        authorsFound: safeExtract(authorsArray).length,
                        wpStatus: wRes?.results ? 'OK' : 'EMPTY'
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={`${floor.toUpperCase()} SECTOR`}
                products={dataRes.results || []}
                totalCount={dataRes.count || 0}
                
                // サイドバーデータの完全注入
                officialHierarchy={fanzaHierarchy} 
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)} 
                series={safeExtract(seriesArray)}
                directors={safeExtract(directorsArray)}
                labels={safeExtract(labelsArray)}

                // 属性の分離（ビデオ系なら女優、電子書籍系なら著者が優先表示されるロジック用）
                actresses={safeExtract(actressesArray)}
                authors={safeExtract(authorsArray)}
                
                recentPosts={safeExtract(wRes).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                
                currentPage={currentPage}
                currentSort={sort}
                
                // パス設定（ページネーション等の基準URL）
                basePath={`/brand/fanza/svc/${service}/${floor}`}
                categoryPathPrefix="/brand/fanza/cat" 
                
                extraParams={{ 
                    service, 
                    floor, 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}