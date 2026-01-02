/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - 最終整合版
 * =====================================================================
 * 🛠️ ネットワーク通信の仕組み:
 * 1. SERVER-SIDE (Next.jsサーバー): django-v2:8000 (内部)
 * 2. BROWSER-SIDE (ユーザーブラウザ): localhost:8083 (外部)
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

const IS_SERVER = typeof window === 'undefined';

/**
 * --- Django API 接続先ベースURLの決定 ---
 * 💡 修正ポイント: 
 * 文字列の結合ミスを防ぐため、ベースURLには /api を含めず、
 * 各関数内で `/api/pc-products/` と明示的に指定します。
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) {
        // Next.jsコンテナ内部からDjangoコンテナへ
        return 'http://django-v2:8000';
    }

    // ブラウザからのアクセス (Traefik経由)
    if (process.env.NEXT_PUBLIC_API_URL_EXTERNAL) {
        // http://localhost:8083 のような値を期待
        return process.env.NEXT_PUBLIC_API_URL_EXTERNAL.replace(/\/api$/, '');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8083';
    }
    
    return 'https://bicstation.com';
};

/**
 * WordPress API URL (Docker内部通信用)
 */
const WP_BASE_URL = 'http://nginx-wp-v2/wp-json/wp/v2';

/**
 * =====================================================================
 * 💻 [Django] 製品一覧取得
 * =====================================================================
 */
export async function fetchPCProducts(maker = 'lenovo', offset = 0, limit = 10): Promise<PCProductResponse> {
    const rootUrl = getDjangoBaseUrl();
    
    /**
     * 💡 修正: URL組み立て
     * Djangoの標準（APPEND_SLASH=True）に合わせ、
     * エンドポイントの末尾に必ずスラッシュを入れた状態でクエリを繋ぎます。
     */
    const url = `${rootUrl}/api/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;

    const side = IS_SERVER ? "🖥️ SERVER-SIDE" : "🌐 BROWSER-SIDE";
    console.log(`[DEBUG] ${side} - Requesting: ${url}`);

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
            headers: { 
                'Accept': 'application/json',
                // Traefikを通る時（外部）に必須なHostヘッダー
                'Host': 'localhost'
            }
        });

        if (!res.ok) {
            console.error(`[DEBUG] ${side} - HTTP ERROR: ${res.status} URL: ${url}`);
            throw new Error(`Status: ${res.status}`);
        }

        const data = await res.json();
        return { 
            results: data.results || [], 
            count: data.count || 0,
            next: data.next || null,
            previous: data.previous || null,
            debugUrl: url 
        };
    } catch (error: any) {
        console.error(`[DEBUG] ${side} - FETCH FAILED:`, error.message);
        return { 
            results: [], 
            count: 0, 
            next: null, 
            previous: null, 
            error: true, 
            debugUrl: url 
        };
    }
}

/**
 * =====================================================================
 * 🔍 [Django] 製品詳細取得
 * =====================================================================
 */
export async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/${unique_id}/`;
    
    try {
        const res = await fetch(url, { 
            signal: AbortSignal.timeout(5000),
            headers: { 
                'Accept': 'application/json',
                'Host': 'localhost'
            },
            next: { revalidate: 3600 },
        });
        return res.ok ? await res.json() : null;
    } catch (error: any) {
        return null;
    }
}

/**
 * =====================================================================
 * 📝 [WordPress] 記事一覧取得
 * =====================================================================
 */
export async function fetchPostList(perPage = 5) {
    const side = IS_SERVER ? "🖥️ SERVER-SIDE" : "🌐 BROWSER-SIDE";
    const url = `${WP_BASE_URL}/posts?_embed&per_page=${perPage}`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.error(`[DEBUG] ${side} - WP ERROR: ${res.status}`);
            return [];
        }

        return await res.json();
    } catch (error: any) {
        return [];
    }
}

/**
 * =====================================================================
 * 📝 [WordPress] 個別記事取得 (Slug指定)
 * =====================================================================
 */
export async function fetchPostData(slug: string) {
    try {
        const res = await fetch(`${WP_BASE_URL}/posts?slug=${slug}&_embed`, {
            headers: { 'Host': 'localhost' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error: any) {
        return null;
    }
}