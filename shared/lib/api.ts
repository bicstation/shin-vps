/**
 * =====================================================================
 * 💡 SHIN-VPS 統合 API サービス層 (shared/components/lib/api.ts)
 * WordPress(bicstation/saving/tiper) & Django 統合データアクセス層
 * =====================================================================
 */

import { getSiteMetadata } from './siteConfig';

// サーバーサイドかクライアントサイドかを判定
const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 WordPress API 接続設定の取得
 * 実行環境に応じて通信先とHostヘッダーを動的に切り替えます
 */
const getWpConfig = () => {
    const { site_prefix } = getSiteMetadata();
    
    // サイト識別子を取得 (tiper, bicstation, savingなど)
    const siteKey = site_prefix.replace(/\//g, '') || 'bicstation';
    
    /**
     * 💡 修正ポイント: 
     * 1. Nginx(nginx-wp-v2)がコンテナを振り分けるための Host ヘッダーを生成
     * 2. /blog をパスから排除
     */
    const hostHeader = `b-${siteKey}-host`; 

    if (IS_SERVER) {
        // Next.jsサーバー内部（Dockerネットワーク）からの通信
        return {
            baseUrl: 'http://nginx-wp-v2', 
            host: hostHeader 
        };
    }
    // クライアントサイド（ブラウザ）からの通信
    return {
        // site_prefix がある場合も /blog は付けない
        baseUrl: `http://localhost:8083${site_prefix}`, 
        host: hostHeader
    };
};

/**
 * 🔗 Django API 接続設定の取得
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) {
        return 'http://django-v3:8000';
    }
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
        const formattedUrl = envUrl.replace(/\/api$/, '').replace(/\/$/, '');
        return formattedUrl;
    }
    return 'http://localhost:8083';
};

// --- 型定義 (TypeScript Type Definitions) ---

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

// --- WordPress API 関数群 ---

/**
 * 📝 [WordPress] 汎用投稿一覧取得 (RSS/サイトマップ用)
 */
export async function fetchWordPressPosts(perPage = 20) {
    const { baseUrl, host } = getWpConfig();
    const url = `${baseUrl}/wp-json/wp/v2/posts?_embed&per_page=${perPage}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) throw new Error(`WP API Error: ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error(`[fetchWordPressPosts FAILED]: ${error.message} at ${url}`);
        return [];
    }
}

/**
 * 📝 [WordPress] カスタム投稿タイプ(bicstation等)一覧取得
 */
export async function fetchPostList(postType = 'bicstation', perPage = 12, offset = 0) {
    const { baseUrl, host } = getWpConfig();
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?_embed&per_page=${perPage}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            return { results: [], count: 0, debugUrl: url, status: res.status };
        }

        const data = await res.json();
        const totalCount = parseInt(res.headers.get('X-WP-Total') || '0', 10);

        return { 
            results: Array.isArray(data) ? data : [], 
            count: totalCount, 
            debugUrl: url, 
            status: res.status 
        };
    } catch (error: any) {
        console.error(`[WP API ERROR]: ${error.message} at ${url}`);
        return { results: [], count: 0, debugUrl: url, error: error.message };
    }
}

/**
 * 📝 [WordPress] 個別記事取得
 */
export async function fetchPostData(postType = 'bicstation', slug: string) {
    const { baseUrl, host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?slug=${safeSlug}&_embed`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) return null;
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Single Post API ERROR]:`, error);
        return null;
    }
}

// --- Django API 関数群 (PCプロダクト用) ---

/**
 * 💻 [Django API] 商品一覧取得 (サイトフィルター自動適用)
 */
export async function fetchPCProducts(
    maker = '', 
    offset = 0, 
    limit = 10, 
    attribute = '',
    budget = '', 
    ram = '', 
    npu = false, 
    gpu = false, 
    type = ''
) {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata(); 
    const params = new URLSearchParams();
    
    params.append('site_group', site_group);
    if (maker) params.append('maker', maker); 
    if (attribute) params.append('attribute', attribute);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    if (budget) params.append('budget', budget);
    if (ram) params.append('ram', ram);
    if (npu) params.append('npu', 'true');
    if (gpu) params.append('gpu', 'true');
    if (type && type !== 'all') params.append('type', type);

    const url = `${rootUrl}/api/pc-products/?${params.toString()}`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) return { results: [], count: 0, next: null, debugUrl: url };

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            next: data.next || null,
            debugUrl: url 
        };
    } catch (e: any) { 
        console.error(`[Django API ERROR]: ${e.message}`);
        return { results: [], count: 0, next: null, debugUrl: url }; 
    }
}

/**
 * 💻 [Django API] 商品詳細取得
 */
export async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/${unique_id}/`;
    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });
        return res.ok ? await res.json() : null;
    } catch (e) { 
        console.error(`[Product Detail API ERROR]:`, e);
        return null; 
    }
}

// --- 🔞 特定サイト(Tiper等)向けアダルト商品取得ロジック ---

/**
 * 🔞 [Django API] アダルト商品一覧取得
 */
export async function getAdultProducts(params: any = {}) {
    let offset = 0; 
    let limit = 20;
    let ordering = '-id';

    if (typeof params === 'object' && params !== null) {
        offset = params.offset ?? 0;
        limit = params.limit ?? 20;
        ordering = params.ordering ?? '-id';
    }

    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata(); 
    
    const url = `${rootUrl}/api/adult-products/?limit=${limit}&offset=${offset}&ordering=${ordering}&site_group=${site_group}`;

    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) return { results: [], count: 0 };

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0 
        };
    } catch (e) {
        console.error(`[Adult API ERROR]:`, e);
        return { results: [], count: 0 };
    }
}

export async function getAdultProductById(id: string) {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/adult-products/${id}/`;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

export async function getAdultProductsByMaker(maker: string, offset = 0, limit = 12) {
    return getAdultProducts({ offset, limit, maker });
}

// --- 共通ランキング・関連商品取得ロジック ---

export async function fetchRelatedProducts(maker: string, excludeId: string, limit = 4) {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata();
    const url = `${rootUrl}/api/pc-products/?maker=${maker}&site_group=${site_group}&limit=${limit + 1}`;

    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const results: PCProduct[] = data.results || [];
        return results.filter((product) => product.unique_id !== excludeId).slice(0, limit);
    } catch (e) {
        console.error(`[Related Products API ERROR]:`, e);
        return [];
    }
}

export async function fetchMakers(): Promise<MakerCount[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-makers/`;
    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) {
        console.error(`[Makers API ERROR]:`, e);
        return [];
    }
}

export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata();
    const url = `${rootUrl}/api/pc-products/ranking/?site_group=${site_group}`;
    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Ranking API ERROR]:`, e);
        return [];
    }
}

export async function fetchPCPopularityRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata();
    const url = `${rootUrl}/api/pc-products/popularity-ranking/?site_group=${site_group}`;
    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Popularity Ranking API ERROR]:`, e);
        return [];
    }
}