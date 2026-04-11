/**
 * =====================================================================
 * 🛠️ Django API 共通クライアント (Zenith v10.0 - Global Resolver)
 * =====================================================================
 * 🛡️ 強化ポイント:
 * 1. 【ホスト名正規化】api.ドメイン や api-xxx-host を正しくサイト名に変換。
 * 2. 【ポート自動解決】VPS(8000)とローカル(8083)を環境に応じて自動スイッチ。
 * 3. 【二重API防止】URL内の 'api/api/' を防ぎ、末尾スラッシュを保証。
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    const host = manualHost || (typeof window !== 'undefined' ? window.location.host : '');

    // 🚀 1. ホスト名の正規化ロジック
    // VPS: api.bicstation.com -> bicstation.com
    // Local: api-bicstation-host -> bicstation.com (判定用)
    let normalizedHost = host.replace(/^api\./, '').split(':')[0];

    if (host.includes('api-bicstation-host')) normalizedHost = 'bicstation.com';
    if (host.includes('api-saving-host')) normalizedHost = 'bic-saving.com';
    if (host.includes('api-tiper-host')) normalizedHost = 'tiper.live';
    if (host.includes('api-avflash-host')) normalizedHost = 'avflah.xyz';

    // 🚀 2. サイトメタデータの取得と siteTag の確定
    const siteConfig = getSiteMetadata(normalizedHost);
    const siteTag = siteConfig?.site_name || 'bicstation';

    // 🚀 3. ベースURL (Root) の決定
    const isVpsEnvironment = 
        host.includes('bicstation.com') || 
        host.includes('tiper.live') || 
        host.includes('avflah.xyz') || 
        host.includes('bic-saving.com') ||
        host.includes('django-api-host');

    let apiBase = '';
    if (IS_SERVER) {
        if (isVpsEnvironment) {
            // VPS内部通信: Dockerネットワーク内のコンテナ名を使用
            apiBase = 'http://django-api-host:8000';
        } else {
            // ローカル開発環境: 渡されたホスト名そのままの 8083 ポートへ
            const localHost = host.split(':')[0] || 'localhost';
            apiBase = `http://${localHost}:8083`;
        }
    } else {
        // クライアントサイド (ブラウザ) 通信
        apiBase = ''; 
    }

    const rootUrl = `${apiBase.replace(/\/+$/, '')}/api`;

    // 🚀 4. パスの重複・スラッシュ揺れの排除
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               // 先頭スラッシュ削除
        .replace(/^api\//, '')            // 二重付与防止
        .replace(/\/+$/, '');             // 末尾スラッシュを一旦削除

    let finalUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        const sanitizedPath = path.replace(/\/+$/, '') + '/';
        finalUrl = `${rootUrl}/${sanitizedPath}?${query}`;
    } else {
        finalUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    // 🚀 5. siteパラメータの付与 (site=api 等の誤認を上書き)
    if (!finalUrl.includes('site=')) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + `site=${siteTag}`;
    } else if (finalUrl.includes('site=api')) {
        // もしホスト名から api を拾ってしまっていたら、正しい siteTag で置換
        finalUrl = finalUrl.replace('site=api', `site=${siteTag}`);
    }

    return finalUrl;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const host = manualHost || '';
    
    // ホスト名正規化 (api. を除去)
    let normalizedHost = host.replace(/^api\./, '').split(':')[0];
    if (host.includes('api-bicstation-host')) normalizedHost = 'bicstation.com';
    if (host.includes('api-saving-host')) normalizedHost = 'bic-saving.com';
    if (host.includes('api-tiper-host')) normalizedHost = 'tiper.live';
    if (host.includes('api-avflash-host')) normalizedHost = 'avflah.xyz';

    const siteConfig = getSiteMetadata(normalizedHost);
    const siteTag = siteConfig?.site_name || "bicstation";
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // 🚀 重要: ALLOWED_HOSTS を突破するためのドメイン擬態
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
            console.error(`📝 [Error Body Snippet]: ${errorBody.substring(0, 200)}...`);
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
                _error: 'HTML_RECEIVED', 
                _html_preview: text.substring(0, 100) 
            };
        }

        const data = JSON.parse(text);
        
        // 🚀 データ形式の正規化 (一貫性のある results/count 構造へ)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0,
                _debug: { source: 'standard_paginated' }
            };
        }
        
        if (Array.isArray(data)) {
            return { results: data, count: data.length, _debug: { source: 'array' } };
        }
        
        if (data && typeof data === 'object') {
            const payload = data.data || data;
            return { 
                results: Array.isArray(payload) ? payload : [payload], 
                count: Array.isArray(payload) ? payload.length : 1,
                _debug: { source: 'object_wrapped' }
            };
        }

        return { results: [], count: 0 };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`, e);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}