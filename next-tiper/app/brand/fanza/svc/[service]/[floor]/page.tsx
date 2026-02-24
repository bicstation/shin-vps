/* /app/brand/fanza/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { 
    getUnifiedProducts, 
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
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
 * 🔳 FANZA_FLOOR_LIST_PAGE (Deep Segment Optimized)
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

    // --- 🏗️ 1. データ取得（最小構成） ---
    // 💡 サイドバー用のタクソノミー取得(fetchMakers等)は Layout 側に集約されたため削除
    const [
        dataRes, 
        dynamicMenu
    ] = await Promise.all([
        getUnifiedProducts({ 
            api_source: 'fanza',
            service: service, 
            floor: floor,
            page: currentPage,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（パンくず・タイトル生成用） ---
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
                    id={`FANZA_SVC_${service}_${floor}_OPTIMIZED`}
                    source="FANZA"
                    data={{
                        mode: 'DEEP_SEGMENT_STREAM',
                        service,
                        floor,
                        totalCount: dataRes.count,
                        currentPage,
                        apiSource: 'fanza'
                    }}
                    rawJson={{
                        sampleProduct: dataRes.results?.[0],
                        hierarchy: fanzaHierarchy
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                /* 💡 タイトルをよりタクティカルに */
                title={`${floor.toUpperCase()} SECTOR`}
                products={dataRes.results || []}
                totalCount={dataRes.count || 0}
                
                // パンくず・ナビゲーション用データ
                officialHierarchy={fanzaHierarchy} 
                
                // 💡 タクソノミーPropsは Layout 側が処理するため、ここでは渡さず Template 内で透過させます
                
                currentPage={currentPage}
                currentSort={sort}
                
                // パス設定（ページネーション等の基準URL）
                basePath={`/brand/fanza/svc/${service}/${floor}`}
                
                extraParams={{ 
                    service, 
                    floor, 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}