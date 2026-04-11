/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v10.2 - Network Infrastructure Fix)
 * =====================================================================
 * 🛡️ 強化ポイント:
 * 1. 【ホスト名正規化】api.ドメイン や api-xxx-host から純粋な識別子を抽出。
 * 2. 【環境判定の厳格化】NODE_ENV とホスト名の両面から、VPS内部通信か否かを判定。
 * 3. 【サイト名クレンジング】スペースを含む site_name を安全な siteTag (小文字/連結) へ変換。
 * 4. 【DNSエラー対策】不完全なホスト名による getaddrinfo エラーをガード。
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

    // 🚀 1. ホスト名の正規化
    let normalizedHost = host.replace(/^api\./, '').split(':')[0];

    // ローカル環境専用のホスト名マッピング (bicstation 等の名前解決エラーを防ぐ)
    if (host.includes('api-bicstation-host')) normalizedHost = 'bicstation.com';
    if (host.includes('api-saving-host')) normalizedHost = 'bic-saving.com';
    if (host.includes('api-tiper-host')) normalizedHost = 'tiper.live';
    if (host.includes('api-avflash-host')) normalizedHost = 'avflah.xyz';

    // 🚀 2. サイトメタデータの取得と siteTag のクレンジング
    const siteConfig = getSiteMetadata(normalizedHost);
    
    // 🚨 修正: 'Bic Station' -> 'bicstation' のように、スペースを除去して小文字化
    // これにより Django 側のフィルタリング不一致を防ぎます。
    const siteTag = siteConfig?.site_name 
        ? siteConfig.site_name.toLowerCase().replace(/\s+/g, '') 
        : 'bicstation';

    // 🚀 3. ベースURL (Root) の決定ロジック
    // VPS環境であるかどうかの厳密なチェック
    const isVpsEnvironment = 
        process.env.NODE_ENV === 'production' || 
        host.includes('bicstation.com') || 
        host.includes('tiper.live') || 
        host.includes('avflah.xyz') || 
        host.includes('bic-saving.com') ||
        host.includes('django-api-host');

    let apiBase = '';
    if (IS_SERVER) {
        if (isVpsEnvironment) {
            // VPS内部通信: コンテナ名を解決
            apiBase = 'http://django-api-host:8000';
        } else {
            // ローカル開発環境: 
            // host が不完全 (1000000 等) な場合は localhost に逃がして EAI_AGAIN を防ぐ
            const localHost = (host && !host.includes('1000000') && host !== 'default') 
                ? host.split(':')[0] 
                : 'localhost';
            apiBase = `http://${localHost}:8083`;
        }
    } else {
        // クライアントサイドは相対パス
        apiBase = ''; 
    }

    const rootUrl = `${apiBase.replace(/\/+$/, '')}/api`;

    // 🚀 4. エンドポイントの整形 (二重スラッシュ・二重API防止)
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               // 先頭スラッシュ削除
        .replace(/^api\//, '')            // 先頭の 'api/' 削除
        .replace(/\/+$/, '');             // 末尾スラッシュを一旦削除

    let finalUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    // 🚀 5. siteパラメータの付与
    if (!finalUrl.includes('site=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}site=${siteTag}`;
    } else if (finalUrl.includes('site=api')) {
        // 誤認された site=api を正しい siteTag に差し替え
        finalUrl = finalUrl.replace('site=api', `site=${siteTag}`);
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const host = manualHost || '';
    
    // ホスト名正規化 (resolveApiUrl とロジックを統一)
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
        
        // ALLOWED_HOSTS 突破用のドメイン擬態
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
        try {
            const errorBody = await res.text();
            console.error(`📝 [Error Body Snippet]: ${errorBody.substring(0, 150)}...`);
        } catch {
            console.error('📝 [Error Body]: (Could not read body)');
        }
        return { results: [], count: 0, _error: res.status, _url: url };
    }

    try {
        const text = await res.text();
        if (!text) return { results: [], count: 0 };

        // 🚨 HTML検知ロジック
        if (text.trim().startsWith('<')) {
            console.error(`🚨 [Critical: HTML Returned] Expected JSON but got HTML. URL: ${url}`);
            return { 
                results: [], 
                count: 0, 
                _error: 'HTML_RECEIVED'
            };
        }

        const data = JSON.parse(text);
        
        // 🚀 データ形式の正規化
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