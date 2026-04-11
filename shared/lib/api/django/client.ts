/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.8 - Multi-Environment Final)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【クエリ正規化】siteパラメータの重複を完全に排除。
 * 2. 【Django互換パス】パス末尾のスラッシュ強制とクエリ結合の順序を厳格化。
 * 3. 【SSR身分証明】Hostヘッダーの擬態ロジックを維持しつつ、安定性を向上。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. ポート番号を除去したクリーンなホスト名で設定を取得
    const cleanManualHost = manualHost ? manualHost.split(':')[0] : undefined;
    const config = getWpConfig(cleanManualHost);
    const rootUrl = config.baseUrl; // config.ts側で末尾スラッシュ・クエリは除去済み
    const siteTag = config.siteKey;

    // 2. エンドポイントの前後スラッシュを正規化
    let cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');

    /**
     * 🎯 結合ロジック (Slash vs Query Security)
     * Djangoは「末尾スラッシュ」をパスの終端に求めるため、
     * パスを確定させてからクエリを付与する。
     */
    let finalUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/api/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/api/${cleanEndpoint}/`;
    }

    /**
     * 🛰️ サイト識別パラメータの注入
     * 既に endpoint に site= が含まれていない場合のみ付与し、二重付与を防止。
     */
    if (!finalUrl.includes('site=')) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + `site=${siteTag}`;
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const cleanHost = manualHost ? manualHost.split(':')[0] : undefined;
    const siteConfig = getSiteMetadata(cleanHost);
    
    const siteTag = siteConfig?.site_tag || "bicstation";
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        /**
         * 🛰️ SSR身分証明プロトコル
         * 内部ネットワーク通信(django-api-host)でも、Django側が
         * どのドメインへのリクエストか判別できるようにHostヘッダーをセット。
         */
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // ALLOWED_HOSTS 通過のための擬態
        const djangoHost = siteConfig?.django_host || `${siteTag}.com`;
        headers['Host'] = djangoHost;
        
        console.log(`📡 [API-DEBUG] SSR Identity Resolved: ${siteTag} (via ${cleanHost || 'default'})`);
    }

    return headers;
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        // Django側のエラー(404等)をキャッチ
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        
        // もしHTMLが返ってきた場合でも、JSONとして解析して落ちるのを防ぐ
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const data = await res.json();
        
        // 1. DRF 標準形式
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
        // ここで「Unexpected token <」エラーをキャッチし、
        // プロセスが死ぬのを防ぎつつ空のデータを返す
        console.error(`🚨 [JSON Parse Error] HTML content received instead of JSON. URL: ${url}`);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}