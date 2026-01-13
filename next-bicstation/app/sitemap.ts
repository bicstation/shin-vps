import { MetadataRoute } from 'next';

/**
 * 💡 キャッシュの完全無効化設定
 * force-dynamic: 常に動的レンダリングを強制
 * revalidate = 0: 1秒たりともキャッシュせず、リクエストごとにAPIを叩く
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- 内部APIの設定（Dockerネットワーク内の通信） ---
const DJANGO_INTERNAL_API = 'http://django-v2:8000/api/pc-products/';
const WP_INTERNAL_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProd = process.env.NODE_ENV === 'production';
  
  /**
   * ベースURLの決定
   * 本番: https://bicstation.com
   * ローカル: http://localhost:8083/bicstation
   */
  const baseUrl = isProd 
    ? 'https://bicstation.com' 
    : 'http://localhost:8083/bicstation';

  console.log(`[Sitemap] Generation started. BaseURL: ${baseUrl}`);

  // 1. 固定ルート
  const staticRoutes: MetadataRoute.Sitemap = ['', '/'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  // 2. Django商品データ (PC製品)
  try {
    const productsRes = await fetch(`${DJANGO_INTERNAL_API}?limit=500`, { 
      cache: 'no-store' // Next.jsのData Cacheを使用せず、毎回Djangoから取得
    });

    if (productsRes.ok) {
      const data = await productsRes.json();
      const items = data.results || [];
      console.log(`[Sitemap] Django API Success: ${items.length} items found.`);
      
      productRoutes = items.map((p: any) => ({
        url: `${baseUrl}/product/${p.unique_id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } else {
      console.error(`[Sitemap] Django API Error: Status ${productsRes.status}`);
    }
  } catch (e) {
    console.error("[Sitemap] Django Connection Error:", e);
  }

  // 3. WordPress投稿データ (ブログ)
  try {
    const postsRes = await fetch(`${WP_INTERNAL_API}?per_page=100`, { 
      headers: { 'Host': 'blog.tiper.live' }, 
      cache: 'no-store' // WordPressからも最新情報を取得
    });

    if (postsRes.ok) {
      const posts = await postsRes.json();
      console.log(`[Sitemap] WordPress API Success: ${posts.length} posts found.`);
      
      postRoutes = posts.map((post: any) => ({
        /**
         * ブログ記事のURL構造
         * 本番環境では bicstation.com 直下 (/slug) 形式
         * ローカル環境では baseUrl (/bicstation) に基づき生成
         */
        url: `${baseUrl}/${post.slug}`, 
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    } else {
      console.error(`[Sitemap] WordPress API Error: Status ${postsRes.status}`);
    }
  } catch (e) {
    console.error("[Sitemap] WordPress Connection Error:", e);
  }

  const allRoutes = [...staticRoutes, ...productRoutes, ...postRoutes];
  console.log(`[Sitemap] Generation complete. Total URLs: ${allRoutes.length}`);

  return allRoutes;
}