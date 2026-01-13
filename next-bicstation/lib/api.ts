/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - 最終完全版
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

export interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    name: string;
    price: number;
    image_url: string;
    url: string;           // 直リンクURL
    affiliate_url: string; // 正式アフィリエイトURL
    description: string;
    ai_content: string;    // AI生成コンテンツ
    stock_status: string;
    unified_genre: string;
}

/**
 * ✨ [NEW] メーカーと製品数の型定義
 */
export interface MakerCount {
    maker: string;
    count: number;
}

/**
 * 📝 [WordPress] 記事一覧取得
 */
export async function fetchPostList(perPage = 5) {
    const { baseUrl, host } = getWpConfig();
    const url = `${baseUrl}/wp-json/wp/v2/bicstation?_embed&per_page=${perPage}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 }
        });

        if (!res.ok) return { results: [], debugUrl: url, status: res.status };
        const data = await res.json();
        return { results: Array.isArray(data) ? data : [], debugUrl: url, status: res.status };
    } catch (error: any) {
        console.error(`[WP API ERROR]: ${error.message}`);
        return { results: [], debugUrl: url };
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
export async function fetchPCProducts(maker = '', offset = 0, limit = 10) {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost' },
            cache: 'no-store',
            next: { revalidate: 0 } 
        });

        if (!res.ok) {
            console.error(`[Django API Error]: Status ${res.status} for URL: ${url}`);
            return { results: [], count: 0, debugUrl: url };
        }

        const data = await res.json();
        
        if (IS_SERVER) {
            console.log(`[API Fetch Success]: offset=${offset}, items=${data.results?.length}`);
        }

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
            cache: 'no-store',
            next: { revalidate: 0 } 
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
 * ✅ Django の PCProductMakerListView から集計データを取得
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-makers/`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error(`[Django Makers API Error]: Status ${res.status}`);
            return [];
        }

        // [{maker: "Dell", count: 10}, ...] という形式のJSONを返す
        return await res.json();
    } catch (e) {
        console.error(`[Makers API ERROR]:`, e);
        return [];
    }
}