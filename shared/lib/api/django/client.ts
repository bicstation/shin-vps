// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ Django API 共通クライアント (Zenith v11.0 - Docker Network Native)
 * =====================================================================
 * 🛡️ 運用ロジック:
 * 1. 【識別子同期】siteConfig (v22.0) の site_tag を最優先で使用。
 * 2. 【Docker最適化】サーバーサイド通信は `django-v3:8000` を強制。
 * 3. 【パラメータ正規化】siteパラメータの二重付与やスラッシュ重複を徹底排除。
 * =====================================================================
 */

import { IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. メタデータの取得 (siteConfig v22.0 のロジックに完全委任)
    const host = manualHost || (typeof window !== 'undefined' ? window.location.host : '');
    const meta = getSiteMetadata(host);
    
    // 🎯 指揮系統の一本化: 独自加工せず site_tag をそのまま使う
    const siteTag = meta.site_tag || 'bicstation';

    // 2. 通信先 (apiBase) の決定
    let apiBase = '';
    if (IS_SERVER) {
        /**
         * 🛡️ サーバーサイド (SSR) 導線
         * ローカル環境以外（VPS上）では Docker サービス名 django-v3 を使用
         */
        if (meta.is_local_env && !host.includes('bicstation')) {
            apiBase = 'http://127.0.0.1:8083';
        } else {
            // VPS上のコンテナ間通信。ポートは 8000 に固定
            apiBase = 'http://django-v3:8000';
        }
    } else {
        // クライアントサイド（ブラウザ）からは、各サイトの API ドメインへ
        apiBase = `https://${meta.django_host}`; 
    }

    const rootUrl = `${apiBase.replace(/\/+$/, '')}/api`;

    // 3. エンドポイントの整形
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

    // 4. siteパラメータの付与 (site_tag を確実に使用)
    if (!finalUrl.includes('site=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}site=${siteTag}`;
    } else if (finalUrl.includes('site=api')) {
        // 古い api-xxx-host 形式のパラメータが残っている場合は置換
        finalUrl = finalUrl.replace(/site=[^&]+/, `site=${siteTag}`);
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const host = manualHost || (typeof window !== 'undefined' ? window.location.host : '');
    const meta = getSiteMetadata(host);
    const siteTag = meta.site_tag;
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        // Django 側の識別ミドルウェアに正しいタグを伝える
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // 物理的な Host ヘッダー (Nginx 等での振り分け用)
        headers['Host'] = meta.django_host;
        
        console.log(`📡 [API-IDENTITY] Site: ${siteTag} | Host-Header: ${meta.django_host} | SSR: true`);
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
        console.error(`🚨 [Django API Error] ${res.status} | URL: ${url}`);
        return { results: [], count: 0, _error: res.status };
    }

    try {
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) {
            return { results: [], count: 0, _error: 'HTML_RECEIVED' };
        }

        const data = JSON.parse(text);
        
        // ページネーション形式 (resultsあり)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // 配列形式
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // 単体オブジェクト形式
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