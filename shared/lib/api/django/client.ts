/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.6 - Final Protocol)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【ポート番号の抹殺】manualHost から ":8083" 等のポートを完全除去。
 * 2. 【末尾スラッシュの制御】クエリ(?...)がある場合は直前のみスラッシュ、末尾はナシ。
 * 3. 【SSR身分証の統一】Django Middleware が識別できる Host ヘッダーを動的生成。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 * 🚀 修正: クエリパラメータ(?...)の手前にはスラッシュを保証し、末尾には付けない。
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. ポート番号を除去したクリーンなホスト名を取得 (URL解決用)
    const cleanManualHost = manualHost ? manualHost.split(':')[0] : undefined;
    const config = getWpConfig(cleanManualHost);
    const baseUrl = config.baseUrl;
    
    // 2. エンドポイントの前後スラッシュを一旦除去して正規化
    let cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');

    // 3. "/api" の二重付与を防止
    const rootUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    /**
     * 🎯 結合ロジック (Slash vs Query Security)
     * Django はパスの末尾にスラッシュを求めるが、クエリの末尾には不要。
     * ここで site=xxx/ になるのを物理的に防ぐ。
     */
    if (cleanEndpoint.includes('?')) {
        // クエリがある場合: posts/ + ?limit=... の形にする
        const [path, query] = cleanEndpoint.split('?');
        // パス部分の末尾にスラッシュを強制し、クエリを結合
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        return `${rootUrl}/api/${sanitizedPath}?${query}`;
    }

    // クエリがない場合: 純粋に末尾スラッシュを付けてディレクトリとして扱う
    return `${rootUrl}/api/${cleanEndpoint}/`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 * 🚀 修正: manualHost からポート番号を切り落とし、正しい SiteConfig を解決。
 */
export const getDjangoHeaders = (manualHost?: string) => {
    // --- 🎯 PORT SNIPER: "tiper-host:8083" -> "tiper-host" ---
    const cleanHost = manualHost ? manualHost.split(':')[0] : undefined;

    // 浄化されたホスト名でサイト設定を検索
    const siteConfig = getSiteMetadata(cleanHost);
    
    // Djangoが識別に使用する内部ホスト名 (例: api-tiper-host)
    const targetHost = siteConfig?.django_host || "api-bicstation-host"; 
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        // SSR時は、この Host ヘッダーが Django Middleware の鍵になる
        headers['Host'] = targetHost;
        headers['x-django-host'] = targetHost;
        
        // ログで最終的な身分証を確認
        console.log(`📡 [API-DEBUG] SSR Identity Resolved: ${cleanHost} -> Header: ${targetHost}`);
    }

    return headers;
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
        
        // 1. DRF 標準形式 (Pagination 込)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // 2. 配列直返し形式
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // 3. 単体オブジェクト形式
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