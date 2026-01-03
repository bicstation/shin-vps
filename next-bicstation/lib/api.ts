/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - 最終完全版
 * wp-config.php の強制パス補完に対応した最適化ロジック
 * =====================================================================
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 WordPress API 設定
 */
const getWpConfig = () => {
    if (IS_SERVER) {
        // Next.jsサーバー内部からの通信
        return {
            // 💡 wp-config.php で自動的に /blog が付与されるため、ここでは含めない
            baseUrl: 'http://nginx-wp-v2', 
            host: 'localhost:8083' // wp-config.php の WP_HOME と一致させる
        };
    }
    // クライアントサイド
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
    id: number; unique_id: string; site_prefix: string; maker: string;
    name: string; price: number; image_url: string; url: string;
    description: string; stock_status: string; unified_genre: string;
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
        return null;
    }
}

/**
 * 💻 [Django API] 取得関数群
 */
export async function fetchPCProducts(maker = 'lenovo', offset = 0, limit = 10) {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;
    try {
        const res = await fetch(url, { headers: { 'Host': 'localhost' } });
        const data = await res.json();
        return { results: data.results || [], count: data.count || 0, debugUrl: url };
    } catch (e) { return { results: [], count: 0 }; }
}

export async function fetchProductDetail(unique_id: string) {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/${unique_id}/`;
    try {
        const res = await fetch(url, { headers: { 'Host': 'localhost' } });
        return res.ok ? await res.json() : null;
    } catch (e) { return null; }
}