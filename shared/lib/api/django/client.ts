/**
 * =====================================================================
 * 🛰️ Django API 共通クライアント (Zenith v10.9 - Docker Network Native)
 * =====================================================================
 * 🛡️ 運用ロジック:
 * 1. 【最優先】Dockerネットワーク内のサービス名 `django-v3:8000` を使用。
 * 2. 【ホスト判定】ホスト名からサイトタグ（bicstation等）を自動抽出。
 * 3. 【正規化】エンドポイントのスラッシュ重複やパラメータ付与を自動処理。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 優先順位: 1. 手動引数 2. windowオブジェクト (ブラウザ) 3. フォールバック
    const host = manualHost || (typeof window !== 'undefined' ? window.location.host : '');

    // 🚀 1. ローカル・VPS固有ホストの判定フラグ
    const isLocalSpecificHost = 
        host.includes('api-bicstation-host') || 
        host.includes('api-saving-host') || 
        host.includes('api-tiper-host') || 
        host.includes('api-avflash-host') ||
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.includes('bicstation-host');

    // 🚀 2. ホスト名の正規化 (site判定用)
    let normalizedHost = host.replace(/^api\./, '').split(':')[0];
    if (host.includes('api-bicstation-host')) normalizedHost = 'bicstation.com';
    if (host.includes('api-saving-host')) normalizedHost = 'bic-saving.com';
    if (host.includes('api-tiper-host')) normalizedHost = 'tiper.live';
    if (host.includes('api-avflash-host')) normalizedHost = 'avflah.xyz';

    // 🚀 3. サイトメタデータの取得と siteTag の生成
    const siteConfig = getSiteMetadata(normalizedHost);
    const siteTag = siteConfig?.site_name 
        ? siteConfig.site_name.toLowerCase().replace(/\s+/g, '') 
        : 'bicstation';

    // 🚀 4. 通信先(apiBase)の決定
    let apiBase = '';
    if (IS_SERVER) {
        /**
         * 💡 重要: VPS上のDockerネットワーク内では、localhost(8083) 経由ではなく
         * サービス名 `django-v3` の 8000番ポートを直接叩くのが正解です。
         */
        if (
            process.env.NODE_ENV === 'production' || 
            host.includes('bicstation') || 
            host.includes('tiper') || 
            host.includes('avflah') || 
            host.includes('saving')
        ) {
            // Docker Composeのサービス名(django-v3)を指定
            apiBase = 'http://django-v3:8000';
        } else {
            // 完全なローカル環境用
            apiBase = 'http://127.0.0.1:8083';
        }
    } else {
        // クライアントサイド（ブラウザ）からは相対パス
        apiBase = ''; 
    }

    const rootUrl = `${apiBase.replace(/\/+$/, '')}/api`;

    // 🚀 5. エンドポイントの整形 (二重スラッシュ・二重API防止)
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               
        .replace(/^api\//, '')            
        .replace(/\/+$/, '');             

    let finalUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    // 🚀 6. siteパラメータの付与
    if (!finalUrl.includes('site=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}site=${siteTag}`;
    } else if (finalUrl.includes('site=api')) {
        finalUrl = finalUrl.replace('site=api', `site=${siteTag}`);
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const host = manualHost || '';
    let normalizedHost = host.replace(/^api\./, '').split(':')[0];
    
    if (host.includes('api-bicstation-host')) normalizedHost = 'bicstation.com';
    if (host.includes('api-saving-host')) normalizedHost = 'bic-saving.com';
    if (host.includes('api-tiper-host')) normalizedHost = 'tiper.live';
    if (host.includes('api-avflash-host')) normalizedHost = 'avflah.xyz';

    const siteConfig = getSiteMetadata(normalizedHost);
    const siteTag = siteConfig?.site_name 
        ? siteConfig.site_name.toLowerCase().replace(/\s+/g, '') 
        : "bicstation";
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        const djangoHost = siteConfig?.django_host || `${siteTag}.com`;
        headers['Host'] = djangoHost;
        
        console.log(`📡 [API-IDENTITY] Site: ${siteTag} | Fake-Host: ${djangoHost} | Target: ${host || 'default'}`);
    }

    return headers;
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (IS_SERVER) {
        const statusIcon = res.ok ? '✅' : '❌';
        console.log(`${statusIcon} [API-FETCH] STATUS: ${res.status} | URL: ${url}`);
    }

    if (!res.ok) {
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) {
            if (IS_SERVER) console.error(`🚨 [Critical: HTML Returned] URL: ${url}`);
            return { results: [], count: 0, _error: 'HTML_RECEIVED' };
        }

        const data = JSON.parse(text);
        
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        if (data && typeof data === 'object') {
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1 
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`, e);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}