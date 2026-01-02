/**
 * ==========================================
 * 💡 API サービス層 (lib/api.ts) - 最終決定版
 * ==========================================
 */

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
 * --- 接続先URLの判定 ---
 */
const getDjangoBaseUrl = () => {
    // 1. サーバーサイド (Next.jsサーバー内部からのリクエスト)
    if (typeof window === 'undefined') {
        return process.env.API_URL_INTERNAL || 'http://django-v2:8000/api';
    }

    // 2. クライアントサイド (ブラウザからのリクエスト)
    // ローカル環境ではポート 8083 を強制使用
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8083/api';
    }
    
    // 3. 本番環境
    return 'https://bicstation.com/api';
};

// WordPress API URL
const WP_BASE_URL = 'http://nginx-wp-v2/wp-json/wp/v2';

/**
 * 💻 製品一覧取得
 */
export async function fetchPCProducts(maker = 'lenovo', offset = 0, limit = 10): Promise<PCProductResponse> {
    const baseUrl = getDjangoBaseUrl();
    const url = `${baseUrl}/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            headers: { 
                'Accept': 'application/json',
                // 本番環境のみ Host ヘッダーを付与
                ...(typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
                    ? { 'Host': 'bicstation.com' } 
                    : {})
            }
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
    } catch (error) {
        console.error("Django API Fetch Error:", error);
        return { results: [], count: 0, next: null, previous: null, error: true, debugUrl: url };
    }
}

/**
 * 🔍 製品詳細取得
 */
export async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    const baseUrl = getDjangoBaseUrl();
    const url = `${baseUrl}/pc-products/${unique_id}/`;
    
    try {
        const res = await fetch(url, { 
            headers: { 
                'Accept': 'application/json',
                ...(typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? { 'Host': 'bicstation.com' } : {})
            },
            next: { revalidate: 3600 },
        });
        return res.ok ? await res.json() : null;
    } catch (error) {
        return null;
    }
}

/**
 * 📝 WordPress API 関数
 */
export async function fetchPostList(perPage = 5) {
    try {
        const res = await fetch(`${WP_BASE_URL}/bicstation?_embed&per_page=${perPage}`, {
            headers: { 'Host': 'blog.tiper.live' },
            next: { revalidate: 60 }
        });
        return res.ok ? await res.json() : [];
    } catch {
        return [];
    }
}

export async function fetchPostData(slug: string) {
    try {
        const res = await fetch(`${WP_BASE_URL}/bicstation?slug=${slug}&_embed`, {
            headers: { 'Host': 'blog.tiper.live' },
            next: { revalidate: 3600 }
        });
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch {
        return null;
    }
}