import { NextResponse } from 'next/server';

const SITE_URL = 'https://bic-saving.com';
const INTERNAL_API_URL = 'http://django-v3:8000/api/posts/';

export async function GET() {
  try {
    // 【重要】 { cache: 'no-store' } を追加してキャッシュを強制無効化
    const res = await fetch(`${INTERNAL_API_URL}?page_size=100&site=saving`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const data = await res.json();
    const posts = data.results || [];

    // デバッグ用ログ（docker logs で確認できます）
    console.log(`Sitemap Debug: Found ${posts.length} posts for saving`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${SITE_URL}/</loc>
        <priority>1.0</priority>
      </url>
      ${posts.map((post: any) => `
        <url>
          <loc>${SITE_URL}/post/${post.id}</loc>
          <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
        </url>
      `).join('')}
    </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        // ブラウザキャッシュもさせない設定
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (e) {
    console.error('❌ Sitemap Error:', e);
    // 失敗しても最低限トップページだけは出す
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
    </urlset>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}