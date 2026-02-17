/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🚀 内部ロジック: 競合回避 & 階層吸収
 * ==============================================================================
 */

/** 💡 汎用データ抽出: Djangoのページネーション有無にかかわらず配列を返す */
const safeExtract = (data: any) => {
    if (!data) return [];
    // taxonomy APIやfloor navigationのように "results" または "data" キーを持つオブジェクトを処理
    if (Array.isArray(data)) return data;
    return data.results || data.data || [];
};

/**
 * ==============================================================================
 * 💡 1. 製品詳細 & アーカイブ取得 (Core)
 * ==============================================================================
 */

/** 💡 製品詳細取得 (FANZA/Django自動振り分け) */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
    const idStr = String(id);
    const endpoint = (idStr.startsWith('DMM_') || idStr.startsWith('FANZA_') || source === 'DMM' || source === 'FANZA') 
        ? `/api/fanza-products/${idStr}/` : `/api/adult-products/${idStr}/`;
    
    try {
        const res = await fetch(resolveApiUrl(endpoint), { headers: getDjangoHeaders(), cache: 'no-store' });
        const data = await handleResponseWithDebug(res, resolveApiUrl(endpoint));
        return (data && !data._error) ? data : null;
    } catch { return null; }
}

/** 💡 統合製品一覧 (Unified) - サービス・フロア対応版 */
export async function getUnifiedProducts(params: any = {}) {
    const { site_group } = getSiteMetadata(); 

    // 1. パラメータのクリーンアップ (undefinedや空文字を除去)
    const cleanParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
        const val = params[key];
        if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
            // [floor] や [service] のパスパラメータ名を Django API のクエリ名に正規化
            const targetKey = key === 'service' ? 'service_code' : (key === 'floor' ? 'floor_code' : key);
            cleanParams[targetKey] = String(val);
        }
    });

    // 2. クエリ構築
    const queryPayload = { 
        site_group: site_group || 'adult', 
        ...cleanParams 
    };
    
    const queryString = new URLSearchParams(queryPayload).toString();
    const targetUrl = resolveApiUrl(`/api/unified-adult-products/?${queryString}`);

    try {
        const res = await fetch(targetUrl, { 
            headers: getDjangoHeaders(),
            cache: 'no-store' 
        });

        if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);

        const data = await res.json();
        return { 
            results: safeExtract(data), 
            count: data?.count || 0,
            next: data?.next || null,
            previous: data?.previous || null
        };
    } catch (error) { 
        console.error("UNIFIED_FETCH_FAILED:", error);
        return { results: [], count: 0 }; 
    }
}

/** 💡 個別製品一覧 (Standard) */
export async function getAdultProducts(params: any = {}) {
    const query = new URLSearchParams(params);
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/?${query}`), { headers: getDjangoHeaders() });
        const data = await res.json();
        return { results: safeExtract(data), count: data?.count || 0 };
    } catch { return { results: [], count: 0 }; }
}

/**
 * ==============================================================================
 * 💡 2. マーケット分析 & サイドバー集計 (Analysis)
 * ==============================================================================
 */

/** 💡 サイドバー用の集計データ取得 (フロア絞り込み対応) */
export async function getPlatformAnalysis(source: string, params: any = {}) {
    const queryParams = {
        api_source: source?.toUpperCase(),
        ...params
    };
    // パラメータ名が重複する場合のクリーンアップ
    if (queryParams.source) delete queryParams.source;
    if (params.floor) queryParams.floor_code = params.floor;

    const query = new URLSearchParams(queryParams);
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/analysis/?${query}`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        // Django側のResponse構造に合わせて抽出
        return data.data ? data.data : data;
    } catch (err) { 
        console.error("ANALYSIS_FETCH_ERROR:", err);
        return null; 
    }
}

/**
 * ==============================================================================
 * 💡 3. プラットフォーム別メニュー構造 (Menu Structure)
 * ==============================================================================
 */

/** 💡 [NEW] FANZAの階層構造をDBマスタから取得 (Next.js サイドバー用) */
export async function getFanzaDynamicMenu(serviceCode?: string) {
    try {
        const query = serviceCode ? `?service_code=${serviceCode}` : '';
        const res = await fetch(resolveApiUrl(`/api/navigation/floors/${query}`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } // メニューは1時間キャッシュ
        });
        const json = await res.json();
        return json.data || []; 
    } catch (error) { 
        console.error("FANZA_MENU_FETCH_FAILED:", error);
        return []; 
    }
}

// 他プラットフォームも統合Viewに寄せていく設計
export async function getDugaDynamicMenu() {
    try {
        const res = await fetch(resolveApiUrl('/api/duga/menu-structure/'), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
}

export async function getDmmDynamicMenu() {
    // getFanzaDynamicMenu と同様に site_code=DMM で取得可能
    return getFanzaDynamicMenu();
}

/**
 * ==============================================================================
 * 💡 4. 各種マスタデータ一覧 (Masters)
 * ==============================================================================
 */

/** * 💡 [NEW] 万能仕分けインデックス取得 (フロア対応版)
 * ジャンル、女優、メーカー等の全件リストを "あいうえお表示用" に一括取得する
 */
export async function fetchAdultTaxonomyIndex(
    type: 'genres' | 'actresses' | 'makers' | 'series' | 'directors' | 'authors',
    floorCode?: string
) {
    try {
        let url = `/api/adult/taxonomy/?type=${type}`;
        if (floorCode) url += `&floor_code=${floorCode}`;

        const targetUrl = resolveApiUrl(url);
        const res = await fetch(targetUrl, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return {
            type: data.type,
            results: safeExtract(data),
            total_count: data.total_count || 0
        };
    } catch (error) {
        console.error(`TAXONOMY_FETCH_FAILED (${type}):`, error);
        return { type, results: [], total_count: 0 };
    }
}

export const fetchMakers = async (p?: any) => {
    try {
        const res = await fetch(resolveApiUrl(`/api/makers/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
};

export const fetchGenres = async (p?: any) => {
    try {
        const res = await fetch(resolveApiUrl(`/api/genres/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
};

export const fetchSeries = async (p?: any) => {
    try {
        const res = await fetch(resolveApiUrl(`/api/series/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
};

export const fetchDirectors = async (p?: any) => {
    try {
        const res = await fetch(resolveApiUrl(`/api/directors/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
};

export const fetchAuthors = async (p?: any) => {
    try {
        const res = await fetch(resolveApiUrl(`/api/authors/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
};

/** 💡 ランキング取得 */
export async function fetchAdultProductRanking() {
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/ranking/`), { headers: getDjangoHeaders() });
        const data = await res.json();
        return { results: safeExtract(data), count: data?.count || 0 };
    } catch { return { results: [], count: 0 }; }
}

export const getUnifiedProductDetail = getAdultProductDetail;