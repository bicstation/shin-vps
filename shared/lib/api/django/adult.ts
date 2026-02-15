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
    return Array.isArray(data) ? data : (data.results || []);
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

/** 💡 統合製品一覧 (Unified) */
export async function getUnifiedProducts(params: any = {}) {
    const { site_group } = getSiteMetadata(); 
    const query = new URLSearchParams({ site_group: site_group || 'adult', ...params });
    try {
        const res = await fetch(resolveApiUrl(`/api/unified-adult-products/?${query}`), { headers: getDjangoHeaders() });
        const data = await res.json();
        return { results: safeExtract(data), count: data?.count || 0 };
    } catch { return { results: [], count: 0 }; }
}

/** 💡 個別製品一覧 (Standard) */
export async function getAdultProducts(params: any = {}) {
    const query = new URLSearchParams({ ...params });
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

/** * 💡 サイドバー用の集計データ取得 
 * 修正点: パラメータ名を api_source に柔軟に対応させ、トップページ用の mode を許容 
 */
export async function getPlatformAnalysis(source: string, params: any = {}) {
    // 💡 既存の 'source' キーと新しい 'api_source' キーの両方を考慮
    const queryParams = {
        api_source: source.toUpperCase(),
        ...params
    };
    
    // もし引数に source が直接入っていたら削除して api_source に統一
    if (queryParams.source) delete queryParams.source;

    const query = new URLSearchParams(queryParams);
    
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/analysis/?${query}`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } // 統計データなので1時間キャッシュ
        });
        const data = await res.json();
        // Djangoが results で包んでいる場合と、生の集計オブジェクトの場合の両方をカバー
        return data.results ? data.results : data;
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

/** 💡 FANZA ダイナミックメニュー取得 */
export async function getFanzaDynamicMenu() {
    try {
        const res = await fetch(resolveApiUrl('/api/fanza/menu-structure/'), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
}

/** 💡 DUGA ダイナミックメニュー取得 */
export async function getDugaDynamicMenu() {
    try {
        const res = await fetch(resolveApiUrl('/api/duga/menu-structure/'), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
}

/** 💡 DMM(一般) ダイナミックメニュー取得 */
export async function getDmmDynamicMenu() {
    try {
        const res = await fetch(resolveApiUrl('/api/dmm/menu-structure/'), { headers: getDjangoHeaders() });
        return safeExtract(await res.json());
    } catch { return []; }
}

/**
 * ==============================================================================
 * 💡 4. 各種マスタデータ一覧 (Masters)
 * ==============================================================================
 */

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

/**
 * ==============================================================================
 * 🔄 別名エクスポート
 * ==============================================================================
 */
export const getUnifiedProductDetail = getAdultProductDetail;