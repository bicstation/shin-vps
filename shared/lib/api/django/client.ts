// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ Django API 共通クライアント (Zenith v11.1 - Network Logic Optimized)
 * =====================================================================
 * 🛡️ 修正ロジック:
 * 1. 【ローカル強制】localhost/127.0.0.1 検出時は 127.0.0.1:8083 を強制。
 * 2. 【環境変数優先】NEXT_PUBLIC_API_URL が設定されていれば最優先で解決。
 * 3. 【パラメータ自動付与】site_name / site_group を URLSearchParams で確実に構築。
 * =====================================================================
 */

import { IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決 (Network Path Resolver)
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    // 1. メタデータの取得
    const host = manualHost || (typeof window !== 'undefined' ? window.location.host : '');
    const meta = getSiteMetadata(host);
    const siteTag = meta.site_tag || 'bicstation';

    // 2. 通信先 (apiBase) の決定
    let apiBase = '';

    if (IS_SERVER) {
        /**
         * 🛡️ サーバーサイド (SSR) 導線
         * ローカル環境変数をチェックし、次にホスト名による直接判定を行う
         */
        const envApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL;

        if (envApiUrl && (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1'))) {
            // 環境変数で明示的にローカルが指定されている場合
            apiBase = envApiUrl.replace(/\/api\/?$/, '');
        } else if (meta.is_local_env || host.includes('localhost') || host.includes('127.0.0.1') || host.includes('8083')) {
            // ホスト名から物理的にローカルと判断される場合
            apiBase = 'http://127.0.0.1:8083';
        } else {
            // VPS上のコンテナ間通信 (デフォルト)
            apiBase = 'http://django-v3:8000';
        }
    } else {
        // クライアントサイド（ブラウザ）
        apiBase = `https://${meta.django_host}`; 
    }

    const rootUrl = `${apiBase.replace(/\/+$/, '')}/api`;

    // 3. エンドポイントの整形 (正規化)
    let cleanEndpoint = endpoint
        .replace(/^\/+/, '')               
        .replace(/^api\//, '')            
        .replace(/\/+$/, '');             

    let baseUrl = "";
    if (cleanEndpoint.includes('?')) {
        const [path, query] = cleanEndpoint.split('?');
        baseUrl = `${rootUrl}/${path.replace(/\/+$/, '')}/?${query}`;
    } else {
        baseUrl = `${rootUrl}/${cleanEndpoint}/`;
    }

    // 4. パラメータの統合管理 (URLSearchParams を使用して重複・漏れを防止)
    const [purePath, queryString] = baseUrl.split('?');
    const params = new URLSearchParams(queryString || '');

    // 必須パラメータのインジェクト
    if (!params.has('site')) params.set('site', siteTag);
    if (!params.has('site_name')) params.set('site_name', siteTag);
    if (!params.has('site_group')) params.set('site_group', meta.site_group || 'general');

    // site=api.xxx のような不正な形式のクリーンアップ
    if (params.get('site')?.startsWith('api.')) {
        params.set('site', siteTag);
    }

    return `${purePath}?${params.toString()}`;
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
        // 識別用カスタムヘッダー
        headers['x-django-host'] = siteTag;
        headers['x-project-id'] = siteTag;
        
        // 物理 Host ヘッダー (VPS/Nginx環境でのルーティング用)
        headers['Host'] = meta.django_host;
        
        // ローカル開発時に VPS へ飛ぶのを防ぐためのデバッグ出力を強化
        const isLocal = meta.is_local_env || host.includes('localhost');
        console.log(`📡 [API-IDENTITY] Site: ${siteTag} | Mode: ${isLocal ? 'LOCAL' : 'VPS'} | Host-Header: ${meta.django_host} | SSR: true`);
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
        
        // 1. DRF 標準形式 (results あり)
        if (data && typeof data === 'object' && 'results' in data) {
            return {
                results: Array.isArray(data.results) ? data.results : [],
                count: typeof data.count === 'number' ? data.count : 0
            };
        }
        
        // 2. 配列直渡し形式
        if (Array.isArray(data)) {
            return { results: data, count: data.length };
        }
        
        // 3. 単体オブジェクト形式
        const payload = data.data || data;
        return { 
            results: Array.isArray(payload) ? payload : [payload], 
            count: Array.isArray(payload) ? payload.length : 1 
        };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`, e);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}