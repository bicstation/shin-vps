export const dynamic = 'force-dynamic';
import { MetadataRoute } from 'next';

// 内部ネットワークのAPIエンドポイント
const DJANGO_API = 'http://django-v2:8000/api/pc-products/';
const WP_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tiper.live';

  // 1. 固定・ベースルート
  // 修正: これまでの流れに合わせて、メインの固定ページを網羅
  const staticRoutes: MetadataRoute.Sitemap = ['', '/bicstation'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  // 2. Djangoの商品詳細ページ (カタログ)
  try {
    // 💡 修正ポイント: サイトマップ用には全件取得（limitを指定）するか、
    // ページネーションを回す必要がありますが、ここでは多めに取得する設定にします
    const productsRes = await fetch(`${DJANGO_API}?limit=500`, { 
      next: { revalidate: 0 } 
    });

    if (productsRes.ok) {
      const productsData = await productsRes.json();
      productRoutes = productsData.results.map((p: any) => ({
        url: `${baseUrl}/product/${p.unique_id}`, // 商品詳細のURL構造に合わせる
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: Django API error", e);
  }

  // 3. WordPressの投稿ページ (お知らせ・レビュー)
  try {
    // 💡 修正ポイント: 全投稿をカバーするため多めに取得 (per_page=100)
    const postsRes = await fetch(`${WP_API}?per_page=100`, { 
      headers: { 'Host': 'stg.blog.tiper.live' },
      next: { revalidate: 0 } 
    });

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      postRoutes = postsData.map((post: any) => ({
        // 💡 修正: PostPage.tsx で Link href="/bicstation/${post.slug}" となっていたので、ここも合わせます
        url: `${baseUrl}/bicstation/${post.slug}`, 
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error("Sitemap: WordPress API error", e);
  }

  // すべてを結合して返却
  return [...staticRoutes, ...productRoutes, ...postRoutes];
}