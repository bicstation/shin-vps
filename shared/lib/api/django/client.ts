/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v8.7 - Multi-Environment Final)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【ポート・スラッシュの完全洗浄】SSR時のURL組み立てを100%安全に。
 * 2. 【Hostヘッダーの動的最適化】内部通信用の Host ヘッダーを Django 側に適合。
 * 3. 【クエリ整合性】site=xxx パラメータが二重スラッシュにならないよう厳格管理。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 * 🚀 修正: Djangoが求める「末尾スラッシュ」と「クエリ」の共存を保証。
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. ポート番号を除去したクリーンなホスト名で設定を取得
    const cleanManualHost = manualHost ? manualHost.split(':')[0] : undefined;
    const config = getWpConfig(cleanManualHost);
    const baseUrl = config.baseUrl; // config.ts側で既に ?site= が付いている可能性を考慮
    
    // 2. エンドポイントの前後スラッシュを正規化
    let cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');

    // 3. APIルートの抽出 (末尾スラッシュなしの状態にする)
    const rootUrl = baseUrl.split('?')[0].replace(/\/api\/?$/, '').replace(/\/$/, '');
    const existingQuery = baseUrl.includes('?') ? baseUrl.split('?')[1] : '';

    /**
     * 🎯 結合ロジック (Slash vs Query Security)
     * Djangoの各エンドポイントは末尾スラッシュを必須とするため、
     * パス部分の末尾に確実に / を入れ、その後にクエリを結合する。
     */
    let finalUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/api/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/api/${cleanEndpoint}/`;
    }

    // config.ts 側で付与された site=xxx 等のクエリを維持して結合
    if (existingQuery) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + existingQuery;
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 * 🚀 修正: manualHost からポートを除去し、Django Middleware が最も喜ぶヘッダーを生成。
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const cleanHost = manualHost ? manualHost.split(':')[0] : undefined;
    const siteConfig = getSiteMetadata(cleanHost);
    
    // 判定されたサイトタグ (saving, tiper, avflash 等)
    const siteTag = siteConfig?.site_tag || "bicstation";
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        /**
         * 🛰️ SSR身分証明プロトコル
         * Django側の ArticleViewSet.get_queryset が識別できるように
         * 複数のヘッダーを網羅的にセットします。
         */
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // 🚨 重要: 内部通信 (django-api-host) 時、Hostヘッダーを本来のドメインに
        // 偽装（擬態）させることで、Django側の ALLOWED_HOSTS を通過させます。
        headers['Host'] = siteConfig?.django_host || `${siteTag}.com`;
        
        // ログで最終的な身分証を確認 (VPSのコンソールで非常に役立ちます)
        console.log(`📡 [API-DEBUG] SSR Identity Resolved: ${siteTag} (via ${cleanHost || 'default'})`);
    }

    return headers;
};

/**
 * 💡 フェッチレスポンス・セーフハンドラ
 */
export async function handleResponseWithDebug(res: Response, url: string) {
    if (!res.ok) {
        // 404や500エラー時の詳細ログ
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