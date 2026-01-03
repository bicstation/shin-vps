/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - 職場開発環境 完全整合版
 * =====================================================================
 * * 🛠️ このファイルが解決する課題:
 * 1. SERVER-SIDE (Next.jsビルド時): Docker内線 (http://django-v2:8000) で通信。
 * 2. BROWSER-SIDE (ユーザー閲覧時): Traefik外線 (http://localhost:8083) で通信。
 * 3. WordPress対応: 標準の 'posts' ではなく、カスタム投稿 'bicstation' を取得。
 * 4. ネットワーク: Traefikの振り分けに必要な 'Host: localhost' ヘッダーを自動付与。
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 Django API のベースURLを決定する
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) {
        // Next.jsコンテナからDjangoコンテナへの直接通信
        return 'http://django-v2:8000';
    }
    // ブラウザからのアクセス時。職場PCのlocalhost:8083を使用。
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8083';
    }
    return 'https://bicstation.com';
};

/**
 * 🔗 WordPress API のベースURLを決定する
 * 💡 ポイント: ローカルでは /blog パスを経由するように設定
 */
const getWpBaseUrl = () => {
    if (IS_SERVER) {
        // コンテナ間通信。※WPの設定により内部でも /blog が必要な場合があるため調整
        return 'http://nginx-wp-v2/blog';
    }
    // ブラウザからのアクセス。Traefikが /blog を見てWPコンテナに振り分ける
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8083/blog';
    }
    return 'https://bicstation.com/blog';
};

// --- 型定義 (TypeScript) ---
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
    results: PCProduct[];
    error?: boolean;
    debugUrl?: string;
}

/**
 * =====================================================================
 * 💻 [Django API] PC製品データ取得ロジック
 * =====================================================================
 */

/**
 * 製品一覧を取得 (Bicstation 向け)
 */
export async function fetchPCProducts(maker = 'lenovo', offset = 0, limit = 10): Promise<PCProductResponse> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-products/?maker=${maker.toLowerCase()}&limit=${limit}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            cache: 'no-store', // 開発時は常に最新を取得
            signal: AbortSignal.timeout(5000),
            headers: { 
                'Accept': 'application/json',
                'Host': 'localhost' // Traefikがコンテナを特定するために必須
            }
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        
        return { 
            results: data.results || [], 
            count: data.count || 0,
            debugUrl: url 
        };
    } catch (error: any) {
        console.error(`[API Error] fetchPCProducts: ${error.message}`);
        return { results: [], count: 0, error: true, debugUrl: url };
    }
}

/**
 * 製品詳細を取得 (ID指定)
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
            next: { revalidate: 3600 }, // 1時間はキャッシュを再利用
        });
        return res.ok ? await res.json() : null;
    } catch (error) {
        console.error(`[API Error] fetchProductDetail (${unique_id}) failed`);
        return null;
    }
}

/**
 * =====================================================================
 * 📝 [WordPress API] カスタム投稿データ取得ロジック
 * =====================================================================
 */

/**
 * カスタム投稿 'bicstation' の記事一覧を取得
 */
export async function fetchPostList(perPage = 5) {
    const rootUrl = getWpBaseUrl();
    // 💡 修正: 標準の /posts ではなく、カスタム投稿タイプ /bicstation を指定
    const url = `${rootUrl}/wp-json/wp/v2/bicstation?_embed&per_page=${perPage}`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            next: { revalidate: 60 }, // 60秒ごとに更新確認
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn(`[WP Warning] No bicstation posts found or status: ${res.status}`);
            return [];
        }

        const data = await res.json();
        // WP APIは通常、配列で結果を返す
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error(`[WP Error] fetchPostList failed: ${error.message}`);
        return [];
    }
}

/**
 * カスタム投稿 'bicstation' の個別記事を取得 (Slug指定)
 */
export async function fetchPostData(slug: string) {
    const rootUrl = getWpBaseUrl();
    const url = `${rootUrl}/wp-json/wp/v2/bicstation?slug=${slug}&_embed`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost' },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        const posts = await res.json();
        // slug指定でも配列で返ってくるため、最初の1件を返す
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Error] fetchPostData failed for slug: ${slug}`);
        return null;
    }
}