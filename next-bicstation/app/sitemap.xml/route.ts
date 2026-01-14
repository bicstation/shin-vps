import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DJANGO_INTERNAL_API = 'http://django-v2:8000/api/pc-products/';
const WP_INTERNAL_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const baseUrl = isProd ? 'https://bicstation.com' : 'http://localhost:8083/bicstation';

  console.log(`[Sitemap XML] Generating... BaseURL: ${baseUrl}`);

  let productUrls = '';
  let postUrls = '';

  // 1. Django商品データ取得
  try {
    const res = await fetch(`${DJANGO_INTERNAL_API}?limit=500`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const items = data.results || [];
      productUrls = items.map((p: any) => `
  <url>
    <loc>${baseUrl}/product/${p.unique_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
      console.log(`[Sitemap XML] Django items: ${items.length}`);
    }
  } catch (e) {
    console.error("[Sitemap XML] Django Fetch Error", e);
  }

  // 2. WordPress投稿データ取得
  try {
    const res = await fetch(`${WP_INTERNAL_API}?per_page=100`, { 
      headers: { 'Host': 'blog.tiper.live' },
      cache: 'no-store' 
    });
    if (res.ok) {
      const posts = await res.json();
      postUrls = posts.map((post: any) => `
  <url>
    <loc>${baseUrl}/${post.slug}</loc>
    <lastmod>${new Date(post.modified || post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');
      console.log(`[Sitemap XML] WP posts: ${posts.length}`);
    }
  } catch (e) {
    console.error("[Sitemap XML] WP Fetch Error", e);
  }

  // 3. XMLの組み立て
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${productUrls}${postUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}