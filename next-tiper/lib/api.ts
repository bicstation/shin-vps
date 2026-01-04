/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - tiper.live 職場開発環境版
 * アダルト商品・ジャンル・WPカスタム投稿(tiper)の全コンテンツ対応
 * =====================================================================
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 WordPress / Django 設定取得
 * 💡 修正ポイント: 成功した bicstation のロジックをベースに、
 * Hostを localhost:8083 に固定してリダイレクトを防止。
 */
const getApiConfig = () => {
    if (IS_SERVER) {
        return {
            wpBase: 'http://nginx-wp-v2', // 内線通信
            djangoBase: 'http://django-v2:8000',
            hostHeader: 'localhost:8083' // WPのWP_HOME設定と一致させる
        };
    }
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return {
        wpBase: isLocal ? 'http://localhost:8083/tiper' : 'https://tiper.live/tiper',
        djangoBase: isLocal ? 'http://localhost:8083' : 'https://tiper.live',
        hostHeader: 'localhost:8083'
    };
};

/**
 * =====================================================================
 * 🔞 [Django] アダルト商品 API (元のロジックを維持)
 * =====================================================================
 */

/**
 * 商品一覧取得
 */
export async function getAdultProducts(params?: { 
    limit?: number; 
    offset?: number; 
    genre?: string; 
    sort?: string;
    }) {
    const { djangoBase } = getApiConfig();
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.genre) query.append('genre', params.genre);
    if (params?.sort) query.append('ordering', params.sort);

    const url = `${djangoBase}/api/adults/?${query.toString()}`;

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            headers: { 'Host': 'localhost' } // Django側は標準的なHostを期待
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return await res.json();
    } catch (error: any) {
        console.error("[Django API Error]", error?.message);
        return { results: [], count: 0 };
    }
}

/**
 * 商品詳細取得
 */
export async function getAdultProductById(id: string) {
    const { djangoBase } = getApiConfig();
    try {
        const res = await fetch(`${djangoBase}/api/adults/${id}/`, {
            cache: 'no-store',
            headers: { 'Host': 'localhost' }
        });
        return res.ok ? await res.json() : null;
    } catch (error) {
        return null;
    }
}

/**
 * ジャンル一覧取得
 */
export async function getGenres() {
    const { djangoBase } = getApiConfig();
    try {
        const res = await fetch(`${djangoBase}/api/genres/`, {
            cache: 'no-store',
            headers: { 'Host': 'localhost' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.results || []);
    } catch (error) {
        return [];
    }
}

/**
 * =====================================================================
 * 📝 [WordPress] 記事取得 API (tiper カスタム投稿専用)
 * =====================================================================
 */

/**
 * 💡 記事一覧取得 (カスタム投稿 'tiper' を使用するように変更)
 */
export async function fetchPostList(perPage = 5) {
    const { wpBase, hostHeader } = getApiConfig();
    // 💡 エンドポイントを /posts から /tiper に変更
    const url = `${wpBase}/wp-json/wp/v2/tiper?_embed&per_page=${perPage}&_t=${Date.now()}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': hostHeader,
                'Accept': 'application/json' 
            },
            // キャッシュによる混同を防ぐため、開発環境では revalidate ではなく no-store を推奨
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[WP API Error] Status: ${res.status}`);
            return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("[WP API Error]", error);
        return [];
    }
}

/**
 * 💡 個別記事取得 (カスタム投稿 'tiper' を使用するように変更)
 */
export async function fetchPostData(slug: string) {
    const { wpBase, hostHeader } = getApiConfig();
    const cleanSlug = encodeURIComponent(decodeURIComponent(slug));
    // 💡 エンドポイントを /posts から /tiper に変更
    const url = `${wpBase}/wp-json/wp/v2/tiper?slug=${cleanSlug}&_embed&_t=${Date.now()}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': hostHeader,
                'Accept': 'application/json' 
            },
            cache: 'no-store'
        });

        if (!res.ok) return null;
        const posts = await res.json();
        
        // tiper 投稿であることを確認し、配列の最初の1件を返す
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error("[WP API Error]", error);
        return null;
    }
}

/**
 * =====================================================================
 * 🛠 追加: ビルドエラー解消用 (既存ロジックには影響しません)
 * =====================================================================
 */
export async function getAdultProductsByMaker(maker: string, params?: { limit?: number; offset?: number }) {
    const { djangoBase } = getApiConfig();
    const query = new URLSearchParams();
    query.append('maker', maker);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    try {
        const res = await fetch(`${djangoBase}/api/adults/?${query.toString()}`, {
            cache: 'no-store',
            headers: { 'Host': 'localhost' }
        });
        return res.ok ? await res.json() : { results: [], count: 0 };
    } catch (error) {
        return { results: [], count: 0 };
    }
}