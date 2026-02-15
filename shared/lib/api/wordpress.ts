/**
 * =====================================================================
 * 📝 WordPress 専用 API サービス層 (shared/lib/api/wordpress.ts)
 * 複数投稿タイプ（post + 固有タイプ）のマージと日付順ソートに対応
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from './config';

/**
 * 💡 接続先URLを解決するユーティリティ
 */
const resolveWPUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    
    if (IS_SERVER) {
        // サーバーサイド (Server Components) からのリクエストは Docker 内部ネットワークを使用
        return `http://nginx-wp-v2:80${endpoint}`;
    }
    
    // クライアントサイド（ブラウザ）
    return `${baseUrl}${endpoint}`;
};

/**
 * 🖼️ ユーティリティ: WordPressの投稿オブジェクトからアイキャッチ画像のURLを抽出
 * @param post WordPressの投稿オブジェクト (_embed: true で取得されていること)
 * @param size 画像サイズ (thumbnail, medium, large, full)
 */
export const getWpFeaturedImage = (post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string => {
    if (!post || !post._embedded || !post._embedded['wp:featuredmedia']) {
        return '/placeholder.jpg'; // 画像がない場合のフォールバック
    }

    const media = post._embedded['wp:featuredmedia'][0];
    // 指定したサイズが存在すればそのURLを、なければフルサイズを返す
    const sizes = media.media_details?.sizes;
    
    if (sizes && sizes[size]) {
        return sizes[size].source_url;
    }
    
    return media.source_url || '/placeholder.jpg';
};

/**
 * 📝 WordPress 投稿一覧取得 (単一タイプ用)
 */
export async function fetchPostList(postType: string, limit = 12, offset = 0) {
    const { host } = getWpConfig();
    
    // WordPress標準の「投稿」はエンドポイントが 'posts' になる
    const typeEndpoint = postType === 'post' ? 'posts' : postType;
    
    // APIエンドポイントの構築 (_embed を付与して画像データ等を含める)
    const endpoint = `/wp-json/wp/v2/${typeEndpoint}?_embed&per_page=${limit}&offset=${offset}`;
    const url = resolveWPUrl(endpoint);

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,           // Nginxの振り分けに必須
                'Accept': 'application/json' 
            },
            next: { revalidate: 60 },   // 1分間キャッシュ
            signal: AbortSignal.timeout(5000)
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
            console.warn(`[WP API WARNING]: Invalid response from ${url}. Status: ${res.status}`);
            return { results: [], count: 0 };
        }

        const data = await res.json();
        const totalCount = parseInt(res.headers.get('X-WP-Total') || '0', 10);

        return { 
            results: Array.isArray(data) ? data : [], 
            count: totalCount 
        };
    } catch (e: any) {
        console.error(`[WP API FETCH FAILED]: ${e.message} at ${url}`);
        return { results: [], count: 0 };
    }
}

/**
 * 💡 トップページ用：複数タイプを統合して日付順にソートして取得
 */
export async function getSiteMainPosts(offset = 0, limit = 5) {
    const { siteKey } = getWpConfig();

    // 1. 標準投稿 (post) を取得
    const postRes = await fetchPostList('post', limit, offset);
    
    // 2. サイト固有の投稿タイプを決定
    let specificType = '';
    if (siteKey === 'tiper') specificType = 'tiper';
    else if (siteKey === 'avflash') specificType = 'avflash';
    else if (siteKey === 'station') specificType = 'station';
    else if (siteKey === 'saving') specificType = 'saving';

    // 3. 固有タイプも取得
    let specificRes = { results: [], count: 0 };
    if (specificType) {
        specificRes = await fetchPostList(specificType, limit, offset);
    }

    // 4. 合体
    const combined = [...postRes.results, ...specificRes.results];

    // 5. 日付順にソート
    const sortedResults = combined.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 6. 最終件数の切り出し
    return {
        results: sortedResults.slice(0, limit),
        count: postRes.count + specificRes.count
    };
}

/**
 * 📝 個別記事取得 (Slug指定)
 */
export async function fetchPostData(postType: string, slug: string) {
    const { host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    
    const typeEndpoint = postType === 'post' ? 'posts' : postType;
    const endpoint = `/wp-json/wp/v2/${typeEndpoint}?slug=${safeSlug}&_embed`;
    const url = resolveWPUrl(endpoint);

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host, 
                'Accept': 'application/json' 
            },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000)
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
            return null;
        }

        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Single Post API ERROR]:`, error);
        return null;
    }
}

/**
 * 🏷️ タクソノミー（カテゴリ・タグ）取得
 */
export async function fetchTaxonomyTerms(taxonomyName: string) {
    const { host } = getWpConfig();
    
    const endpoint = `/wp-json/wp/v2/${taxonomyName}?per_page=100`;
    const url = resolveWPUrl(endpoint);

    try {
        const res = await fetch(url, { 
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 } 
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
            return [];
        }

        return await res.json();
    } catch (e: any) {
        console.error(`[Taxonomy Fetch Error]: ${e.message} at ${url}`);
        return [];
    }
}