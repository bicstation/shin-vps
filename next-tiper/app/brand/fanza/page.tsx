/* /app/brand/fanza/page.tsx */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
/**
 * ✅ 修正: ファイル位置に合わせてArchiveTemplateを読み込み
 */
import ArchiveTemplate from '../ArchiveTemplate'; 

import { 
    getUnifiedProducts, 
    getFanzaDynamicMenu 
} from '@/shared/lib/api/django/adult';

/**
 * ✅ 修正: 物理構造 shared/components/molecules/SystemDiagnosticHero.tsx に合わせる
 */
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'FANZA Archive | サービス・フロア・AI解析データアーカイブ',
    description: 'FANZA公式のサービス階層（ビデオ、素人、アニメ等）と、当サイト独自のAI解析によるアーカイブデータ。',
};

/**
 * 🎬 FANZA ブランドハブページ
 */
export default async function FanzaBrandPage(props: {
    searchParams: Promise<{ 
        page?: string; 
        sort?: string; 
        service?: string; 
        floor?: string;
        debug?: string; 
     }>;
}) {
    // 1. パラメータの解決
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';
    
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 2. 並列データ取得 ---
    const [
        productData, 
        dynamicMenu
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'fanza',
            page: currentPage,
            ordering: currentSort,
            api_service: currentService,
            floor_code: currentFloor,
            limit: 24,
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
    ]);

    // --- 🛡️ 3. サービス階層の正規化 ---
    const fanzaHierarchy = Object.entries(dynamicMenu || {}).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/fanza/svc/${content.code}?floor=${f.code}`,
            slug: f.code
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            href: `/brand/fanza/svc/${content.code}`,
            floors: floorItems,
        };
    });

    // --- 🎨 4. 表示タイトルの動的決定 ---
    let displayTitle = "FANZA ARCHIVE";
    if (currentService) {
        const foundSvc = fanzaHierarchy.find(s => s.service_code === currentService);
        displayTitle = foundSvc ? `FANZA - ${foundSvc.name}` : `FANZA - ${currentService.toUpperCase()}`;
        if (currentFloor) {
            const foundFloor = foundSvc?.floors?.find(f => f.floor_code === currentFloor);
            displayTitle += foundFloor ? ` (${foundFloor.name})` : ` (${currentFloor})`;
        }
    }

    return (
        <>
            {/* 🐞 診断ツール: 物理パス shared/components/molecules/... 経由 */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        mode: 'CORE_BRAND_STREAM',
                        fetchTime: 'Parallel-Fanza',
                        platform: 'FANZA',
                        productCount: productData?.count || 0,
                    }}
                    raw={{ 
                        currentPage,
                        apiService: currentService,
                        floorCode: currentFloor,
                        sampleProduct: productData?.results?.[0]
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={displayTitle}
                products={productData?.results || []}
                totalCount={productData?.count || 0}
                
                // ナビゲーション階層のみ維持
                officialHierarchy={fanzaHierarchy} 
                
                currentPage={currentPage}
                currentSort={currentSort}
                basePath="/brand/fanza"
                
                extraParams={{ 
                    service: currentService, 
                    floor: currentFloor, 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}