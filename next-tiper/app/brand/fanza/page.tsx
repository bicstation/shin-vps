/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
import { 
    getUnifiedProducts, 
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'FANZA Archive | サービス・フロア・AI解析データアーカイブ',
    description: 'FANZA公式のサービス階層（ビデオ、素人、アニメ等）と、当サイト独自のAI解析によるアーカイブデータ。',
};

/**
 * 🎬 FANZA ブランド特化型ページ
 * サイドバーのタクソノミー取得を Layout 側に委ね、商品取得を最小化
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
    const searchParams = await props.searchParams;
    const isDebug = searchParams?.debug === 'true';
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';
    
    // 💡 クエリ取得
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. 並列データ取得 (コンテンツに必須なデータのみ) ---
    // タクソノミー（メーカー・ジャンル等）はサイドバー(Layout)側で取得するため、ここでは不要。
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
            limit: 24, // ArchiveTemplate の limit と同期
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
    ]);

    // --- 🛡️ 2. サービス階層の整理 (パンくず・タイトル生成用) ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
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

    // --- 🎨 3. 表示タイトルの決定 ---
    let displayTitle = "FANZA ARCHIVE";
    if (currentService) {
        const foundSvc = fanzaHierarchy.find(s => s.service_code === currentService);
        displayTitle = foundSvc ? `FANZA - ${foundSvc.name}` : `FANZA - ${currentService.toUpperCase()}`;
        if (currentFloor) {
            const foundFloor = foundSvc?.floors.find(f => f.floor_code === currentFloor);
            displayTitle += foundFloor ? ` (${foundFloor.name})` : ` (${currentFloor})`;
        }
    }

    return (
        <>
            {/* 🐞 デバッグモード */}
            {isDebug && (
                <SystemDiagnosticHero 
                    id="BRAND_FANZA_OPTIMIZED"
                    source="FANZA"
                    data={{
                        mode: 'CORE_BRAND_STREAM',
                        totalProducts: productData.count,
                        currentPage,
                        currentSort,
                        apiService: currentService,
                        floorCode: currentFloor
                    }}
                    rawJson={{ 
                        sampleProduct: productData.results?.[0],
                        hierarchySample: fanzaHierarchy?.[0]
                    }}
                />
            )}

            {/* 📦 メインアーカイブテンプレート */}
            {/* 💡 最適化: 
                makers, genres, actresses などの props は 
                Layout 側のサイドバーが処理するため、ここでは渡す必要がなくなりました。
            */}
            <ArchiveTemplate 
                platform="fanza"
                title={displayTitle}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // パンくず生成用の階層データのみ維持
                officialHierarchy={fanzaHierarchy} 
                
                // 状態管理用
                currentPage={currentPage}
                currentSort={currentSort}
                basePath="/brand/fanza"
                
                // 追加パラメータ
                extraParams={{ 
                    service: currentService, 
                    floor: currentFloor, 
                    debug: isDebug ? 'true' : undefined 
                }}
            />
        </>
    );
}