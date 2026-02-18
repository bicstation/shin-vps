/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
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
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'FANZA Archive | サービス・フロア・当サイト独自の仕訳検索',
    description: 'FANZAの公式サービス階層と、当サイト独自のAI解析によるメーカー・ジャンル別アーカイブ。',
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

    // --- 🏗️ 1. データ取得 ---
    const [productData, dynamicMenu, makersArray, genresArray, wpData] = await Promise.all([
        getUnifiedProducts({
            api_source: 'fanza',
            page: currentPage,
            ordering: currentSort,
            api_service: currentService,
            floor_code: currentFloor,
        }),
        getFanzaDynamicMenu().catch(() => ({})), 
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. サイドバー用データの整理（AdultSidebarの期待値に100%準拠） ---
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name, // 💡 AdultSidebarがこれを使う
            floor_code: f.code, // 💡 AdultSidebarがこれを使う
            slug: f.code
        }));

        return {
            id: content.code,
            name: serviceName,
            service_name: serviceName, // 💡 AdultSidebarがこれを使う
            service_code: content.code, // 💡 AdultSidebarがこれを使う
            slug: content.code,
            floors: floorItems, // 💡 AdultSidebarがこれを使う
        };
    });

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);
    const filterByBrand = (list: any) => 
        safeExtract(list).filter((item: any) => 
            !item.api_source || item.api_source === 'FANZA' || item.api_source === 'COMMON'
        );

    return (
        <>
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{ mode: 'SERVER_BRAND_PAGE', platform: 'fanza' }}
                    raw={{ fanzaHierarchy }}
                />
            )}
            <ArchiveTemplate 
                platform="fanza"
                title={currentFloor ? `FANZA - ${currentFloor.toUpperCase()}` : "FANZA ARCHIVE"}
                products={productData.results || []}
                totalCount={productData.count || 0}
                officialHierarchy={fanzaHierarchy} 
                makers={filterByBrand(makersArray)}
                genres={filterByBrand(genresArray)}
                recentPosts={safeExtract(wpData).map((p: any) => ({
                    id: p.id,
                    title: p.title?.rendered || 'No Title',
                    slug: p.slug,
                    date: p.date
                }))}
                currentPage={currentPage}
                currentSort={currentSort}
                currentService={currentService}
                currentFloor={currentFloor}
                basePath="/brand/fanza"
                extraParams={{ brand: 'fanza', debug: isDebug }}
            />
        </>
    );
}