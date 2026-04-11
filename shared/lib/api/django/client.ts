/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.9 - Path Security Final)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【パス二重付与防止】endpoint 内の 'api/' 重複を確実に検知してストリップ。
 * 2. 【Django互換パス】スラッシュ正規化を強化し、末尾スラッシュを保証。
 * 3. 【セーフハンドラ】Unexpected token '<' (HTML 404) を安全に受け流す。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. 設定の取得
    const cleanManualHost = manualHost ? manualHost.split(':')[0] : undefined;
    const config = getWpConfig(cleanManualHost);
    
    // config.baseUrl は 'http://django-api-host:8000/api' か '...:8083/api'
    // 末尾のスラッシュを一旦除去してベースを確定
    const rootUrl = config.baseUrl.replace(/\/+$/, ''); 
    const siteTag = config.siteKey;

    /**
     * 🎯 パスの正規化
     * 呼び出し側が 'api/general/...' と送ってきても 'general/...' と送ってきても
     * 二重にならないように 'api/' を先頭から除去する。
     */
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               // 先頭のスラッシュ削除
        .replace(/^api\//, '')            // 先頭の 'api/' 削除 (二重付与防止)
        .replace(/\/+$/, '');             // 末尾のスラッシュを一旦削除

    let finalUrl = "";

    if (cleanEndpoint.includes('?')) {
        // クエリパラメータがある場合
        const [path, query] = cleanEndpoint.split('?');
        // パス部分の末尾にスラッシュを強制（Django用）
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/${sanitizedPath}?${query}`;
    } else {
        // パスのみの場合
        finalUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    /**
     * 🛰️ サイト識別パラメータの注入
     * 既に endpoint に site= が含まれていない場合のみ付与。
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
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const text = await res.text(); // 一旦テキストで受ける
        
        // 空レスポンス対策
        if (!text) return { results: [], count: 0 };

        // HTMLが返ってきていないかチェック (SyntaxError 防止)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<h1')) {
            console.error(`🚨 [JSON Parse Error] HTML content received instead of JSON. URL: ${url}`);
            return { results: [], count: 0, _error: 'HTML_RECEIVED' };
        }

        const data = JSON.parse(text);
        
        // 1. DRF 標準形式 (results/count)
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
        
        // 3. 単体オブジェクト形式 (詳細ページ等)
        if (data && typeof data === 'object') {
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1 
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        console.error(`🚨 [Unexpected Error] URL: ${url}`, e);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}