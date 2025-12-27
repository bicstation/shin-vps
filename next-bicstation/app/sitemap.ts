export const dynamic = 'force-dynamic';
import { MetadataRoute } from 'next';

// APIのURL
const DJANGO_API = 'http://django-v2:8000/api/pc-products/';
const WP_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tiper.live';

  // 1. 固定ページ
  const routes: MetadataRoute.Sitemap = ['', '/bicstation'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  // 2. Djangoの商品データ取得 (try-catchでエラーを回避)
  try {
    const productsRes = await fetch(DJANGO_API, { next: { revalidate: 0 } });
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      productRoutes = productsData.results.map((p: any) => ({
        url: `${baseUrl}/product/${p.unique_id}`,
        lastModified: new Date(),
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.warn("Sitemap: Django API fetch failed during build. Skipping product routes.");
  }

  // 3. WordPressの投稿データ取得 (try-catchでエラーを回避)
  try {
    const postsRes = await fetch(WP_API, { 
      headers: { 'Host': 'stg.blog.tiper.live' },
      next: { revalidate: 0 } 
    });
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      postRoutes = postsData.map((post: any) => ({
        url: `${baseUrl}/news/${post.slug}`,
        lastModified: new Date(post.modified || new Date()),
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.warn("Sitemap: WordPress API fetch failed during build. Skipping post routes.");
  }

  return [...routes, ...productRoutes, ...postRoutes];
}