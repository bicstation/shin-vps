/* /app/brand/fanza/svc/[service]/[floor]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';

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
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 

/**
 * ✅ 修正: 物理構造 shared/components/molecules/SystemDiagnosticHero.tsx に合わせる
 */
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 市場動向の即時性のために短めのキャッシュ

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
    const { service, floor } = await params;
    const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} 市場解析アーカイブ | TIPER`;
    
    return constructMetadata({
        title, 
        description: `FANZA（ファンザ）の${service}内${floor}フロアをTIPER独自のAIアルゴリズムで解析。最新の商品アーカイブを提供。`,
        canonical: `/brand/fanza/svc/${service}/${floor}`
    });
}

/**
 * 🔳 FANZA_FLOOR_LIST_PAGE
 * 役割: 特定のサービス・フロアに深く潜り込み、特化された商品リストを展開する。
 */
export default async function FanzaFloorListPage(props: {
    params: Promise<{ service: string; floor: string }>;
    searchParams: Promise<{ page?: string; sort?: string; debug?: string }>;
}) {
    // 1. パラメータの非同期解決 (Next.js 15 Spec)
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    const { service, floor } = resolvedParams;
    
    const isDebug = resolvedSearchParams?.debug === 'true';
    const sort = resolvedSearchParams.sort || '-release_date';
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const limit = 24;

    // --- 🏗️ 2. データ取得（並列実行・最小フェッチ） ---
    const [
        dataRes, 
        dynamicMenu
    ] = await Promise.all([
        getUnifiedProducts({ 
            api_source: 'fanza',
            api_service: service, // ✅ APIの期待値に合わせて正規化
            floor_code: floor,    // ✅ APIの期待値に合わせて正規化
            page: currentPage,
            ordering: sort,
            limit: limit
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
    ]);

    // --- 🛡️ 3. サイドバー・ナビゲーション用階層データの整理 ---
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

    // --- 🎨 4. ArchiveTemplate への流し込み ---
    return (
        <>
            {/* 🐞 デバッグ診断: v3.2 Props形式に準拠 */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'DEEP_SEGMENT_STREAM',
                        platform: 'FANZA',
                        fetchTime: 'Parallel-Direct',
                        productCount: dataRes?.count || 0,
                    }}
                    raw={{
                        service,
                        floor,
                        currentPage,
                        apiSource: 'fanza',
                        sampleProduct: dataRes.results?.[0]
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={`${floor.toUpperCase()} SECTOR`}
                products={dataRes.results || []}
                totalCount={dataRes.count || 0}
                
                // ナビゲーション階層を供給
                officialHierarchy={fanzaHierarchy} 
                
                currentPage={currentPage}
                currentSort={sort}
                
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