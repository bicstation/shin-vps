/**
 * =====================================================================
 * 🗺️ Bicstation 動的サイトマップ生成 (Tiper v3 互換方式)
 * =====================================================================
 */
import { NextResponse } from 'next/server';

// Django v3 の内部エンドポイント
const WP_INTERNAL_API = 'http://django-v3:8000/api/wp-json/wp/v2/bicstation';
const SITE_URL = 'https://bicstation.com';

export async function GET() {
    try {
        // 1. Django から投稿一覧を取得 (Hostヘッダーが重要！)
        const res = await fetch(`${WP_INTERNAL_API}?per_page=100&_fields=slug,modified`, {
            headers: { 'Host': 'bicstation.com' },
            next: { revalidate: 3600 } // 1時間キャッシュ
        });

        if (!res.ok) throw new Error(`Django API Error: ${res.status}`);
        const posts = await res.json();

        // 2. XML の組み立て
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  ${posts.map((post: any) => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('❌ Sitemap Generation Failed:', error);
        // エラー時は最小限のサイトマップを返す
        return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc></url></urlset>`, {
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}