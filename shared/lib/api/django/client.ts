// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ Django API 共通クライアント (Zenith v15.0 - Diamond Guard Edition)
 * =====================================================================
 * 🛡️ 修正の核心:
 * 1. 【階層型ガード】category.name 等の深いプロパティまで空文字を保証。
 * 2. 【200時クラッシュ完全封殺】データの中身が不完全でもフロントを絶対に壊さない。
 * 3. 【正規化パス】prefix 重複排除と site_tag のクリーン化を維持。
 * =====================================================================
 */

import { IS_SERVER } from '../config';
import { getSiteMetadata } from '../../utils/siteConfig';

/**
 * 💡 接続先URLを動的に解決
 */
export const resolveApiUrl = (endpoint: string, manualHost?: string) => {
    const identifier = manualHost || (typeof window !== 'undefined' ? window.location.hostname : '');
    const meta = getSiteMetadata(identifier);
    
    const apiRoot = meta.api_base_url.replace(/\/+$/, ''); 
    const prefix = meta.site_prefix.replace(/^\/+|\/+$/g, '').trim();

    const cleanEndpoint = endpoint
        .replace(/^api\//, '')
        .replace(new RegExp(`^${prefix}/`), '') 
        .replace(/^\/+|\/+$/g, ''); 

    const combinedPath = `${apiRoot}/${prefix}/${cleanEndpoint}/`.replace(/([^:]\/)\/+/g, "$1");

    const [baseUrlPart, existingQuery] = combinedPath.split('?');
    const params = new URLSearchParams(existingQuery || '');
    const safeTag = meta.site_tag.replace(/\/+$/, '').trim();

    params.set('site', safeTag);
    params.set('site_name', safeTag);
    params.set('site_group', meta.site_group || 'general');

    return `${baseUrlPart.replace(/\/+$/, '')}/?${params.toString()}`;
};

/**
 * 💡 Django リクエスト用ヘッダー生成
 */
export const getDjangoHeaders = (manualHost?: string) => {
    const identifier = manualHost || (typeof window !== 'undefined' ? window.location.hostname : '');
    const meta = getSiteMetadata(identifier);
    const siteTag = meta.site_tag.replace(/\/+$/, '').trim();
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (IS_SERVER) {
        headers['x-site-tag'] = siteTag;
        headers['x-project-id'] = siteTag;
        headers['x-site-prefix'] = meta.site_prefix;
        headers['x-django-host'] = meta.django_host;
        headers['Host'] = meta.django_host;
        
        console.log(`📡 [API-IDENTITY] Tag: ${siteTag} | Prefix: ${meta.site_prefix} | Host: ${meta.django_host}`);
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
        return { results: [], count: 0, _error: res.status, is_empty: true };
    }

    try {
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) {
            return { results: [], count: 0, _error: 'HTML_RECEIVED' };
        }

        const data = JSON.parse(text);
        
        let rawResults = [];
        if (data && typeof data === 'object' && 'results' in data) {
            rawResults = Array.isArray(data.results) ? data.results : [];
        } else if (Array.isArray(data)) {
            rawResults = data;
        } else {
            const payload = data.data || data;
            rawResults = Array.isArray(payload) ? payload : (payload ? [payload] : []);
        }

        /**
         * 🛡️ 【最重要】ダイヤモンド・サニタイズ
         * データの深い階層で null があっても、空の構造を「強制注入」します。
         */
        const safeResults = rawResults.map(item => {
            if (!item || typeof item !== 'object') return {};

            // カテゴリ・タグ・著者の深い階層まで空文字を埋める
            const safeCategory = {
                name: "",
                slug: "",
                ...(item.category && typeof item.category === 'object' ? item.category : {})
            };

            const safeAuthor = {
                name: "",
                ...(item.author && typeof item.author === 'object' ? item.author : {})
            };

            return {
                ...item,
                title: item.title || "",
                content: item.content || "",
                category: safeCategory,
                author: safeAuthor,
                tags: Array.isArray(item.tags) ? item.tags : [],
                site: item.site || "",
                created_at: item.created_at || new Date().toISOString()
            };
        });

        return {
            results: safeResults,
            count: data.count || safeResults.length
        };

    } catch (e) {
        console.error(`🚨 [JSON Parse Error] URL: ${url}`, e);
        return { results: [], count: 0, _error: 'PARSE_FAILED' };
    }
}