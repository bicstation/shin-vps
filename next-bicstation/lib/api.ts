/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - 統合版
 * WordPress(bicstation) & Django(pc-products) 統合データアクセス層
 * =====================================================================
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 WordPress API 設定
 */
const getWpConfig = () => {
    if (IS_SERVER) {
        // Next.jsサーバー内部（Dockerネットワーク）からの通信
        return {
            baseUrl: 'http://nginx-wp-v2', 
            host: 'localhost:8083' // WP_HOME / WP_SITEURL と一致させる
        };
    }
    // クライアントサイド（ブラウザ）からの通信
    return {
        baseUrl: 'http://localhost:8083/blog',
        host: 'localhost:8083'
    };
};

/**
 * 🔗 Django API 設定
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) return 'http://django-v2:8000';
    return 'http://localhost:8083';
};

// --- 型定義 ---

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
    url: string;           // 直リンクURL
    affiliate_url: string; // 正式アフィリエイトURL
    description: string;
    ai_content: string;    // AI生成コンテンツ
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    // スペック情報
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;   // AI解析総合スコア
    radar_chart?: RadarChartData[]; // 5軸チャート用データ
}

/**
 * ✨ メーカーと製品数の型定義
 */
export interface MakerCount {
    maker: string;
    count: number;
}

/**
 * 📝 [WordPress] 記事一覧取得
 */
export async function fetchPostList(perPage = 12, offset = 0) {
    const { baseUrl, host } = getWpConfig();
    const url = `${baseUrl}/wp-json/wp/v2/bicstation?_embed&per_page=${perPage}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 }
        });

        if (!res.ok) return { results: [], count: 0, debugUrl: url, status: res.status };

        const data = await res.json();
        const totalCount = parseInt(res.headers.get('X-WP-Total') || '0', 10);

        return { 
            results: Array.isArray(data) ? data : [], 
            count: totalCount, 
            debugUrl: url, 
            status: res.status 
        };
    } catch (error: any) {
        console.error(`[WP API ERROR]: ${error.message}`);
        return { results: [], count: 0, debugUrl: url };
    }
}

/**
 * 📝 [WordPress] 個別記事取得
 */
export async function fetchPostData(slug: string) {
    const { baseUrl, host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    const url = `${baseUrl}/wp-json/wp/v2/bicstation?slug=${safeSlug}&_embed`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Single Post API ERROR]:`, error);
        return null;
    }
}

/**
 * 💻 [Django API] 商品一覧取得
 */
export async function fetchPCProducts(maker = '', offset = 0, limit = 10, attribute = '') {
    const rootUrl = getDjangoBaseUrl();
    
    const params = new URLSearchParams();
    if (maker) params.append('maker', maker.toLowerCase());
    if (attribute) params.append('attribute', attribute);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const url = `${rootUrl}/api/pc-products/?${params.toString()}`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost' },
            // cache: 'no-store'
            next: { revalidate: 3600 } // 1時間はキャッシュを利用（その間は爆速）
        });

        if (!res.ok) {
            console.error(`[Django API Error]: Status ${res.status} for URL: ${url}`);
            return { results: [], count: 0, debugUrl: url };
        }

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0, 
            debugUrl: url 
        };
    } catch (e: any) { 
        console.error(`[Django API ERROR]: ${e.message}`);
        return { results: [], count: 0 }; 
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
            headers: { 'Host': 'localhost' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : null;
    } catch (e) { 
        return null; 
    }
}

/**
 * 💻 [Django API] 関連商品の取得
 */
export async function fetchRelatedProducts(maker: string, excludeId: string, limit = 4) {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/?maker=${maker.toLowerCase()}&limit=${limit + 1}`;

    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost' },
            next: { revalidate: 3600 }
        });

        if (!res.ok) return [];

        const data = await res.json();
        const results: PCProduct[] = data.results || [];

        return results
            .filter((product) => product.unique_id !== excludeId)
            .slice(0, limit);
            
    } catch (e) {
        console.error(`[Related Products API ERROR]:`, e);
        return [];
    }
}

/**
 * 💻 [Django API] メーカー一覧取得 (製品数カウント付き)
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-makers/`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            cache: 'no-store'
        });

        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(`[Makers API ERROR]:`, e);
        return [];
    }
}

/**
 * 🚀 [Django API] ランキング取得 (AI解析スコア順)
 * ソフトウェア等の不純物が除外された上位1000件を取得します。
 */
export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/ranking/`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error(`[Django Ranking API Error]: Status ${res.status}`);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Ranking API ERROR]:`, e);
        return [];
    }
}

/**
 * 🔥 [Django API] 注目度ランキング取得 (PV数ベース)
 * 今リアルタイムで注目されている製品の上位を取得します。
 */
export async function fetchPCPopularityRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/popularity-ranking/`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error(`[Django Popularity Ranking API Error]: Status ${res.status}`);
            return [];
        }

        const data = await res.json();
        // PopularityRankingViewは pagination_class = None のため、直で配列が返る想定
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Popularity Ranking API ERROR]:`, e);
        return [];
    }
}