/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (shared/lib/api/django/client.ts)
 * =====================================================================
 * 【責務】
 * 1. 実行環境（SSR/CSR）に応じた Django 接続先URLの動的解決
 * 2. 共通リクエストヘッダーの管理
 * 3. フェッチレスポンスの安全なパースとエラーハンドリング
 * =====================================================================
 */
// shared/lib/api/django/client.ts
import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決 (Network Path Resolver)
 * サーバーサイド(Docker内部ネットワーク)とクライアントサイド(ブラウザ)で
 * 最適な Django のベースURLを返します。
 */
export const resolveApiUrl = (endpoint: string) => {
    // スラッシュの重複を防ぐためのクリーンアップ
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    /**
     * 🚀 Server Side (SSR/ISR)
     * Docker ネットワーク内のサービス名 'django-v3' を直接指定。
     * 外部ドメインを経由しないため、最速かつ DNS トラブル（EAI_AGAIN）を回避します。
     */
    if (IS_SERVER) {
        const internalUrl = process.env.API_INTERNAL_URL || 'http://django-v3:8000';
        return `${internalUrl}${cleanEndpoint}`;
    }

    /**
     * 🌐 Client Side (Browser)
     * ブラウザから見える公開 URL（通常はオリジン）を使用します。
     */
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
        // 必要に応じて将来的に Authorization ヘッダーなどをここに追加可能
    };
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 * パース失敗や HTTP エラー時にアプリケーションをクラッシュさせず、
 * 常に一貫したデータ構造（{ results, count }）を保証します。
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    // 1. HTTP エラーの検知 (4xx, 5xx)
    if (!res.ok) {
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        
        // 404 等で HTML (nginx error page) が返ってきた場合でも安全に復帰
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        /**
         * 🔍 Maya's Logic: レスポンス形状の統一
         * Django が直接リスト `[...]` を返す場合と、
         * DRF の標準的な `{"results": [...], "count": 10}` を返す場合の両方を吸収します。
         */
        if (Array.isArray(data)) {
            return { 
                results: data, 
                count: data.length 
            };
        }
        
        // すでにオブジェクト形式であればそのまま返す
        return data || { results: [], count: 0 };

    } catch (e) {
        /**
         * 🚨 パースエラー（JSON ではないものが返ってきた場合）
         */
        console.error(`🚨 [JSON Parse Error] Failed to parse response from: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}