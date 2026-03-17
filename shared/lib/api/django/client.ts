/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (shared/lib/api/django/client.ts)
 * 🛡️ Maya's Zenith v5.1: URL解決・二重API防止・スラッシュ自動補完
 * =====================================================================
 */
import { getDjangoBaseUrl, IS_SERVER } from '../config';

/**
 * 💡 接続先URLを解決 (Network Path Resolver)
 * 1. エンドポイントから重複する "api/" やスラッシュを徹底排除
 * 2. サーバー/クライアント環境に応じたベースURLを付与
 * 3. 常に "/api/endpoint/" の形に整形し、Djangoの404を根絶します。
 */
export const resolveApiUrl = (endpoint: string) => {
    // 1. エンドポイントの正規化
    // 先頭の "api/" 削除 -> 先頭/末尾のスラッシュ削除
    const cleanEndpoint = endpoint
        .replace(/^api\//, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    // 2. ベースURLの決定
    let baseUrl: string;

    if (IS_SERVER) {
        /**
         * 🚀 Server Side: Docker内部ネットワーク通信
         * django-v3 コンテナへ直接ルートを飛ばします
         */
        baseUrl = (process.env.API_INTERNAL_URL || 'http://django-v3:8000').replace(/\/+$/, '');
    } else {
        /**
         * 🌐 Client Side: ブラウザからの通信
         * Traefik Proxy 経由で解決します
         */
        baseUrl = getDjangoBaseUrl().replace(/\/+$/, '');
    }

    // 3. 結合: [Base] + [/api/] + [CleanEndpoint] + [/]
    // Djangoは末尾スラッシュがないと 301 Redirect または 404 を返すため厳守
    return `${baseUrl}/api/${cleanEndpoint}/`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = () => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // 必要に応じてここにキャッシュ制御やAPIキーを追加可能
    };
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 * Django DRFの標準形式 { results: [], count: 0 } への正規化を保証
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        // 404/500エラーのログ出力を強化
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | Target: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // 1. すでに DRF 標準形式（resultsあり）の場合
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // 2. 単純な配列が返ってきた場合
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // 3. オブジェクト単体（Detail系）が返ってきた場合
        if (data && typeof data === 'object') {
            // data.data 等に包まれている可能性も考慮
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1 
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        // JSONパース失敗（DjangoがエラーHTMLを返した時など）の防護
        console.error(`🚨 [JSON Parse Error] Failed to parse response from: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}