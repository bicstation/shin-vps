/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/shared/lib/api/django/adult.ts
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
    // Django REST Framework の標準的なレスポンス形式 (results) または直接の配列を処理
    return Array.isArray(data) ? data : (data.results || []);
};

/** 💡 クエリパラメータの正規化: undefinedやnullを除去してURLSearchParamsに変換 */
const buildQueryString = (params: any = {}) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    return new URLSearchParams(cleanParams).toString();
};

/**
 * ==============================================================================
 * 💡 1. 製品詳細 & アーカイブ取得 (Core)
 * ==============================================================================
 */

/** 💡 製品詳細取得 (FANZA/Django自動振り分け) */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
    const idStr = String(id);
    // IDの接頭辞または明示的なsource指定により、叩くエンドポイントを自動判定
    const isFanza = idStr.startsWith('DMM_') || idStr.startsWith('FANZA_') || 
                    source === 'DMM' || source === 'FANZA';
    
    const endpoint = isFanza ? `/api/fanza-products/${idStr}/` : `/api/adult-products/${idStr}/`;
    
    try {
        const res = await fetch(resolveApiUrl(endpoint), { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });
        const data = await handleResponseWithDebug(res, resolveApiUrl(endpoint));
        return (data && !data._error) ? data : null;
    } catch (err) {
        console.error(`DETAIL_FETCH_ERROR [${idStr}]:`, err);
        return null; 
    }
}

/** 💡 統合製品一覧 (Unified: FANZA/DUGA混合) */
export async function getUnifiedProducts(params: any = {}) {
    const { site_group } = getSiteMetadata(); 
    const queryString = buildQueryString({ 
        site_group: site_group || 'adult', 
        ...params 
    });
    
    try {
        const res = await fetch(resolveApiUrl(`/api/unified-adult-products/?${queryString}`), { 
            headers: getDjangoHeaders(),
            cache: 'no-store'
        });
        const data = await res.json();
        return { 
            results: safeExtract(data), 
            count: data?.count || 0 
        };
    } catch (err) {
        console.error("UNIFIED_PRODUCTS_ERROR:", err);
        return { results: [], count: 0 }; 
    }
}

/** 💡 個別製品一覧 (Standard: 主にDUGA/統合DB) */
export async function getAdultProducts(params: any = {}) {
    // api_source が小文字の場合は大文字に変換して送信
    if (params.api_source) params.api_source = params.api_source.toUpperCase();
    
    const queryString = buildQueryString(params);
    
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/?${queryString}`), { 
            headers: getDjangoHeaders(),
            cache: 'no-store'
        });
        const data = await res.json();
        return { 
            results: safeExtract(data), 
            count: data?.count || 0 
        };
    } catch (err) {
        console.error("ADULT_PRODUCTS_ERROR:", err);
        return { results: [], count: 0 }; 
    }
}

/**
 * ==============================================================================
 * 💡 2. マーケット分析 & サイドバー集計 (Analysis)
 * ==============================================================================
 */

/** 💡 サイドバー用の集計データ取得 (復旧版) */
export async function getPlatformAnalysis(source: string, params: any = {}) {
    // 💡 重要: Django側 (PlatformMarketAnalysisAPIView) の source 引数に合わせる
    // 'video' が来たら 'DUGA' に、'fanza' が来たら 'FANZA' に正規化
    let normalizedSource = source?.toUpperCase() || 'DUGA';
    if (normalizedSource === 'VIDEO') normalizedSource = 'DUGA';

    const queryParams = {
        source: normalizedSource,
        ...params
    };
    
    // api_source キーが混入している場合は source に寄せて削除
    if (queryParams.api_source) delete queryParams.api_source;

    const queryString = buildQueryString(queryParams);
    const url = resolveApiUrl(`/api/adult-products/analysis/?${queryString}`);
    
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } // 統計データなので1時間キャッシュ
        });
        
        if (!res.ok) throw new Error(`SIDEBAR_FETCH_HTTP_ERROR: ${res.status}`);

        const data = await res.json();

        /**
         * 💡 ブラウザでの確認結果に基づき、トップレベルのキーをそのまま返却。
         * data.results ではなく data 直下の配列を参照します。
         */
        return {
            genres: data.genres || [],
            makers: data.makers || [],
            series: data.series || [],
            actresses: data.actresses || [],
            directors: data.directors || [],
            authors: data.authors || [],
            total_nodes: data.total_nodes || 0,
            status: data.status || 'OK'
        };
    } catch (err) { 
        console.error("ANALYSIS_FETCH_ERROR:", err, url);
        return { genres: [], makers: [], series: [], actresses: [], directors: [], authors: [], total_nodes: 0 }; 
    }
}

/**
 * ==============================================================================
 * 💡 3. 各種マスタデータ一覧 (Masters)
 * ==============================================================================
 */

/** 💡 共通マスタフェッチャー生成関数 */
const createMasterFetcher = (endpoint: string) => async (p?: any) => {
    try {
        const queryString = buildQueryString(p);
        const res = await fetch(resolveApiUrl(`${endpoint}?${queryString}`), { 
            headers: getDjangoHeaders() 
        });
        return safeExtract(await res.json());
    } catch { 
        return []; 
    }
};

export const fetchMakers = createMasterFetcher('/api/makers/');
export const fetchGenres = createMasterFetcher('/api/genres/');
export const fetchSeries = createMasterFetcher('/api/series/');
export const fetchDirectors = createMasterFetcher('/api/directors/');
export const fetchAuthors = createMasterFetcher('/api/authors/');
export const fetchActresses = createMasterFetcher('/api/actresses/');

/** 💡 AIランキング取得 */
export async function fetchAdultProductRanking() {
    try {
        const res = await fetch(resolveApiUrl(`/api/adult-products/ranking/`), { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const data = await res.json();
        return { 
            results: safeExtract(data), 
            count: data?.count || 0 
        };
    } catch { 
        return { results: [], count: 0 }; 
    }
}

/**
 * ==============================================================================
 * 🔄 別名・互換エクスポート
 * ==============================================================================
 */
export const getUnifiedProductDetail = getAdultProductDetail;