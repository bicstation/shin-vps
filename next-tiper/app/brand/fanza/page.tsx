/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
// 💡 インポートパスをプロジェクト構造に合わせて調整
import ArchiveTemplate from '../ArchiveTemplate'; 
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

/**
 * FANZAブランド専用アーカイブページ
 * Djangoマスタと同期した「サービス/フロア」の動的サイドメニューを実現します。
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
    
    // 💡 現在のURLから選択中のサービス・フロアを特定
    const currentService = searchParams?.service || '';
    const currentFloor = searchParams?.floor || '';

    // --- 🏗️ 1. データ取得（並列） ---
    const startTime = Date.now();
    const [productData, dynamicMenu, makersArray, genresArray, wpData] = await Promise.all([
        getUnifiedProducts({
            api_source: 'FANZA',
            page: currentPage,
            ordering: currentSort,
            service: currentService, // Django API側の service_code に自動変換される
            floor: currentFloor,     // Django API側の floor_code に自動変換される
        }),
        // 💡 階層マスタを取得
        getFanzaDynamicMenu().catch(() => []), 
        // 💡 仕訳用マスタを取得（FANZAでの利用実績順）
        fetchMakers({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 40, ordering: '-product_count' }).catch(() => []), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);
    const duration = Date.now() - startTime;

    // --- 🛡️ 2. サイドバー用データの整理（順番と正規化） ---

    // A. 汎用抽出ロジック
    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    // B. FANZA公式階層（FanzaFloorMaster由来のデータ）
    // django/adult.ts の getFanzaDynamicMenu は [{service_code, floors: []}, ...] の形式を想定
    const fanzaHierarchy = dynamicMenu; 

    // C. 当サイト仕訳メニュー（FANZAソースのものに限定、またはマスタ全体）
    // Django側のシリアライザーで api_source: 'FANZA' が付与されているものを優先
    const filterByBrand = (list: any) => 
        safeExtract(list).filter((item: any) => 
            !item.api_source || item.api_source === 'FANZA' || item.api_source === 'COMMON'
        );

    const fanzaMakers = filterByBrand(makersArray);
    const fanzaGenres = filterByBrand(genresArray);

    // --- 🎨 3. レンダリング ---
    return (
        <>
            {/* 🛠️ システム診断情報の表示 (debug=true の時のみ) */}
            {isDebug && (
                <SystemDiagnosticHero 
                    stats={{
                        fetchTime: `${duration}ms`,
                        mode: 'SERVER_BRAND_PAGE',
                        platform: 'fanza',
                        hierarchyCount: fanzaHierarchy.length,
                        makerCount: fanzaMakers.length,
                        genreCount: fanzaGenres.length,
                        productCount: productData?.results?.length || 0,
                    }}
                    raw={{
                        fanzaHierarchy,
                        params: { currentService, currentFloor },
                        firstProduct: productData?.results?.[0]
                    }}
                />
            )}

            <ArchiveTemplate 
                platform="fanza"
                title={currentFloor ? `FANZA - ${currentFloor.toUpperCase()}` : "FANZA ARCHIVE"}
                products={productData.results || []}
                totalCount={productData.count || 0}
                
                // 💡 公式メニュー（サービス ＞ フロア の階層構造を渡す）
                officialHierarchy={fanzaHierarchy} 
                
                // 💡 仕訳メニュー（メーカー・ジャンル）
                makers={fanzaMakers}
                genres={fanzaGenres}
                
                // WordPressお知らせ
                recentPosts={wpData.results?.map((p: any) => ({
                    id: p.id,
                    title: p.title.rendered,
                    slug: p.slug,
                    date: p.date
                }))}
                
                // 状態同期（サイドバーの「active」クラス判定に使用）
                currentPage={currentPage}
                currentSort={currentSort}
                currentService={currentService}
                currentFloor={currentFloor}
                
                basePath="/brand/fanza"
                extraParams={{ 
                    brand: 'fanza',
                    debug: isDebug 
                }}
            />
        </>
    );
}