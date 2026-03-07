/**
 * =====================================================================
 * 💡 SHIN-VPS 統合 API サービス層 (shared/lib/api/index.ts)
 * 🛡️ Maya's Logic: v3 統合・物理パス完全同期版
 * =====================================================================
 */
// 物理パス: /home/maya/shin-dev/shin-vps/shared/lib/api/index.ts

import { getSiteMetadata } from '../utils/siteConfig';

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 API 接続設定の共通解決
 * すべてのリクエストを Django v3 (Docker内部ネットワーク) 経由に統合
 */
const getApiConfig = () => {
    const site = getSiteMetadata();
    const { origin_domain } = site;
    
    // サイト名から Django が識別可能な Host 名を解決
    const hostHeader = origin_domain || 'localhost';

    if (IS_SERVER) {
        // Next.js サーバー内部からは Docker ネットワーク経由で Django へ
        // 🚨 以前の nginx-wp-v2 は廃止。すべて django-v3:8000/api へ。
        return {
            baseUrl: 'http://django-v3:8000/api',
            host: hostHeader
        };
    }

    // クライアントサイド (ブラウザ)
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    return {
        baseUrl: envUrl ? envUrl.replace(/\/$/, '') : '/api',
        host: hostHeader
    };
};

// --- 型定義 (Type Definitions) ---

export interface RadarChartData {
    subject: string;
    value: number;
    fullMark: number;
}

export interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    maker_name?: string;
    name: string;
    price: number;
    image_url: string;
    url: string;
    affiliate_url: string;
    description: string;
    ai_content: string;
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;
    radar_chart?: RadarChartData[];
}

export interface MakerCount {
    maker: string;
    count: number;
}

// --- API 関数群 (WordPress 互換エンドポイント) ---

/**
 * 📝 [Django-WP] 投稿一覧取得
 */
export async function fetchPostList(postType = 'posts', perPage = 12, offset = 0) {
    const { baseUrl, host } = getApiConfig();
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?_embed&per_page=${perPage}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) return { results: [], count: 0, status: res.status };

        const data = await res.json();
        const totalCount = parseInt(res.headers.get('X-WP-Total') || '0', 10);

        return { 
            results: Array.isArray(data) ? data : [], 
            count: totalCount,
            status: res.status 
        };
    } catch (error: any) {
        console.error(`[fetchPostList FAILED]: ${error.message} at ${url}`);
        return { results: [], count: 0, error: error.message };
    }
}

/**
 * 📝 [Django-WP] 個別記事取得
 */
export async function fetchPostData(postType = 'posts', slug: string) {
    const { baseUrl, host } = getApiConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?slug=${safeSlug}&_embed`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) return null;
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[fetchPostData ERROR]:`, error);
        return null;
    }
}

// --- Django API 関数群 (PC/Adult プロダクト用) ---

/**
 * 💻 [Django API] 商品一覧取得
 */
export async function fetchPCProducts(params: any = {}) {
    const { baseUrl, host } = getApiConfig();
    const { site_group } = getSiteMetadata(); 
    
    const query = new URLSearchParams({
        site_group: site_group || '',
        limit: (params.limit || 10).toString(),
        offset: (params.offset || 0).toString(),
        ...(params.maker && { maker: params.maker }),
        ...(params.budget && { budget: params.budget }),
        ...(params.type && params.type !== 'all' && { type: params.type })
    });

    const url = `${baseUrl}/pc-products/?${query.toString()}`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) return { results: [], count: 0 };
        const data = await res.json();
        return { results: data.results || [], count: data.count || 0 };
    } catch (e: any) { 
        console.error(`[fetchPCProducts ERROR]: ${e.message}`);
        return { results: [], count: 0 }; 
    }
}

/**
 * 🔞 [Django API] アダルト商品一覧取得
 */
export async function getAdultProducts(params: any = {}) {
    const { baseUrl, host } = getApiConfig();
    const { site_group } = getSiteMetadata(); 
    
    const query = new URLSearchParams({
        site_group: site_group || '',
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString(),
        ordering: params.ordering || '-id'
    });

    const url = `${baseUrl}/adult-products/?${query.toString()}`;

    try {
        const res = await fetch(url, { 
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) return { results: [], count: 0 };
        const data = await res.json();
        return { results: data.results || [], count: data.count || 0 };
    } catch (e) {
        console.error(`[getAdultProducts ERROR]:`, e);
        return { results: [], count: 0 };
    }
}

/**
 * 💻 [Django API] メーカ一覧取得
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const { baseUrl, host } = getApiConfig();
    const url = `${baseUrl}/pc-makers/`;
    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) {
        return [];
    }
}

/**
 * 💻 [Django API] ランキング取得
 */
export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const { baseUrl, host } = getApiConfig();
    const { site_group } = getSiteMetadata();
    const url = `${baseUrl}/pc-products/ranking/?site_group=${site_group}`;
    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        return [];
    }
}

// --- 実在するファイルのみを再エクスポート (Webpack エラー回避) ---
// 🚨 存在しない ./django/pc-products 等の参照を完全に除去しました
export * from './adultApi';
export * from './django';
export * from './types';

// 既存コードとの互換性維持（エイリアス）
export { getAdultProducts as getUnifiedProducts };
export { fetchPostList as getSiteMainPosts };