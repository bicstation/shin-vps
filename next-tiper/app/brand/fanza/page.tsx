/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
import { 
    getUnifiedProducts, 
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
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'FANZA Archive | サービス・フロア・AI解析データアーカイブ',
    description: 'FANZA公式のサービス階層（ビデオ、素人、アニメ等）と、当サイト独自のAI解析によるアーカイブデータ。',
};

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
 * 🛠️ 補助関数: ブランド（FANZA/COMMON）に属するもののみフィルタリング
 */
const filterByBrand = (list: any) => {
    const rawList = safeExtract(list);
    return rawList.filter((item: any) => {
        const source = (item.api_source || '').toUpperCase(); 
        return source === 'FANZA' || source === 'COMMON' || source === '';
    });
};

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
    
    // 💡 サービス・フロアのクエリ取得
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. 並列データ取得 (ブランド特化型リクエスト) ---
    // Djangoの backend 側でも api_source=fanza で絞り込みをかけて取得
    const [
        productData, 
        dynamicMenu, 
        makersArray, 
        genresArray, 
        actressesArray, 
        seriesArray,
        directorsArray,
        authorsArray,
        labelsArray,
        wpData
    ] = await Promise.all([
        getUnifiedProducts({
            api_source: 'fanza',
            page: currentPage,
            ordering: currentSort,
            api_service: currentService,
            floor_code: currentFloor,
        }).catch(() => ({ results: [], count: 0 })),
        
        getFanzaDynamicMenu().catch(() => ({})), 

        fetchMakers({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchGenres({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchActresses({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchSeries({ limit: 40, api_source: 'fanza' }).catch(() => []), 
        fetchDirectors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchAuthors({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchLabels({ limit: 40, api_source: 'fanza' }).catch(() => []),

        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（サービス階層） ---
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

    // --- 🎨 3. 各タクソノミーの整理（フィルタリングの徹底） ---
    const filteredActresses = filterByBrand(actressesArray);
    const filteredMakers = filterByBrand(makersArray);
    const filteredGenres = filterByBrand(genresArray);
    const filteredSeries = filterByBrand(seriesArray);
    const filteredDirectors = filterByBrand(directorsArray);
    const filteredAuthors = filterByBrand(authorsArray);
    const filteredLabels = filterByBrand(labelsArray);

    // 表示タイトルの決定
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
                    id="BRAND_FANZA_RECONSTRUCTED"
                    source="FANZA"
                    data={{
                        mode: 'SERVER_BRAND_PAGE_FINAL',
                        totalProducts: productData.count,
                        actressesCount: filteredActresses.length,
                        authorsCount: filteredAuthors.length,
                        apiSourceUsed: 'fanza'
                    }}
                    rawJson={{ 
                        actressSample: filteredActresses[0],
                        authorSample: filteredAuthors[0]
                    }}
                />
            )}

            {/* 📦 メインアーカイブテンプレート */}
            <ArchiveTemplate 
                platform="fanza"
                title={displayTitle}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 💡 サイドバーデータの注入
                officialHierarchy={fanzaHierarchy} 
                makers={filteredMakers}
                genres={filteredGenres}
                
                // 🚀 【重要】女優と著者の明示的な分離
                // ArchiveTemplate側で "著者がいない場合に女優を出す" ロジックがある場合でも、
                // ページ側から空配列を渡すことで、意図しない表示を防ぎます。
                actresses={filteredActresses} 
                authors={filteredAuthors} 
                
                series={filteredSeries}
                directors={filteredDirectors}
                labels={filteredLabels}
                
                // WordPress最新投稿
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}

                // 状態管理用
                currentPage={currentPage}
                currentSort={currentSort}
                basePath="/brand/fanza"
                categoryPathPrefix="/brand/fanza/cat" 
                
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