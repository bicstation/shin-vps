export const dynamic = 'force-dynamic';
import { MetadataRoute } from 'next';

// --- 内部APIの設定（Dockerコンテナ間通信） ---
const DJANGO_INTERNAL_API = 'http://django-v2:8000/api/pc-products/';
const WP_INTERNAL_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProd = process.env.NODE_ENV === 'production';
  
  // ベースURLの決定
  // 本番: bicstation.com / ローカル: localhost:8083/bicstation
  const baseUrl = isProd ? 'https://bicstation.com' : 'http://localhost:8083/bicstation';

  // 1. 固定ルート
  const staticRoutes: MetadataRoute.Sitemap = ['', '/'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  // 2. Django商品データ
  try {
    const productsRes = await fetch(`${DJANGO_INTERNAL_API}?limit=500`, { 
      next: { revalidate: 0 } 
    });
    if (productsRes.ok) {
      const data = await productsRes.json();
      const items = data.results || [];
      productRoutes = items.map((p: any) => ({
        url: `${baseUrl}/product/${p.unique_id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: Django API Error", e);
  }

  // 3. WordPress投稿データ
  try {
    const postsRes = await fetch(`${WP_INTERNAL_API}?per_page=100`, { 
      // WordPress側が認識するドメインを指定
      headers: { 'Host': 'blog.tiper.live' }, 
      next: { revalidate: 0 } 
    });
    if (postsRes.ok) {
      const posts = await postsRes.json();
      postRoutes = posts.map((post: any) => ({
        // WordPressの投稿は /bicstation/slug 形式とのことなので
        url: `${baseUrl}/${post.slug}`, 
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error("Sitemap: WP API Error", e);
  }

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}