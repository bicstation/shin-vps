/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (shared/lib/api/django/client.ts)
 * 🛡️ Maya's Zenith v4.0: URL解決ロジック完全版
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string) => {
    // スラッシュの重複を防ぎ、必ず / から始まるように正規化
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (IS_SERVER) {
        // Docker内部通信: http://django-v3:8000 + /api/...
        const internalUrl = process.env.API_INTERNAL_URL || 'http://django-v3:8000';
        return `${internalUrl}${cleanEndpoint}`;
    }

    // ブラウザ通信: /api + /api/... (Next.js Proxy経由) または絶対URL
    const rootUrl = getDjangoBaseUrl(); 
    const base = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    
    return `${base}${cleanEndpoint}`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = () => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // データの形状を { results, count } に統一
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // すでに DRF 形式 (results, count 保持) ならそのまま、そうでなければラップして返す
        return (data && typeof data === 'object' && 'results' in data) 
            ? data 
            : { results: data.data || data.results || [], count: data.count || 0 };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] Failed to parse response from: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}