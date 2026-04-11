/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v9.5 - Ultimate Debugger)
 * =====================================================================
 * 🛡️ 強化ポイント:
 * 1. 【URL全出力】構築された最終URLを fetch 直前にコンソールへ強制出力。
 * 2. 【ヘッダー可視化】Djangoに送っている擬態Hostヘッダー等をログに表示。
 * 3. 【ブラウザ連携】SSR時のエラー情報をフロントエンドへ安全にリレー。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    const cleanManualHost = manualHost ? manualHost.split(':')[0] : undefined;
    const config = getWpConfig(cleanManualHost);
    
    // config.baseUrl = 'http://django-api-host:8000/api' など
    const rootUrl = config.baseUrl.replace(/\/+$/, ''); 
    const siteTag = config.siteKey;

    // パスの重複・スラッシュ揺れを徹底排除
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               // 先頭スラッシュ削除
        .replace(/^api\//, '')            // 先頭の 'api/' 削除 (二重付与防止)
        .replace(/\/+$/, '');             // 末尾スラッシュを一旦削除

    let finalUrl = "";

    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    // siteパラメータの付与
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
        // Django側の認可・識別用
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // 🚀 重要: ALLOWED_HOSTS を突破するためのドメイン擬態
        const djangoHost = siteConfig?.django_host || `${siteTag}.com`;
        headers['Host'] = djangoHost;
        
        // デバッグ用: どのような身分でリクエストを投げるか記録
        console.log(`📡 [API-IDENTITY] Site: ${siteTag} | Fake-Host: ${djangoHost} | Target-Host: ${cleanHost || 'default'}`);
    }

    return headers;
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    // 🔍 【全リクエスト監視】
    if (IS_SERVER) {
        const statusIcon = res.ok ? '✅' : '❌';
        console.log(`${statusIcon} [API-FETCH] STATUS: ${res.status} | URL: ${url}`);
    }

    if (!res.ok) {
        console.error(`🚨 [Django API Error] ${res.status} ${res.statusText} | URL: ${url}`);
        // 404の場合、Djangoが返したHTMLの一部をログに出して「理由」を探る
        try {
            const errorBody = await res.text();
            console.error(`📝 [Error Body Snippet]: ${errorBody.substring(0, 200)}...`);
        } catch {
            console.error('📝 [Error Body]: (Could not read body)');
        }
        return { results: [], count: 0, _error: res.status, _url: url };
    }

    try {
        const text = await res.text();
        
        if (!text) return { results: [], count: 0 };

        // 🚨 HTML検知ロジックの強化
        if (text.trim().startsWith('<')) {
            console.error(`🚨 [Critical: HTML Returned] API expected JSON but got HTML.`);
            console.error(`🔗 URL: ${url}`);
            console.error(`📄 HTML Preview: ${text.substring(0, 150)}...`);
            
            return { 
                results: [], 
                count: 0, 
                _error: 'HTML_RECEIVED', 
                _html_preview: text.substring(0, 100) 
            };
        }

        const data = JSON.parse(text);
        
        // データ形式の正規化
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