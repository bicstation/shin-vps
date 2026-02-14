/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🔞 TIPER API Middleware - Django Connector (Full-Sync Edition V2.5)
 * ==============================================================================
 * このファイルは Django 側の views.py / urls.py と 1対1 で同期しています。
 * 修正日: 2026-02-14 (URL解決ロジックの堅牢化)
 */

/**
 * 💡 1. 統合製品詳細取得 (最重要エンドポイント)
 * 個別ページ (page.tsx) から呼ばれるメインの取得ロジック。
 * Django 側の RetrieveAPIView の lookup_field 設定に合わせてエンドポイントを選択します。
 */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
    const idStr = String(id);
    
    // 🚨 Django の urls.py 定義に厳密に合わせるためのルーティング
    let endpoint = '';
    
    if (
        idStr.startsWith('DMM_') || 
        idStr.startsWith('FANZA_') || 
        source === 'DMM' || 
        source === 'FANZA'
    ) {
        // FANZA/DMM系: path('fanza-products/<str:unique_id>/', ...)
        endpoint = `/api/fanza-products/${idStr}/`;
    } else {
        // Adult/DUGA系: path('adult-products/<str:product_id_unique>/', ...)
        endpoint = `/api/adult-products/${idStr}/`;
    }

    const url = resolveApiUrl(endpoint);
    console.log(`📡 [BYPASS] Fetching product data from: ${url}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 },
            cache: 'no-store' // 常に最新の在庫・価格情報を反映
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        if (!data || data._error || data.detail === "見つかりませんでした。" || data.detail === "Not found.") {
            console.warn(`⚠️ [BYPASS 404] Node not found in Django DB: ${idStr} at ${url}`);
            return null;
        }
        
        return data;
    } catch (e) { 
        console.error("❌ [BYPASS CRITICAL ERROR] Connection failed between Next.js and Django:", e);
        return null; 
    }
}

/**
 * 💡 2. 統合製品アーカイブ取得 (Unified)
 * UnifiedAdultProductListView (/api/unified-adult-products/) を使用。
 * フロントの offset/limit を Django の PageNumberPagination 形式に変換。
 */
export async function getUnifiedProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const endpoint = '/api/unified-adult-products/';

    const { limit, offset, ...rest } = params;
    const pageSize = limit || 24;
    const page = offset ? Math.floor(offset / pageSize) + 1 : (params.page || 1);

    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        page: String(page),
        page_size: String(pageSize),
        ...rest 
    });

    const url = resolveApiUrl(`${endpoint}?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        
        return { 
            results: Array.isArray(data?.results) ? data.results : [], 
            count: data?.count || 0, 
            _debug: data?._debug || { url, page, pageSize }
        };
    } catch (e: any) { 
        console.error("❌ [BYPASS ERROR] getUnifiedProducts failed:", e);
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * 💡 3. 個別製品一覧 (DUGA/AdultProduct専用)
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ site_group: site_group || 'adult', ...params });
    const url = resolveApiUrl(`/api/adult-products/?${queryParams.toString()}`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 60 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            _debug: data._debug 
        };
    } catch (e: any) { 
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * 💡 4. マーケット分析・仕訳データ取得 (Analysis)
 * サイドメニューや統計グラフの描画を支えます。
 */
export async function getPlatformAnalysis(source: string, makerId?: string | number): Promise<any | null> {
    const queryParams = new URLSearchParams({ source: source.toUpperCase() });
    if (makerId) queryParams.append('maker_id', String(makerId));

    const url = resolveApiUrl(`/api/adult-products/analysis/?${queryParams.toString()}`);
    console.log(`📊 [ANALYSIS] Fetching market classification from: ${url}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("❌ [ANALYSIS ERROR] Failed to fetch market analysis:", e);
        return null;
    }
}

/**
 * 💡 5. メーカー一覧取得
 */
export async function fetchMakers(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/makers/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchMakers failed:", e);
        return []; 
    }
}

/**
 * 💡 6. ランキング取得 (AIスコア順)
 */
export async function fetchAdultProductRanking(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const url = resolveApiUrl(`/api/adult-products/ranking/`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 }, 
            signal: AbortSignal.timeout(10000) 
        });
        const data = await handleResponseWithDebug(res, url);
        
        const results = Array.isArray(data) ? data : (data.results || []);
        return { 
            results: results, 
            count: data.count || results.length, 
            _debug: data._debug 
        };
    } catch (e: any) { 
        console.error("❌ [BYPASS ERROR] fetchAdultProductRanking failed:", e);
        return { results: [], count: 0, _debug: { error: e.message, url } }; 
    }
}

/**
 * 💡 7. ジャンル一覧取得
 */
export async function fetchGenres(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/genres/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchGenres failed:", e);
        return []; 
    }
}

/**
 * 💡 8. FANZA/DMM ダイナミックメニュー取得
 * explorer.py で使用している get_dynamic_menu() の結果を API 経由で取得します。
 * これにより、サイドメニューのフロア仕訳を完全自動化します。
 */
export async function getFanzaDynamicMenu(): Promise<any[]> {
    const url = resolveApiUrl('/api/fanza/menu-structure/');
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 86400 } // フロア構成は頻繁に変わらないため24時間キャッシュ
        });
        const data = await res.json();
        
        // 配列であることを保証して返す
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("❌ [MENU ERROR] Failed to fetch dynamic FANZA menu:", e);
        return [];
    }
}

/**
 * 💡 9. シリーズ一覧取得 (追加)
 */
export async function fetchSeries(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/series/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchSeries failed:", e);
        return []; 
    }
}

/**
 * 💡 10. 監督一覧取得 (追加)
 */
export async function fetchDirectors(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/directors/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchDirectors failed:", e);
        return []; 
    }
}

/**
 * 💡 11. 著者・出演者一覧取得 (今回のエラー原因)
 */
export async function fetchAuthors(params: any = {}): Promise<any[]> {
    const url = resolveApiUrl(`/api/authors/?${new URLSearchParams(params).toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) { 
        console.error("❌ [BYPASS ERROR] fetchAuthors failed:", e);
        return []; 
    }
}

/**
 * ==============================================================================
 * 🔄 別名エクスポート (互換性維持)
 * ==============================================================================
 */
export const getUnifiedProductDetail = getAdultProductDetail;