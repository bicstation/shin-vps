export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { MetadataRoute } from 'next';

// --- 内部APIの設定（Dockerネットワーク内の通信） ---
const DJANGO_INTERNAL_API = 'http://django-v2:8000/api/pc-products/';
const WP_INTERNAL_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProd = process.env.NODE_ENV === 'production';
  
  // ベースURLの設定
  // 本番は bicstation.com
  // ローカルは localhost:8083/bicstation (basePathがある場合はそれを含める)
  const baseUrl = isProd ? 'https://bicstation.com' : 'http://localhost:8083/bicstation';

  console.log(`[Sitemap Generation] Started. Environment: ${process.env.NODE_ENV}`);

  // 1. 固定ルート
  // 重複を避けるためルートパスを整理
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
      cache: 'no-store', // revalidate: 0 との重複を避けるためこちらに統一
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
      console.error(`[Sitemap] Django API Response Error: ${productsRes.status}`);
    }
  } catch (e) {
    console.error("[Sitemap] Django API Connection Error:", e);
  }

  // 3. WordPress投稿データ (ブログ)
  try {
    const postsRes = await fetch(`${WP_INTERNAL_API}?per_page=100`, { 
      headers: { 'Host': 'blog.tiper.live' }, 
      cache: 'no-store',
    });

    if (postsRes.ok) {
      const posts = await postsRes.json();
      console.log(`[Sitemap] WordPress API Success: ${posts.length} posts found.`);
      
      postRoutes = posts.map((post: any) => ({
        // WordPressの投稿はドメイン直下の /slug 形式
        url: `${baseUrl}/${post.slug}`, 
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    } else {
      console.error(`[Sitemap] WordPress API Response Error: ${postsRes.status}`);
    }
  } catch (e) {
    console.error("[Sitemap] WordPress API Connection Error:", e);
  }

  console.log(`[Sitemap Generation] Completed. Total URLs: ${staticRoutes.length + productRoutes.length + postRoutes.length}`);

  // すべてを結合
  return [...staticRoutes, ...productRoutes, ...postRoutes];
}