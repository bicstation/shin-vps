/**
 * =====================================================================
 * 📝 WordPress 専用 API サービス層 (shared/lib/api/wordpress.ts)
 * 複数投稿タイプ（post + 固有タイプ）のマージと日付順ソートに対応
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from './config';

/**
 * 💡 接続先URLを解決するユーティリティ
 * サーバーサイド実行時は Docker 内部ネットワーク (nginx-wp-v2) を使用し、
 * クライアントサイド実行時は設定された外部 URL (baseUrl) を使用します。
 */
const resolveWPUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    
    if (IS_SERVER) {
        // 💡 サーバーサイド (Server Components) からのリクエストは 
        // 外部用ドメインではなく Docker コンテナ名:内部ポート(80) を直接叩く
        return `http://nginx-wp-v2:80${endpoint}`;
    }
    
    // クライアントサイド（ブラウザ）では本来の URL を使用
    return `${baseUrl}${endpoint}`;
};

/**
 * 📝 WordPress 投稿一覧取得 (単一タイプ用)
 * @param postType 取得したい投稿タイプ (posts / tiper / avflash 等)
 * @param limit    取得件数 (per_page)
 * @param offset   オフセット
 */
export async function fetchPostList(postType: string, limit = 12, offset = 0) {
    const { host } = getWpConfig();
    
    // WordPress標準の「投稿」はエンドポイントが 'posts' になるための処理
    const typeEndpoint = postType === 'post' ? 'posts' : postType;
    
    // APIエンドポイントの構築
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

        // ✅ 安全策: JSON以外のレスポンス（HTML等）が返ってきた場合に警告を出す
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
            console.warn(`[WP API WARNING]: Invalid response from ${url}. Status: ${res.status}, Type: ${contentType}`);
            return { results: [], count: 0 };
        }

        const data = await res.json();
        
        // WordPressはヘッダーに全件数を返してくるため取得を試みる
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
 * tiper-host -> [post, tiper] をマージ
 * avflash-host -> [post, avflash] をマージ
 * station / saving -> [post, 各固有種] をマージ
 */
export async function getSiteMainPosts(offset = 0, limit = 5) {
    const { siteKey } = getWpConfig();

    // 1. まず共通の「標準投稿 (post)」を取得
    const postRes = await fetchPostList('post', limit, offset);
    
    // 2. サイト固有の投稿タイプを決定
    let specificType = '';
    if (siteKey === 'tiper') specificType = 'tiper';
    else if (siteKey === 'avflash') specificType = 'avflash';
    else if (siteKey === 'station') specificType = 'station';
    else if (siteKey === 'saving') specificType = 'saving';

    // 3. 固有タイプが存在すれば、それも取得
    let specificRes = { results: [], count: 0 };
    if (specificType) {
        specificRes = await fetchPostList(specificType, limit, offset);
    }

    // 4. 取得した2つのリストを合体させる
    const combined = [...postRes.results, ...specificRes.results];

    // 5. 日付 (date) を基準に降順 (新しい順) でソート
    const sortedResults = combined.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 6. 合体・ソートした結果から、必要な件数 (limit) 分だけ切り出す
    return {
        results: sortedResults.slice(0, limit),
        count: postRes.count + specificRes.count
    };
}

/**
 * 📝 個別記事取得 (Slug指定)
 * @param postType 投稿タイプ (post / tiper / avflash 等)
 * @param slug 記事のスラッグ
 */
export async function fetchPostData(postType: string, slug: string) {
    const { host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    
    // 個別ページでも 'post' を 'posts' エンドポイントに変換
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
            console.warn(`[WP Single Post API ERROR]: Non-JSON response at ${url}`);
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
 * @param taxonomyName tiper_category / station_tag 等
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