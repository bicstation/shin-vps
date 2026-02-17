import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getUnifiedProducts, 
    fetchMakers, 
    fetchGenres,
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';

// 💡 指定されたデバッグコンポーネントをインポート
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'FANZA Archive | システム診断モード',
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
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. 並列データ取得 ---
    const startTime = Date.now();
    const [productData, dynamicMenu, makersRaw, genresRaw, wpData] = await Promise.all([
        getUnifiedProducts({
            api_source: 'FANZA',
            page: currentPage,
            ordering: currentSort,
            service: currentService,
            floor: currentFloor,
        }),
        getFanzaDynamicMenu().catch(e => ({ _err: e.message })),
        fetchMakers({ limit: 20 }).catch(e => ({ _err: e.message })),
        fetchGenres({ limit: 20 }).catch(e => ({ _err: e.message })),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);
    const duration = Date.now() - startTime;

    // --- 🛡️ 2. データ正規化 ---
    const safeList = (data: any) => Array.isArray(data) ? data : (data?.results || []);
    
    const makers = safeList(makersRaw).filter((m: any) => m.api_source === 'FANZA');
    const genres = safeList(genresRaw).filter((g: any) => g.api_source === 'FANZA');

    // --- 🎨 3. レンダリング ---
    return (
        <>
            {/* 🛠️ システム診断情報の表示 (debug=true の時のみ) */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        fetchTime: `${duration}ms`,
                        productCount: productData.count || 0,
                        menuStatus: Array.isArray(dynamicMenu) ? 'OK' : 'ERROR',
                        makerCount: makers.length,
                        genreCount: genres.length,
                        service: currentService || 'ALL',
                        floor: currentFloor || 'ALL'
                    }}
                    raw={{
                        dynamicMenu,
                        firstProduct: productData.results?.[0]
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title="FANZA ARCHIVE"
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 💡 サイドメニュー構成：公式階層（サービス＞フロア）
                officialHierarchy={dynamicMenu} 
                
                // 💡 サイドメニュー構成：仕訳メニュー（中カテゴリ）
                makers={makers}
                genres={genres}
                sidebarMakers={makers}
                sidebarGenres={genres}
                
                currentPage={currentPage}
                currentSort={currentSort}
                currentService={currentService}
                currentFloor={currentFloor}
                basePath="/brand/fanza"
                
                recentPosts={wpData.results?.map((p: any) => ({
                    id: p.id,
                    title: p.title.rendered,
                    slug: p.slug
                }))}
                
                extraParams={{ brand: 'fanza' }}
            />
        </>
    );
}