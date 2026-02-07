/**
 * =====================================================================
 * 💻 Django API サービス層 (shared/lib/api/django.ts)
 * 🚀 完全版：デバッグ情報・型安全性・エラーハンドリング全搭載
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from './config';
import { getSiteMetadata } from '../siteConfig';

// 💡 内部用型定義（他ファイルに依存せず安定動作させるため）
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
    [key: string]: any;
}

/**
 * 💡 接続先URLを解決
 * IS_SERVER (Server Components実行) かどうかで向き先を自動切替
 */
const resolveApiUrl = (endpoint: string) => {
    if (IS_SERVER) {
        // 🚀 サーバーサイド: Docker内部ネットワークを使用
        // ※ django-v2 は docker-compose.yml のサービス名
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
            // DjangoのALLOWED_HOSTSを突破するために本来のドメインをHostにセット
            headers['Host'] = hostName;
        } catch (e) {
            // 解析不能な場合はスキップ
        }
    }
    return headers;
};

/**
 * 💡 究極のデバッグハンドラ (省略なし)
 * JSONが壊れている場合やHTML(404/500)が返った場合に詳細を解析
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

    // 🚩 F12コンソールやターミナルに表示するための詳細オブジェクト
    const debugInfo = {
        url,
        status: res.status,
        statusText: res.statusText,
        contentType,
        isHtml,
        bodySnippet: rawText.slice(0, 800), // 長めに取得
        timestamp: new Date().toLocaleTimeString(),
        serverSide: IS_SERVER
    };

    // サーバーサイドのログ（Dockerコンソール用）
    if (!res.ok || isHtml) {
        console.error(`[DJANGO API ERROR LOG] 🚨`, JSON.stringify(debugInfo, null, 2));
    }

    if (!res.ok || isHtml) {
        return { 
            results: [], 
            count: 0, 
            _error: true, 
            _debug: debugInfo 
        };
    }

    try {
        const json = JSON.parse(rawText);
        // JSONデータにデバッグ情報を付与して返す
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

// =====================================================================
// 🔞 アダルト製品セクション (メイン)
// =====================================================================

/**
 * 🔞 アダルト商品一覧取得
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
            signal: AbortSignal.timeout(10000) // 10秒でタイムアウト
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
 * 🔞 アダルト商品詳細取得
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

// =====================================================================
// 💻 PC製品セクション
// =====================================================================

/**
 * 💻 PC製品一覧取得
 */
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

/**
 * 💻 PC商品詳細取得
 */
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

// =====================================================================
// 🏢 共通セクション
// =====================================================================

/**
 * 🏢 メーカー一覧取得
 */
export async function fetchMakers(): Promise<any> {
    const url = resolveApiUrl(`/api/makers/`);
    try {
        const res = await fetch(url, { 
            headers: getDjangoHeaders(),
            next: { revalidate: 3600 } 
        });
        const data = await handleResponseWithDebug(res, url);
        // 配列またはresultsプロパティを返す
        const list = Array.isArray(data) ? data : (data?.results || []);
        // デバッグ情報をプロパティとして隠し持つ
        (list as any)._debug = data?._debug;
        return list;
    } catch (e: any) {
        const empty: any[] = [];
        (empty as any)._debug = { error: e.message, url };
        return empty;
    }
}