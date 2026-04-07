/**
 * =====================================================================
 * 🗺️ Bicstation 動的サイトマップ生成 (Internal v3.3)
 * 🛡️ Docker 内部ネットワーク経由のセキュア通信
 * =====================================================================
 */
// ファイルパス: /home/maya/shin-vps/next-bicstation/app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

// 🚀 内部エンドポイント (Dockerコンテナ名:ポート)
const INTERNAL_API_URL = 'http://django-v3:8000/api/posts/';
const SITE_URL = 'https://bicstation.com';

export async function GET() {
    try {
        // 🎯 内部通信によるデータ取得
        // Hostヘッダーを渡すことで、Django側のマルチドメイン判定を正確に作動させます
        const res = await fetch(`${INTERNAL_API_URL}?page_size=100&site=bicstation`, {
            headers: { 
                'Host': 'api.bicstation.com', 
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 } // 1時間ごとに更新
        });

        if (!res.ok) throw new Error(`Django Internal Error: ${res.status}`);
        
        const data = await res.json();
        const posts = data.results || [];

        // 2. XML の組み立て
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/post</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  ${posts.map((post: any) => {
    if (!post.slug) return '';
    const lastMod = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString();
    return `
  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('')}
</urlset>`;

        return new NextResponse(sitemap.trim(), {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            },
        });

    } catch (error) {
        console.error('❌ Sitemap Generation Failed:', error);
        
        // フォールバック: 最低限の構成
        const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
</urlset>`;

        return new NextResponse(fallback, {
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}