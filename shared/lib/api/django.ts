/**
 * =====================================================================
 * 💻 Django API サービス層 (shared/lib/api/django.ts)
 * 🚀 完全版：デバッグ情報・型安全性・エラーハンドリング全搭載
 * 🏗️ 混合モデル（一覧・仕訳）と個別モデル（詳細）の完全共存仕様
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from './config';
import { getSiteMetadata } from '../siteConfig';

// --------------------------------------------------------------------------
// 💡 型定義
// --------------------------------------------------------------------------

export interface PCProduct {
    id: number;
    unique_id: string;
    name: string;
    price: number;
    image_url?: string;
    [key: string]: any;
}

export interface AdultProduct {
    id: number;
    title: string;
    name?: string;
    price?: number;
    image_url?: string;
    image_url_list?: string[];
    source?: 'fanza' | 'duga'; // サイト判別用
    [key: string]: any;
}

// マスターデータ（仕訳：ジャンル・女優・メーカー等）用共通型
export interface Entity {
    id: number;
    name: string;
    ruby?: string;
    slug?: string;
    product_count?: number;
}

// --------------------------------------------------------------------------
// 💡 内部ユーティリティ
// --------------------------------------------------------------------------

/**
 * 💡 接続先URLを解決
 */
const resolveApiUrl = (endpoint: string) => {
    if (IS_SERVER) {
        // 🚀 サーバーサイド: Docker内部ネットワークを使用
        return `http://django-v2:8000${endpoint}`;
    }
    // 🌐 クライアントサイド: ブラウザから見える外部URL
    const rootUrl = getDjangoBaseUrl(); 
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    return `${base}${endpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダー
 */
const getDjangoHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        try {
            const rootUrl = getDjangoBaseUrl();
            const hostName = new URL(rootUrl).hostname;
            headers['Host'] = hostName;
        } catch (e) {
            // ignore
        }
    }
    return headers;
};

/**
 * 💡 究極のデバッグハンドラ
 * JSON解析エラーやHTMLエラーレスポンスを詳細にログ出力
 */
async function handleResponseWithDebug(res: Response, url: string) {
    const contentType = res.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    
    let rawText = "";
    try {
        rawText = await res.text();
    } catch (e) {
        rawText = "FAILED_TO_READ_BODY";
    }

    const debugInfo = {
        url,
        status: res.status,
        statusText: res.statusText,
        contentType,
        isHtml,
        bodySnippet: rawText.slice(0, 800),
        timestamp: new Date().toLocaleTimeString(),
        serverSide: IS_SERVER
    };

    if (!res.ok || isHtml) {
        console.error(`[DJANGO API ERROR LOG] 🚨`, JSON.stringify(debugInfo, null, 2));
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo 
        };
    }

    try {
        const json = JSON.parse(rawText);
        return { 
            ...json, 
            _debug: debugInfo 
        };
    } catch (e) {
        console.error(`[JSON PARSE ERROR] 🚨 URL: ${url}`);
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo 
        };
    }
}

// --------------------------------------------------------------------------
// 🔞 アダルト製品セクション (混合 & 個別)
// --------------------------------------------------------------------------

/**
 * 🔞 アダルト商品一覧取得 (混合モデル)
 * FANZA/DUGAを統合したエンドポイントを叩きます
 */
export async function getAdultProducts(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult', 
        ...params 
    });
    
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
        console.error(`[getAdultProducts CRITICAL FAILURE]: ${e.message}`);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

/**
 * 🔞 アダルト商品詳細取得 (個別モデル)
 * 特定のIDに基づき、詳細な個別サイトデータを取得します
 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null | any> {
    const url = resolveApiUrl(`/api/adult-products/${id}/`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 60 } 
        });
        return await handleResponseWithDebug(res, url);
    } catch (e: any) {
        return { _error: true, _debug: { error: e.message, url } };
    }
}

/**
 * 🔞 アダルト商品ランキング取得 (混合モデル)
 */
export async function fetchAdultProductRanking(params: any = {}): Promise<{ results: AdultProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'adult',
        ordering: '-spec_score',
        ...params 
    });
    
    const url = resolveApiUrl(`/api/adult-products/ranking/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(10000)
        });

        const data = await handleResponseWithDebug(res, url);
        return {
            results: data.results || [],
            count: data.count || 0,
            _debug: data._debug
        };
    } catch (e: any) {
        console.error(`[fetchAdultProductRanking CRITICAL FAILURE]: ${e.message}`);
        return { results: [], count: 0, _debug: { error: e.message, url } };
    }
}

// --------------------------------------------------------------------------
// 🏢 マスターデータ（仕訳・混合モデル）取得
// --------------------------------------------------------------------------

/**
 * 共通のエンティティ取得関数（内部用）
 */
async function fetchEntities(path: string, params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams({ ordering: '-product_count', ...params });
    const url = resolveApiUrl(`${path}?${queryParams.toString()}`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
        });
        const data = await handleResponseWithDebug(res, url);
        const list = data.results || (Array.isArray(data) ? data : []);
        // デバッグ情報を配列に隠し持つ
        (list as any)._debug = data._debug;
        return list;
    } catch (e) {
        const empty: any[] = [];
        (empty as any)._debug = { error: e.message, url };
        return empty;
    }
}

export const fetchGenres = (params?: any) => fetchEntities('/api/genres/', params);
export const fetchActresses = (params?: any) => fetchEntities('/api/actresses/', params);
export const fetchMakers = (params?: any) => fetchEntities('/api/makers/', params);
export const fetchSeries = (params?: any) => fetchEntities('/api/series/', params);
export const fetchLabels = (params?: any) => fetchEntities('/api/labels/', params);

// --------------------------------------------------------------------------
// 💻 PC製品セクション
// --------------------------------------------------------------------------

export async function fetchPCProducts(params: any = {}): Promise<{ results: PCProduct[]; count: number; _debug?: any }> {
    const { site_group } = getSiteMetadata(); 
    const queryParams = new URLSearchParams({ 
        site_group: site_group || 'common', 
        ...params 
    });
    const url = resolveApiUrl(`/api/pc-products/?${queryParams.toString()}`);

    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            next: { revalidate: 3600 } 
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

export async function fetchPCProductDetail(unique_id: string): Promise<PCProduct | null | any> {
    const url = resolveApiUrl(`/api/pc-products/${unique_id}/`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(), 
            cache: 'no-store' 
        });
        return await handleResponseWithDebug(res, url);
    } catch (e: any) {
        return { _error: true, _debug: { error: e.message, url } };
    }
}