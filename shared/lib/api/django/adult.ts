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
    if (Array.isArray(data)) return data;
    // Django REST Framework の結果(results) または 自作APIの(data.results / data.data)を吸収
    return data.results || data.data || (Array.isArray(data) ? data : []);
};

/** 💡 [INTERNAL] ナビゲーション取得コア */
async function fetchBaseNavigation(targetKey: 'FANZA（アダルト）' | 'DMM.com（一般）') {
    try {
        const res = await fetch(resolveApiUrl('/api/navigation/floors/'), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const json = await res.json();
        const allData = json.data || {};
        const siteMenu = allData[targetKey];
        return siteMenu?.services || {};
    } catch (error) { 
        console.error(`${targetKey}_NAVIGATION_FETCH_FAILED:`, error);
        return {}; 
    }
}

/**
 * ==============================================================================
 * 💡 1. 製品詳細 & アーカイブ取得 (Core)
 * ==============================================================================
 */

/** 💡 製品詳細取得: IDの接頭辞に基づいてエンドポイントを自動スイッチ */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
    const idStr = String(id);
    const lowerSource = source?.toLowerCase();
    
    // FANZA/DMM系のID、またはソース指定がある場合は FanzaProductDetailAPIView へ
    const isFanza = idStr.startsWith('DMM_') || idStr.startsWith('FANZA_') || idStr.startsWith('fz_') || 
                    ['fanza', 'dmm'].includes(lowerSource);
    
    const endpoint = isFanza 
        ? `/api/fanza-products/${idStr}/` 
        : `/api/adult-products/${idStr}/`;
    
    try {
        const res = await fetch(resolveApiUrl(endpoint), { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });
        const data = await handleResponseWithDebug(res, resolveApiUrl(endpoint));
        return (data && !data._error) ? data : null;
    } catch { return null; }
}

/** 💡 統合製品一覧 (Unified): バックエンドの UnifiedAdultProductListView に直結 */
export async function getUnifiedProducts(params: any = {}) {
    const { site_group } = getSiteMetadata(); 

    const cleanParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
        const val = params[key];
        if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
            // フロントの 'service/floor' キーをバックエンドの 'service_code/floor_code' にマッピング
            let targetKey = key;
            if (key === 'service') targetKey = 'service_code';
            if (key === 'floor') targetKey = 'floor_code';
            
            cleanParams[targetKey] = String(val).toLowerCase(); // 徹底した小文字化
        }
    });

    const queryPayload = { 
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
        const res = await fetch(resolveApiUrl(`/api/adult-products/?${query}`), { 
            headers: getDjangoHeaders() 
        });
        const data = await res.json();
        return { results: safeExtract(data), count: data?.count || 0 };
    } catch { return { results: [], count: 0 }; }
}

/**
 * ==============================================================================
 * 💡 2. マーケット分析 & サイドバー集計 (Analysis)
 * ==============================================================================
 */

export async function getPlatformAnalysis(source: string, params: any = {}) {
    const queryParams = {
        source: source?.toLowerCase(),
        ...params
    };
    
    // floorキーワードの変換
    if (params.floor) {
        queryParams.floor_code = params.floor;
        delete queryParams.floor;
    }

    const query = new URLSearchParams(queryParams);
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/analysis/?${query}`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        // PlatformMarketAnalysisAPIView は { source, service, ..., data } もしくは直出し
        return data.data ? data.data : data;
    } catch (err) { 
        console.error("ANALYSIS_FETCH_ERROR:", err);
        return null; 
    }
}

/**
 * ==============================================================================
 * 💡 3. プラットフォーム別メニュー構造
 * ==============================================================================
 */

export async function getFanzaDynamicMenu() { return fetchBaseNavigation('FANZA（アダルト）'); }
export async function getDmmDynamicMenu() { return fetchBaseNavigation('DMM.com（一般）'); }

/**
 * ==============================================================================
 * 💡 4. 各種マスタデータ一覧 (Masters)
 * ==============================================================================
 */

/** 💡 万能仕分けインデックス取得 (A-Z/50音 検索用) */
export async function fetchAdultTaxonomyIndex(type: string, floorCode?: string) {
    try {
        let url = `/api/adult/taxonomy/?type=${type}`;
        if (floorCode) url += `&floor_code=${floorCode.toLowerCase()}`;
        const res = await fetch(resolveApiUrl(url), { 
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
        return { type, results: [], total_count: 0 };
    }
}

/** 💡 マスタ系関数群 (各モデルに対応) */
export const fetchMakers = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/makers/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

export const fetchGenres = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/genres/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

export const fetchSeries = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/series/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

export const fetchDirectors = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/directors/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

export const fetchAuthors = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/authors/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

export const fetchActresses = async (p?: any) => {
    const res = await fetch(resolveApiUrl(`/api/actresses/?${new URLSearchParams(p)}`), { headers: getDjangoHeaders() });
    const data = await res.json();
    return { results: safeExtract(data), count: data?.count || 0 };
};

/** 💡 スコアランキング取得 (spec_scoreベース) */
export async function fetchAdultProductRanking() {
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/ranking/`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        return { results: safeExtract(data), count: data?.count || 0 };
    } catch { return { results: [], count: 0 }; }
}

// 互換性のためのエイリアス
export const getUnifiedProductDetail = getAdultProductDetail;