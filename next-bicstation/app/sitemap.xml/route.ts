/**
 * =====================================================================
 * 🗺️ BICSTATION Sitemap 生成 (Route Handler)
 * 🛡️ Maya's Logic: Dynamic Orchestration v12.1
 * 物理パス: app/sitemap.xml/route.ts
 * 修正内容: Next.js 15のビルドエラー回避 (Dynamic Server Usage)
 * =====================================================================
 */

import { NextResponse } from 'next/server';

// ✅ 修正ポイント 1: ビルド時に静的生成を試みるのを強制停止
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://bicstation.com';
const INTERNAL_API_URL = 'http://django-v3:8000/api/posts/';

export async function GET() {
  try {
    // ✅ 修正ポイント 2: cache: 'no-store' でフェッチ時の静的最適化を回避
    const res = await fetch(`${INTERNAL_API_URL}?page_size=100&site=bicstation`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const data = await res.json();
    const posts = data.results || [];

    // ログは Docker の出力で確認可能
    console.log(`📡 [SITEMAP] Found ${posts.length} posts for bicstation`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  ${posts.map((post: any) => {
    // 日付の妥当性チェック（不正な日付で落ちないように）
    const lastMod = post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString();
    return `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
</urlset>`;

    return new NextResponse(sitemap.trim(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    console.error('❌ Sitemap Error:', e);
    // 失敗時でも最低限のXMLを返し、ビルドや検索エンジンを落とさない
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
</urlset>`, {
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}