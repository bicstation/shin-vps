/**
 * =====================================================================
 * 📝 WordPress 専用 API サービス層 (shared/lib/api/wordpress.ts)
 * ローカル(localhost:8083) / VPS(本番ドメイン) 両対応
 * =====================================================================
 */
import { getWpConfig } from './config';

/**
 * 📝 WordPress 投稿一覧取得
 * @param limit    取得件数 (per_page)
 * @param offset   オフセット
 * @param postType 省略時は siteKey から自動判別 (tiper / saving / station)
 */
export async function fetchPostList(postType?: string, limit = 12, offset = 0) {
    const { baseUrl, host, siteKey } = getWpConfig();
    
    // 1. siteKey(configから取得)に基づいてデフォルトの投稿タイプを決定
    const defaultType = siteKey === 'tiper' ? 'tiper' : 
                        siteKey === 'saving' ? 'saving' : 'station';
    
    // 引数で指定があればそれを優先、なければ siteKey から判定したデフォルトを使用
    const targetType = postType || defaultType;

    // 2. baseUrl を使用してURLを構築
    const url = `${baseUrl}/wp-json/wp/v2/${targetType}?_embed&per_page=${limit}&offset=${offset}`;

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host,           // Nginxの振り分け(b-tiper-hostなど)に必須
                'Accept': 'application/json' 
            },
            next: { revalidate: 60 },   // 1分間キャッシュ
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.error(`[WP API ERROR]: Status ${res.status} at ${url}`);
            return { results: [], count: 0 };
        }

        const data = await res.json();
        
        // WordPressはヘッダーに全件数を返してくるのでそれを取得
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
 * index.ts から呼び出されるために追加
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

        if (!res.ok) return null;
        const posts = await res.json();
        return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error(`[WP Single Post API ERROR]:`, error);
        return null;
    }
}

/**
 * 🏷️ タクソノミー（カテゴリ・タグ）取得
 * @param taxonomyName tiper_category / station_tag 等を動的に指定
 */
export async function fetchTaxonomyTerms(taxonomyName: string) {
    const { baseUrl, host } = getWpConfig();
    
    // 全件取得（最大100件）
    const url = `${baseUrl}/wp-json/wp/v2/${taxonomyName}?per_page=100`;

    try {
        const res = await fetch(url, { 
            headers: { 
                'Host': host,
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 } 
        });

        if (!res.ok) {
            console.error(`[Taxonomy API ERROR]: Status ${res.status} at ${url}`);
            return [];
        }
        return await res.json();
    } catch (e: any) {
        console.error(`[Taxonomy Fetch Error]: ${e.message} at ${url}`);
        return [];
    }
}