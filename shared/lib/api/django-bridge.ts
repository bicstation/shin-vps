/**
 * =====================================================================
 * 🌉 Django-Bridge サービス層 (Maya's Logic v3 - Unified)
 * =====================================================================
 * [Path]: /shared/lib/api/django-bridge.ts
 */

import { getWpConfig, IS_SERVER } from './config';
// 型定義の循環参照を防ぐため
import { PCProduct, MakerCount } from './index'; 

/**
 * 🔄 【核心】ドメイン・一括置換ユーティリティ
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    
    const isObject = typeof data === 'object';
    let content = isObject ? JSON.stringify(data) : data;

    const { baseUrl } = getWpConfig();
    // baseUrlが http://.../api の場合、ベース部分だけを抽出
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');

    // 内部・開発ドメインを公開ドメインへ一本化
    const internalPattern = /http:\/\/(django-v3|nginx-wp-v[23]|wordpress-.+v[23]|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    content = content.replace(internalPattern, cleanBaseUrl);
    // スラッシュの重複 (//) を修正（プロトコル直後を除く）
    content = content.replace(/([^:])\/\//g, '$1/'); 

    return isObject ? JSON.parse(content) : content;
};

/**
 * 💡 内部URL解決 (ネットワーク最適化 & /api 重複防止)
 */
const resolveApiUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    
    // endpointの先頭の /api を除去（ベース側と重複させないため）
    const cleanEndpoint = endpoint.replace(/^\/?api\//, '/').startsWith('/') 
        ? endpoint.replace(/^\/?api\//, '/') 
        : `/${endpoint}`;

    if (IS_SERVER) {
        // SSR時は Docker内部ネットワークを利用
        // 環境変数に末尾 /api があってもなくても対応
        const internalBase = (process.env.API_INTERNAL_URL || 'http://django-v3:8000/api').replace(/\/$/, '');
        return `${internalBase}${cleanEndpoint}`;
    }

    // クライアントサイド用
    const clientBase = baseUrl.replace(/\/$/, '');
    return `${clientBase}${cleanEndpoint}`;
};

/**
 * 🛠️ 共通 Fetch ラッパー
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
            // Next.js 15+ 向けのタイムアウト制御
            signal: AbortSignal.timeout(options.timeout || 8000)
        });

        if (!res.ok) {
            console.warn(`⚠️ [Bridge 404/Error]: ${res.status} | ${url}`);
            return { data: null, total: 0, status: res.status };
        }
        
        const data = await res.json();
        const total = parseInt(res.headers.get('X-WP-Total') || res.headers.get('X-Total-Count') || '0', 10);
        
        return { data: replaceInternalUrls(data), total, status: res.status };
    } catch (e: any) {
        console.error(`🚨 [Bridge Fetch Failed]: ${url} | ${e.message}`);
        return { data: null, total: 0, error: e.message };
    }
}

// --- 📝 統合コンテンツ取得 (page.tsx エラー対策用) ---

/**
 * page.tsx から (0 , j.fetchDjangoBridgeContent) として呼ばれるためのメイン関数
 */
export async function fetchDjangoBridgeContent(params: any = {}) {
    // サイトグループに応じた出し分けロジック
    const siteGroup = params.site_group || '';
    
    if (siteGroup === 'bicstation') {
        return await fetchPCProducts(params);
    } else if (siteGroup === 'tiper' || siteGroup === 'avflash') {
        return await getAdultProducts(params);
    }
    
    return await fetchPostList('post', params.limit, params.offset);
}

// --- 📝 WordPress 互換機能 ---

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

export async function getAdultProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 20).toString(),
        offset: (safeParams.offset || 0).toString(),
        ordering: safeParams.ordering || '-id',
        ...(safeParams.site_group && { site_group: safeParams.site_group })
    });
    const url = resolveApiUrl(`/adult-products/?${query.toString()}`);
    const { data, total } = await fetchFromBridge(url, { next: { revalidate: 60 } });
    return { results: data?.results || [], count: data?.count || total };
}

// --- 💻 PC製品・ランキング機能 (BicStation) ---

export async function fetchPCProducts(params: any = {}) {
    const safeParams = params || {};
    const query = new URLSearchParams({
        limit: (safeParams.limit || 10).toString(),
        offset: (safeParams.offset || 0).toString(),
        ...(safeParams.maker && { maker: safeParams.maker }),
        ...(safeParams.site_group && { site_group: safeParams.site_group })
    });
    
    // BICSTATION 404対策: 正しいエンドポイントパスを確認
    const url = resolveApiUrl(`/pc-products/?${query.toString()}`);
    const { data } = await fetchFromBridge(url);
    return { results: data?.results || [], count: data?.count || 0 };
}

/**
 * エイリアス互換設定
 */
export { fetchPostList as getSiteMainPosts };
export { getAdultProducts as getUnifiedProducts };