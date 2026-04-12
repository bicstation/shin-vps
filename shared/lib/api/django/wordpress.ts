// /home/maya/shin-vps/shared/lib/api/django/wordpress.ts

export async function fetchWPTechInsights(limit = 6) {
  const WP_URL = "https://wp552476.wpx.jp/wp-json/wp/v2/posts";
  
  try {
    // _embed を付与して画像やカテゴリ情報も一括取得
    const res = await fetch(`${WP_URL}?per_page=${limit}&_embed`, {
      next: { revalidate: 3600 } // 1時間キャッシュ（ISR）
    });
    
    if (!res.ok) throw new Error('WP Fetch Failed');
    
    const posts = await res.json();
    
    // Bic Stationの UnifiedProductCard 等で使える形にマッピング
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      link: post.link,
      date: post.date,
      // 埋め込み画像があれば取得、なければデフォルト
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/ogp-default.jpg',
      category: 'TECH_INSIGHT' 
    }));
  } catch (error) {
    console.error("🛰️ [WP_BRIDGE_ERROR]:", error);
    return [];
  }
}