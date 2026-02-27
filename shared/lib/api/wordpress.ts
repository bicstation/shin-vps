/**
 * =====================================================================
 * 📝 WordPress 専用 API サービス層 (shared/lib/api/wordpress.ts)
 * 🛡️ Maya's Logic: ドメイン一括置換・矛盾根絶・究極デバッグ版
 * =====================================================================
 */
import { getWpConfig, IS_SERVER } from './config';

/**
 * 🔄 【核心ロジック】Maya's Logic: ドメイン一括置換
 * 内部ドメインを、外部閲覧用（baseUrl）へ強制的に書き換えます。
 */
export const replaceInternalUrls = (text: string | any): any => {
    if (!text) return text;
    
    // オブジェクトが渡された場合は文字列化して置換し、戻す
    const isObject = typeof text === 'object';
    let content = isObject ? JSON.stringify(text) : text;

    const { baseUrl } = getWpConfig();
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // 置換対象リスト (Docker名, localhost, IP)
    const internalPattern = /http:\/\/(nginx-wp-v2|wordpress-gen-v2|wordpress-saving-v2|wordpress-adult-v2|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
    
    // --- 🔍 デバッグ: 置換前の検知 ---
    const matches = content.match(internalPattern);
    if (!IS_SERVER && matches) {
        console.groupCollapsed(`🔄 [Maya's Logic] 置換実行: ${matches.length}件検出`);
        console.log("検出された内部ドメイン:", Array.from(new Set(matches)));
        console.log("適用する baseUrl:", cleanBaseUrl);
    }

    // 置換実行
    content = content.replace(internalPattern, cleanBaseUrl);
    
    // スラッシュの重複をクリーンアップ (http:// 直後以外)
    content = content.replace(/([^:])\/\//g, '$1/');

    if (!IS_SERVER && matches) {
        if (content.includes('nginx-wp-v2')) {
            console.error("🚨 [置換漏れ警告]: 置換後も内部ドメインが残存しています！");
        }
        console.groupEnd();
    }

    return isObject ? JSON.parse(content) : content;
};

/**
 * 🖼️ アイキャッチ画像URL抽出 (最適化版)
 */
export const getWpFeaturedImage = (post: any, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'): string => {
    if (!post) return '/placeholder.jpg';

    let imageUrl = '';

    // 1. _embedded 経由 (最優先)
    if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        const sizes = media.media_details?.sizes;
        imageUrl = (sizes && sizes[size]) ? sizes[size].source_url : (media.source_url || '');
    } 
    // 2. fallback: featured_media_src_url (独自実装がある場合)
    else if (post.featured_media_src_url) {
        imageUrl = post.featured_media_src_url;
    }

    if (!imageUrl) return '/placeholder.jpg';

    // 💡 抽出したURLを置換（replaceInternalUrls は単体文字列にも対応）
    return replaceInternalUrls(imageUrl);
};

/**
 * 💡 接続先URLを解決するユーティリティ
 */
const resolveWPUrl = (endpoint: string) => {
    const { baseUrl } = getWpConfig();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (IS_SERVER) {
        // サーバー側 (Next.js SSR): Docker内部ネットワークパス
        const internalUrl = process.env.WORDPRESS_INTERNAL_URL || 'http://nginx-wp-v2';
        return `${internalUrl}${cleanEndpoint}`;
    }
    // クライアント側 (Browser): 外部アクセス用パス
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * 📝 投稿一覧取得
 */
export async function fetchPostList(postType: string = 'post', limit = 12, offset = 0) {
    const { host } = getWpConfig();
    const typeEndpoint = postType === 'post' ? 'posts' : postType;
    const url = resolveWPUrl(`/wp-json/wp/v2/${typeEndpoint}?_embed&per_page=${limit}&offset=${offset}`);

    if (!IS_SERVER) {
        console.group(`📡 [WP-FETCH] 一覧取得: ${postType}`);
        console.log(`Fetch URL: ${url}`);
    }

    try {
        const res = await fetch(url, {
            headers: { 
                'Host': host, 
                'Accept': 'application/json' 
            },
            cache: 'no-store', // 強制最新取得
            next: { revalidate: 0 }
        });

        if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);

        const data = await res.json();
        const totalCount = parseInt(res.headers.get('X-WP-Total') || '0', 10);

        // --- 核心: オブジェクト全体を一括置換 ---
        const processedData = replaceInternalUrls(data);

        if (!IS_SERVER) {
            console.log(`✅ 取得完了: ${processedData.length}件 (Total: ${totalCount})`);
            console.groupEnd();
        }

        return { 
            results: Array.isArray(processedData) ? processedData : [], 
            count: totalCount 
        };
    } catch (e: any) {
        console.error(`🚨 [FetchPostList Error]`, e);
        if (!IS_SERVER) console.groupEnd();
        return { results: [], count: 0 };
    }
}

/**
 * 💡 サイト統合投稿取得
 */
export async function getSiteMainPosts(offset = 0, limit = 12) {
    const { siteKey } = getWpConfig();
    const postRes = await fetchPostList('post', limit, offset);
    
    let specificType = '';
    if (siteKey === 'tiper') specificType = 'tiper';
    else if (siteKey === 'station') specificType = 'station';
    else if (siteKey === 'avflash') specificType = 'avflash';
    else if (siteKey === 'saving') specificType = 'saving';

    let specificRes = { results: [], count: 0 };
    if (specificType && specificType !== 'post') {
        specificRes = await fetchPostList(specificType, limit, offset);
    }

    const combined = [...postRes.results, ...specificRes.results].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { results: combined.slice(0, limit), count: postRes.count + specificRes.count };
}

/**
 * 📝 個別記事取得
 */
export async function fetchPostData(postType: string = 'post', identifier: string) {
    const { host } = getWpConfig();
    const typeEndpoint = postType === 'post' ? 'posts' : postType;
    const isId = /^\d+$/.test(identifier);
    const query = isId ? `/${identifier}?_embed` : `?slug=${encodeURIComponent(identifier)}&_embed`;
    const url = resolveWPUrl(`/wp-json/wp/v2/${typeEndpoint}${query}`);

    if (!IS_SERVER) console.group(`📄 [WP-FETCH] 個別記事: ${identifier}`);

    try {
        const res = await fetch(url, {
            headers: { 'Host': host, 'Accept': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const data = await res.json();
        
        // --- 核心: 個別データも一括置換 ---
        const processedPost = replaceInternalUrls(data);
        const post = Array.isArray(processedPost) ? (processedPost.length > 0 ? processedPost[0] : null) : processedPost;

        if (!IS_SERVER && post) {
            console.log("記事データ置換完了");
            console.groupEnd();
        }
        
        return post;
    } catch (error) {
        console.error("🚨 [FetchPostData Error]", error);
        if (!IS_SERVER) console.groupEnd();
        return null;
    }
}

/**
 * 🏷️ タクソノミー取得
 */
export async function fetchTaxonomyTerms(taxonomyName: string) {
    const { host } = getWpConfig();
    const url = resolveWPUrl(`/wp-json/wp/v2/${taxonomyName}?per_page=100`);
    try {
        const res = await fetch(url, { headers: { 'Host': host }, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        
        return replaceInternalUrls(data);
    } catch (e) {
        return [];
    }
}