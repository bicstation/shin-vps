/**
 * =====================================================================
 * 💡 SHIN-VPS 統合 API サービス層 (shared/api.ts)
 * WordPress(bicstation) & Django(pc-products) 統合データアクセス層
 * ---------------------------------------------------------------------
 * 1. 環境判定（Server vs Client）による通信先の自動切り替え
 * 2. サイト判定（site_group）によるデータの自動フィルタリング
 * 3. ローカル（localhost）と本番（VPS）の完全両対応
 * =====================================================================
 */

import { getSiteMetadata } from './siteConfig';

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 WordPress API 設定
 * サーバーサイドなら Docker コンテナ名、クライアントサイドなら localhost 経由
 */
const getWpConfig = () => {
    const { site_prefix } = getSiteMetadata();
    
    if (IS_SERVER) {
        // Next.jsサーバー内部（Dockerネットワーク）からの通信
        return {
            baseUrl: 'http://nginx-wp-v2', 
            host: 'localhost:8083' // WordPress側のドメイン設定と一致させる
        };
    }
    // クライアントサイド（ブラウザ）からの通信
    return {
        // site_prefix (例: /tiper) がある場合はそれを考慮
        baseUrl: `http://localhost:8083${site_prefix}/blog`,
        host: 'localhost:8083'
    };
};

/**
 * 🔗 Django API 設定
 * 環境変数 NEXT_PUBLIC_API_URL を活用し、末尾の /api を除去したベースURLを返却
 */
const getDjangoBaseUrl = () => {
    if (IS_SERVER) {
        // Dockerネットワーク内での通信
        return 'http://django-v2:8000';
    }

    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (envUrl) {
        // 末尾の /api を削ってベースURLにする
        const formattedUrl = envUrl.replace(/\/api$/, '').replace(/\/$/, '');
        console.log(`[API DEBUG] Base URL: ${formattedUrl}`);
        return formattedUrl;
    }

    // 環境変数がない場合のフォールバック
    console.warn(`[API DEBUG] NEXT_PUBLIC_API_URL is undefined!`);
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

export interface MakerCount {
    maker: string;
    count: number;
}

// --- WordPress API 関数 ---

/**
 * 📝 [WordPress] 記事一覧取得
 */
export async function fetchPostList(perPage = 12, offset = 0) {
    const { baseUrl, host } = getWpConfig();
    // bicstation カスタムポストタイプを使用
    const url = `${baseUrl}/wp-json/wp/v2/bicstation?_embed&per_page=${perPage}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 } // 60秒キャッシュ
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
            next: { revalidate: 3600 } // 1時間キャッシュ
        });

        if (!res.ok) return null;
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Single Post API ERROR]:`, error);
        return null;
    }
}

// --- Django API 関数 ---

/**
 * 💻 [Django API] 商品一覧取得 (サイトフィルター自動適用版)
 */
export async function fetchPCProducts(
    maker = '', 
    offset = 0, 
    limit = 10, 
    attribute = '',
    budget = '',    // 💰 最大予算
    ram = '',       // 🧠 最小メモリ
    npu = false,    // 🤖 NPU搭載フラグ
    gpu = false,    // 🎮 独立GPUフラグ
    type = ''       // 🏗️ 筐体タイプ
) {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata(); // サイトグループ (adult/general) を取得
    const params = new URLSearchParams();
    
    // サイトグループに基づいてデータをフィルタリング
    params.append('site_group', site_group);

    // 基本パラメータ
    if (maker) params.append('maker', maker); 
    if (attribute) params.append('attribute', attribute);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    // PCファインダー用パラメータ
    if (budget) params.append('budget', budget);
    if (ram) params.append('ram', ram);
    if (npu) params.append('npu', 'true');
    if (gpu) params.append('gpu', 'true');
    if (type && type !== 'all') params.append('type', type);

    const url = `${rootUrl}/api/pc-products/?${params.toString()}`;
    console.log(`[API CALL fetchPCProducts]: ${url}`);
    
    try {
        const res = await fetch(url, { 
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            next: { revalidate: 3600 } 
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
        console.error(`[Django API ERROR]: ${e.message} (Target URL: ${url})`);
        return { results: [], count: 0, debugUrl: url }; 
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
            cache: 'no-store'
        });
        return res.ok ? await res.json() : null;
    } catch (e) { 
        console.error(`[Product Detail API ERROR]:`, e);
        return null; 
    }
}

/**
 * 💻 [Django API] 関連商品の取得 (同一サイトグループ内)
 */
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

        return results
            .filter((product) => product.unique_id !== excludeId)
            .slice(0, limit);
            
    } catch (e) {
        console.error(`[Related Products API ERROR]:`, e);
        return [];
    }
}

/**
 * 💻 [Django API] メーカー一覧取得
 */
export async function fetchMakers(): Promise<MakerCount[]> {
    const rootUrl = getDjangoBaseUrl();
    const url = `${rootUrl}/api/pc-makers/`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
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
 * 🚀 [Django API] ランキング取得 (AI解析スコア順 + サイトグループ考慮)
 */
export async function fetchPCProductRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata();
    const url = `${rootUrl}/api/pc-products/ranking/?site_group=${site_group}`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store'
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
 * 🔥 [Django API] 注目度ランキング取得 (PV数ベース + サイトグループ考慮)
 */
export async function fetchPCPopularityRanking(): Promise<PCProduct[]> {
    const rootUrl = getDjangoBaseUrl();
    const { site_group } = getSiteMetadata();
    const url = `${rootUrl}/api/pc-products/popularity-ranking/?site_group=${site_group}`;

    try {
        const res = await fetch(url, {
            headers: { 'Host': 'localhost', 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[Django Popularity Ranking API Error]: Status ${res.status}`);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (e) {
        console.error(`[Popularity Ranking API ERROR]:`, e);
        return [];
    }
}