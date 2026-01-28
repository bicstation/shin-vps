import { NextResponse } from 'next/server';

/**
 * 💡 Next.js 13/14/15 App Router用 Route Handler
 * basePath設定がある場合でも、このエンドポイントが直接XMLを生成します。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DJANGO_INTERNAL_API = 'http://django-v2:8000/api/pc-products/';
const WP_INTERNAL_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts';

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  
  // 💡 basePath利用時、locタグに含めるURLは「ブラウザから見える完全なURL」にする必要があります
  const baseUrl = isProd ? 'https://bicstation.com' : 'http://localhost:8083/bicstation';

  console.log(`[Sitemap XML] Start generation. BaseURL for loc tags: ${baseUrl}`);

  let productUrls = '';
  let postUrls = '';

  // 1. Django商品データ取得 (PC製品)
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
      console.log(`[Sitemap XML] Django Success: ${items.length} items`);
    } else {
      console.error(`[Sitemap XML] Django API returned status ${res.status}`);
    }
  } catch (e) {
    console.error("[Sitemap XML] Django Connection Error", e);
  }

  // 2. WordPress投稿データ取得 (ブログ)
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
      console.log(`[Sitemap XML] WordPress Success: ${posts.length} posts`);
    }
  } catch (e) {
    console.error("[Sitemap XML] WordPress Connection Error", e);
  }

  // 3. XML文字列の組み立て
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${productUrls}${postUrls}
</urlset>`;

  // 4. XMLとしてレスポンスを返す
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}