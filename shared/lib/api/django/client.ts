/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.0 - Hybrid Host Resolution)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. ローカル(api-xxx-host)と本番(api.xxx.com)の Host ヘッダー自動切替。
 * 2. サーバーサイド(SSR)通信時の Django コンテナ直撃ロジック。
 * 3. PROJECT_NAME に基づく動的なサイト識別。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    
    // 1. エンドポイントの正規化 (二重スラッシュ防止)
    const cleanEndpoint = endpoint
        .replace(/^api\//, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    // 2. "/api" の二重付与を防止
    const rootUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // 3. 結合: Django の APPEND_SLASH=True に対応するため末尾スラッシュを付与
    return `${rootUrl}/api/${cleanEndpoint}/`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 * SSR時は、DjangoのMiddlewareがサイト判定に使用する「Hostヘッダー」を偽装・注入します。
 */
export const getDjangoHeaders = () => {
    const { host } = getWpConfig();
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    /**
     * 🚀 Server Side (SSR) 限定の処理
     * Django コンテナ(django-v3:8000)に直接リクエストを送る際、
     * Host ヘッダーを本来のドメイン(api-avflash-host 等)に書き換えることで
     * Django 側の Middleware 判定を正常に機能させます。
     */
    if (IS_SERVER) {
        headers['Host'] = host;
    }

    return headers;
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 * どんな形式のレスポンスも { results: [], count: 0 } に標準化します。
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // 1. DRF 標準形式 (Pagination)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // 2. 配列直返し
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // 3. 単体オブジェクト (Detail)
        if (data && typeof data === 'object') {
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1 
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}