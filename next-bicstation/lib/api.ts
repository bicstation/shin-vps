/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - ビルドエラー修正版
 * =====================================================================
 */

const IS_SERVER = typeof window === 'undefined';
const API_BASE_URL = IS_SERVER 
  ? "http://django-v2:8000/api"  // Docker内部用URL
  : "https://tiper.live/api";    // ブラウザ用URL

const WP_BASE_URL = "http://nginx-wp-v2/wp-json/wp/v2";

// --- 型定義 ---
export interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    name: string;
    price: number;
    image_url: string;
    url: string;
    description: string;
    stock_status: string;
    unified_genre: string;
}

export interface PCProductResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PCProduct[];
    error?: boolean;
    debugUrl?: string;
}

/**
 * =====================================================================
 * 💻 [Django] PC製品 API (Bicstation用)
 * =====================================================================
 */

/**
 * 製品一覧取得
 */
export async function fetchPCProducts(maker = 'lenovo', offset = 0, limit = 10): Promise<PCProductResponse> {
    const url = `${API_BASE_URL}/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;
    try {
        const res = await fetch(url, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0,
            next: data.next || null,
            previous: data.previous || null,
            debugUrl: url 
        };
    } catch (error: any) {
        console.error("Fetch PC products failed:", error.message);
        return { results: [], count: 0, next: null, previous: null, error: true, debugUrl: url };
    }
}

/**
 * ✅ 復活: 製品詳細取得 (ビルドエラー解消用)
 * エラーログで求められている 'fetchProductDetail' という名前でエクスポートします。
 */
export async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    const url = `${API_BASE_URL}/pc-products/${unique_id}/`;
    try {
        const res = await fetch(url, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error(`Fetch detail failed (${unique_id}):`, error);
        return null;
    }
}

/**
 * =====================================================================
 * 🔞 [Django] アダルト製品 API (Tiper用)
 * =====================================================================
 */
export async function getAdultProducts(params?: { limit?: number; offset?: number; genre?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.genre) query.append('genres', params.genre);

    try {
        const res = await fetch(`${API_BASE_URL}/adults/?${query.toString()}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
    } catch (error: any) {
        console.error("Failed to fetch adult products:", error?.message);
        return { results: [], count: 0 }; 
    }
}

export async function getAdultProductById(id: string) {
    try {
        const res = await fetch(`${API_BASE_URL}/adults/${id}/`, { cache: 'no-store' });
        return res.ok ? await res.json() : null;
    } catch (error) { return null; }
}

/**
 * =====================================================================
 * 📝 [WordPress] 記事一覧取得
 * =====================================================================
 */
export async function fetchPostList(perPage = 5) {
    try {
        const res = await fetch(`${WP_BASE_URL}/posts?_embed&per_page=${perPage}`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000)
        });
        return res.ok ? await res.json() : [];
    } catch (error) { return []; }
}

export async function fetchPostData(slug: string) {
    try {
        const res = await fetch(`${WP_BASE_URL}/posts?slug=${slug}&_embed`, {
            next: { revalidate: 3600 }
        });
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) { return null; }
}