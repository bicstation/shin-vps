/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.2 - Multi-Tenant Final Fix)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【物理パス解決】resolveApiUrl に manualHost を貫通させ、正しいポート(8083)へ誘導。
 * 2. 【名前解決の保護】正規表現を修正し、ホスト名に含まれる 'api-' を誤って削らないように改善。
 * 3. 【SSR身分証】getDjangoHeaders で Host ヘッダーを動的に生成し、Djangoの洗浄エンジンを起動。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 * 🚀 manualHost を受け取り、各ドメイン専用の 8083 ポート等のパスを解決します。
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 🎯 manualHost を渡して、siteConfig 側で定義された api_base_url (8083系) を取得
    const config = getWpConfig(manualHost);
    const baseUrl = config.baseUrl;
    
    /**
     * 1. エンドポイントの正規化
     * ⚠️ [重要修正]: 以前の /^api\// を削除しました。
     * これにより 'api-bicstation-host' のような文字列の先頭を削る事故を防ぎます。
     */
    const cleanEndpoint = endpoint
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    // 2. "/api" の二重付与を防止
    const rootUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // 3. 結合: Django の APPEND_SLASH=True に対応
    // ここで生成される URL は http://api-bicstation-host:8083/api/posts/ のようになります。
    return `${rootUrl}/api/${cleanEndpoint}/`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 * 🛡️ manualHost からそのサイト本来のドメイン名を解決し、Hostヘッダーにセットします。
 */
export const getDjangoHeaders = (manualHost?: string) => {
    // 判定ライブラリを用いて、リクエスト毎の正しいメタデータを取得
    const siteConfig = getSiteMetadata(manualHost);
    const targetHost = siteConfig.django_host; 
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    /**
     * 🚀 Server Side (SSR) 通信時の Host 書き換え
     * これが Django 側の Middleware 判定（137件モード）を起動させるスイッチです。
     */
    if (IS_SERVER) {
        headers['Host'] = targetHost;
        headers['x-django-host'] = targetHost; // 予備の識別ヘッダー
        
        // ログで「どの面構えでリクエストしているか」を追跡可能にする
        console.log(`📡 [API-DEBUG] SSR Request Identity: ${targetHost}`);
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