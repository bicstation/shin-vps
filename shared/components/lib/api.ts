/**
 * =====================================================================
 * 💡 SHIN-VPS 統合 API サービス層 (shared/components/lib/api.ts)
 * WordPress(bicstation/saving) & Django(pc-products) 統合データアクセス層
 * ---------------------------------------------------------------------
 * 対応ドメイン:
 * - bicstation.com (postType: bicstation)
 * - bic-saving.com (postType: saving)
 * - tiper.live (site_group: tiper)
 * - avflash.xyz (site_group: avflash)
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
    
    if (IS_SERVER) {
        // Next.jsサーバー内部（Dockerネットワーク）からの通信
        return {
            baseUrl: 'http://nginx-wp-v2', 
            host: 'localhost:8083' // WordPress側のドメイン設定（内部ポート）に一致させる
        };
    }
    // クライアントサイド（ブラウザ）からの通信
    return {
        baseUrl: `http://localhost:8083${site_prefix}/blog`,
        host: 'localhost:8083'
    };
};

/**
 * 🔗 Django API 接続設定の取得
 * 環境変数 NEXT_PUBLIC_API_URL をベースに、通信先を判定します
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) {
        // Dockerネットワーク内でのコンテナ間通信
        return 'http://django-v2:8000';
    }

    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (envUrl) {
        // 末尾のスラッシュや /api を除去してベースURLを正規化
        const formattedUrl = envUrl.replace(/\/api$/, '').replace(/\/$/, '');
        return formattedUrl;
    }

    // フォールバック（ローカル開発環境用）
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
    url: string;           // 直リンクURL
    affiliate_url: string; // 正式アフィリエイトURL
    description: string;
    ai_content: string;    // AI生成コンテンツ
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;   // AI解析総合スコア
    radar_chart?: RadarChartData[]; // 5軸チャート用データ
}

export interface MakerCount {
    maker: string;
    count: number;
}

// --- WordPress API 関数群 ---

/**
 * 📝 [WordPress] 記事一覧取得
 * @param postType - 'bicstation' または 'saving' を指定
 * @param perPage - 取得件数
 * @param offset - 取得開始位置
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
            next: { revalidate: 60 }, // 1分間のキャッシュ
            signal: AbortSignal.timeout(5000) // 5秒でタイムアウト（ビルド停滞防止）
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
 * @param postType - 'bicstation' または 'saving'
 * @param slug - 記事のスラッグ
 */
export async function fetchPostData(postType = 'bicstation', slug: string) {
    const { baseUrl, host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?slug=${safeSlug}&_embed`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            next: { revalidate: 3600 }, // 1時間のキャッシュ
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

// --- 特定サイト(Tiper等)向けエイリアス関数 ---

export async function getAdultProducts(arg1?: any, arg2?: number) {
    let offset = 0; let limit = 12;
    if (typeof arg1 === 'object' && arg1 !== null) {
        offset = arg1.offset ?? 0; limit = arg1.limit ?? 12;
    } else {
        offset = typeof arg1 === 'number' ? arg1 : 0;
        limit = typeof arg2 === 'number' ? arg2 : 12;
    }
    return fetchPCProducts('', offset, limit);
}

export async function getAdultProductById(id: string) {
    return fetchProductDetail(id);
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


/**
 * 💡 不足していた関数を追加
 * 特定のメーカーの製品一覧を取得します
 */
export async function getAdultProductsByMaker(maker: string, offset = 0, limit = 12) {
    return fetchPCProducts(maker, offset, limit);
}