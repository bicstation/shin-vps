/**
 * =====================================================================
 * 📝 WordPress 専用 API サービス層 (shared/lib/api/wordpress.ts)
 * 3系統（tiper / saving / station）の動的判定と安全なパースに対応
 * =====================================================================
 */
import { getWpConfig } from './config';

/**
 * 📝 WordPress 投稿一覧取得
 * @param postType 明示的に指定がない場合は config からの判定値を使用
 * @param limit    取得件数 (per_page)
 * @param offset   オフセット
 */
export async function fetchPostList(postType?: string, limit = 12, offset = 0) {
    const { baseUrl, host, siteKey } = getWpConfig();
    
    /**
     * ✅ 振り分けロジックの適用
     * config.ts で siteKey が正しく正規化されているため、
     * ここではそれに基づいた投稿タイプをデフォルトとして使用します。
     */
    const defaultType = siteKey === 'saving' ? 'saving' : 
                        siteKey === 'station' ? 'station' : 'tiper';
    
    const targetType = postType || defaultType;

    // APIエンドポイントの構築
    const url = `${baseUrl}/wp-json/wp/v2/${targetType}?_embed&per_page=${limit}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,           // Nginxの振り分けに必須
                'Accept': 'application/json' 
            },
            next: { revalidate: 60 },   // 1分間キャッシュ
            signal: AbortSignal.timeout(5000)
        });

        // ✅ 安全策: JSON以外のレスポンス（HTML等）が返ってきた場合に例外を投げないようガード
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
 * 📝 個別記事取得 (Slug指定)
 */
export async function fetchPostData(postType: string, slug: string) {
    const { baseUrl, host } = getWpConfig();
    const safeSlug = encodeURIComponent(decodeURIComponent(slug));
    const url = `${baseUrl}/wp-json/wp/v2/${postType}?slug=${safeSlug}&_embed`;

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
    const { baseUrl, host } = getWpConfig();
    const url = `${baseUrl}/wp-json/wp/v2/${taxonomyName}?per_page=100`;

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


/**
 * 💡 トップページ (page.tsx) が getSiteMainPosts という名前で
 * 関数をインポートしているための互換性レイヤー
 */
export async function getSiteMainPosts(offset = 0, limit = 5) {
    // 内部で fetchPostList を呼び出す
    return await fetchPostList(undefined, limit, offset);
}