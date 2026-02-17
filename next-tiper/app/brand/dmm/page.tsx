/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
// 💡 インポートパスはプロジェクト構造に合わせて調整
import ArchiveTemplate from '../ArchiveTemplate'; 
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    getDmmDynamicMenu // 💡 DMM用のメニュー取得関数（APIに存在することを前提）
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'DMM Archive | TIPER Archive',
    description: 'DMM.R18 / FANZA 共通基盤を含むアーカイブデータを統合。',
};

/**
 * DMMブランド専用アーカイブページ
 * FANZAと同様に動的メニューを取得し、サイドバーに階層構造を渡します。
 */
export default async function DmmBrandPage(props: {
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
    
    // URLから選択中のサービス・フロアを特定
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. データ取得（並列） ---
    const startTime = Date.now();
    const [productData, dynamicMenu, makersArray, genresArray, wpData] = await Promise.all([
        getUnifiedProducts({
            api_source: 'DMM',
            page: currentPage,
            ordering: currentSort,
            service: currentService,
            floor: currentFloor,
        }),
        // DMM用の動的メニューを取得（関数名はAPIの実装に合わせて適宜調整してください）
        getDmmDynamicMenu().catch(() => ({})), 
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);
    const duration = Date.now() - startTime;

    // --- 🛡️ 2. サイドバー用データの整理（AdultSidebarのパス形式に適合） ---
    const dmmHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            slug: f.code,
            // パス形式: /brand/dmm/digital/videoa
            href: `/brand/dmm/${content.code}/${f.code}`,
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName,
            service_code: content.code,
            slug: content.code,
            floors: floorItems,
            items: floorItems, // フォールバック用
            active: currentService === content.code,
        };
    });

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    // --- 🎨 3. レンダリング ---
    return (
        <>
            {/* デバッグ用表示 */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        fetchTime: `${duration}ms`,
                        mode: 'SERVER_DMM_PAGE',
                        platform: 'dmm',
                        productCount: productData?.results?.length || 0,
                    }}
                    raw={{ dmmHierarchy, params: { currentService, currentFloor } }}
                />
            )}

            <ArchiveTemplate 
                platform="dmm"
                title={currentFloor ? `DMM - ${currentFloor.toUpperCase()}` : "DMM ARCHIVE"}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 🚀 整形した階層データ
                officialHierarchy={dmmHierarchy} 
                
                // 補助マスタ
                makers={safeExtract(makersArray)}
                genres={safeExtract(genresArray)}
                
                // WPお知らせ
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                }))}
                
                // 状態
                currentPage={currentPage}
                currentSort={currentSort}
                currentService={currentService}
                currentFloor={currentFloor}
                
                basePath="/brand/dmm"
                extraParams={{ 
                    brand: 'dmm',
                    debug: isDebug 
                }}
            />
        </>
    );
}