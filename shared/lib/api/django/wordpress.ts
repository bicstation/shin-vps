/**
 * =====================================================================
 * 🛰️ BICSTATION WordPress Intelligence Bridge (v14.5.0-Final-Fixed)
 * 🛡️ Role: External Data Normalization & Cyber-Standard Mapping
 * ---------------------------------------------------------------------
 * 【修正内容】
 * UnifiedProductCard が ID をリンクに使用するケースに対応するため、
 * id プロパティにも slug を強制注入し、wp-200 形式のリンクを根絶。
 * =====================================================================
 */

// @ts-nocheck

/** 🖼️ WordPressのアイキャッチ画像抽出 */
export function getWpFeaturedImage(post: any, size = 'large') {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        return media.media_details?.sizes?.[size]?.source_url || media.source_url;
    }
    return null;
}

/** 📡 [一覧取得] WordPressから最新記事をスキャン & 正規化 */
export async function fetchWPTechInsights(
    limit = 12, 
    endpoint = "https://legacy.nabejuku.com/wp-json/wp/v2/posts"
) {
    try {
        const res = await fetch(`${endpoint}?per_page=${limit}&_embed`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 } 
        });
        
        if (!res.ok) throw new Error(`🛰️ [FETCH_FAILED] Status: ${res.status}`);
        
        const posts = await res.json();
        if (!Array.isArray(posts)) return [];

        return posts.map((post: any) => {
            let featuredImage = getWpFeaturedImage(post, 'large');
            if (featuredImage) {
                featuredImage = featuredImage.replace(/([^:])\/\//g, '$1/');
            }

            return {
                // 🛠️ 【最重要】id に post.id (数字) を使うとリンクが /news/wp-200 になるため
                // 明示的に post.slug を設定してリンク事故を防ぐ
                id: post.slug, 
                wp_id: `wp-${post.id}`, // 管理用IDが必要な場合は別名で保持
                title: post.title?.rendered || 'UNTITLED_NODE',
                excerpt: post.excerpt?.rendered 
                    ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...'
                    : '',
                
                // 🔗 内部スラッグとリンクの定義
                slug: post.slug,
                link: `/news/${post.slug}`, 
                
                date: post.date,
                image: featuredImage || '/images/common/no-image.jpg',
                category: 'TECH_INSIGHT',
                source: 'wordpress',
                site: 'bicstation' 
            };
        });

    } catch (error) {
        console.error("🚨 [WP_BRIDGE_ERROR]:", error);
        return []; 
    }
}

/** 🔍 [個別取得] スラッグ指定で記事詳細を取得 */
export async function fetchWPPostBySlug(slug: string) {
    const WP_URL = "https://legacy.nabejuku.com/wp-json/wp/v2/posts";
    try {
        const decodedSlug = decodeURIComponent(slug);
        const res = await fetch(`${WP_URL}?slug=${decodedSlug}&_embed`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;
        const posts = await res.json();
        return (Array.isArray(posts) && posts.length > 0) ? posts[0] : null;

    } catch (error) {
        console.error(`🚨 [WP_DETAIL_FETCH_ERROR] Slug: ${slug}`, error);
        return null;
    }
}

export const fetchExternalTechNews = fetchWPTechInsights;