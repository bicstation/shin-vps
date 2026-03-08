/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (shared/lib/api/django/client.ts)
 * 🛡️ Maya's Zenith v5.0: URL解決・/api 自動補完・完全版
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決 (Network Path Resolver)
 * エンドポイントの前に必ず "/api" を自動で差し込み、不整合を抹殺します。
 */
export const resolveApiUrl = (endpoint: string) => {
    // 1. エンドポイントの掃除 (先頭と末尾のスラッシュを整理)
    const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');

    if (IS_SERVER) {
        /**
         * 🚀 Server Side: Docker内部通信
         * 環境変数（http://django-v3:8000）＋ /api ＋ エンドポイント
         */
        const internalBase = (process.env.API_INTERNAL_URL || 'http://django-v3:8000').replace(/\/+$/, '');
        // 💡 ログに出ていた /adult/... を /api/adult/... に矯正します
        return `${internalBase}/api/${cleanEndpoint}/`;
    }

    /**
     * 🌐 Client Side: ブラウザ通信 (Traefik 経由)
     * getDjangoBaseUrl() ＋ /api ＋ エンドポイント
     */
    const rootUrl = getDjangoBaseUrl().replace(/\/+$/, '');
    
    // 💡 ブラウザ側でも確実に /api をルートに据えます
    return `${rootUrl}/api/${cleanEndpoint}/`;
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
        // ここで 404 や 500 が出た場合、Django 側の URL 設定（urls.py）を見直すサイン
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // データの形状を { results, count } に統一
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // DRF (Django Rest Framework) 形式の互換性を確保
        return (data && typeof data === 'object' && 'results' in data) 
            ? data 
            : { results: data.data || data.results || [], count: data.count || 0 };

    } catch (e) {
        // HTML（<h1>Django...</h1>）が返ってくるとここで爆発します
        console.error(`🚨 [JSON Parse Error] Failed to parse response from: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}