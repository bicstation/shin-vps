/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v3 - Unified)
 * =====================================================================
 * [Path]: /shared/lib/api/django-bridge.ts
 */

import { getWpConfig, IS_SERVER } from './config';
// index.ts や api.ts との循環参照を防ぐため、型定義はここか types.ts で管理
import { PCProduct, MakerCount } from './index'; 

/**
 * 🔄 【核心】ドメイン・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    
    const isObject = typeof data === 'object';
    let content = isObject ? JSON.stringify(data) : data;

    const { baseUrl } = getWpConfig();
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    // 内部・開発ドメインを公開ドメインへ一本化
    const internalPattern = /http:\/\/(django-v3|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    content = content.replace(internalPattern, cleanBaseUrl);
    content = content.replace(/([^:])\/\//g, '$1/'); // スラッシュ重複修正

    return isObject ? JSON.parse(content) : content;
};

/**
 * 💡 内部URL解決 (ネットワーク最適化)
 */
const resolveApiUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (IS_SERVER) {
        // SSR/ビルド時は Docker内部 (django-v3) を直接叩き、外部解決をバイパス
        const internalApiBase = process.env.API_INTERNAL_URL || 'http://django-v3:8000/api';
        return `${internalApiBase}${cleanEndpoint}`;
    }
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * 🛠️ 共通 Fetch ラッパー (Hostヘッダー & エラーハンドリング)
 */
async function fetchFromBridge(url: string, options: any = {}) {
    const { host } = getWpConfig();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Host': host,
                'Accept': 'application/json',
                ...(options.headers || {}),
            },
            signal: AbortSignal.timeout(options.timeout || 8000)
        });
        if (!res.ok) return { data: null, total: 0, status: res.status };
        
        const data = await res.json();
        const total = parseInt(res.headers.get('X-WP-Total') || res.headers.get('X-Total-Count') || '0', 10);
        
        return { data: replaceInternalUrls(data), total, status: res.status };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fetch Failed]: ${url} | ${e.message}`);
        return { data: null, total: 0, error: e.message };
    }
}

// --- 📝 WordPress 互換機能 (旧記事・カスタム投稿用) ---

export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0) {
    const type = postType === 'post' ? 'posts' : postType;
    const url = resolveApiUrl(`/wp-json/wp/v2/${type}?_embed&per_page=${limit}&offset=${offset}`);
    const { data, total } = await fetchFromBridge(url, { next: { revalidate: 60 } });
    return { results: data || [], count: total };
}

export async function fetchPostData(postType: string = 'post', identifier: string) {
    const type = postType === 'post' ? 'posts' : postType;
    const isId = /^\d+$/.test(identifier);
    const query = isId ? `/${identifier}?_embed` : `?slug=${encodeURIComponent(identifier)}&_embed`;
    const { data } = await fetchFromBridge(resolveApiUrl(`/wp-json/wp/v2/${type}${query}`));
    return Array.isArray(data) ? (data[0] || null) : data;
}

// --- 🔞 アダルトコンテンツ機能 (AVFLASH, TIPER) ---

/**
 * 統合プロダクト取得 (Adult用)
 */
export async function getAdultProducts(params: any = {}) {
    const query = new URLSearchParams({
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString(),
        ordering: params.ordering || '-id',
        ...(params.site_group && { site_group: params.site_group })
    });
    const url = resolveApiUrl(`/adult-products/?${query.toString()}`);
    const { data, total } = await fetchFromBridge(url, { next: { revalidate: 60 } });
    return { results: data?.results || [], count: data?.count || total };
}

// --- 💻 PC製品・ランキング機能 (BicStation) ---

export async function fetchPCProducts(params: any = {}) {
    const query = new URLSearchParams({
        limit: (params.limit || 10).toString(),
        offset: (params.offset || 0).toString(),
        ...(params.maker && { maker: params.maker }),
        ...(params.site_group && { site_group: params.site_group })
    });
    const { data } = await fetchFromBridge(resolveApiUrl(`/pc-products/?${query.toString()}`));
    return { results: data?.results || [], count: data?.count || 0 };
}

/**
 * 既存関数とのエイリアス互換
 */
export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };