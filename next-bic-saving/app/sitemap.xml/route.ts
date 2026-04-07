/**
 * =====================================================================
 * 🗺️ Bics-Saving 動的サイトマップ生成 (Tiper v3.1 / Next.js Route Handlers)
 * 🛡️ Django API v7.1 完全準拠版
 * =====================================================================
 */
// ファイルパス: /home/maya/shin-vps/next-bic-saving/app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

// 🌐 外部エンドポイント（SSL経由で確実に取得）
const DJANGO_API_URL = 'https://api.bic-saving.com/api/posts/';
const SITE_URL = 'https://bic-saving.com';

export async function GET() {
    try {
        // 1. Django から投稿一覧を取得
        // パラメータ説明:
        // page_size=100 : 一度に100件取得
        // site=bicstation : bicstationドメインの投稿のみに絞り込み
        const res = await fetch(`${DJANGO_API_URL}?page_size=100&site=bicsaving`, {
            headers: { 
                'Accept': 'application/json',
                'Host': 'api.bic-saving.com' 
            },
            next: { revalidate: 600 } // 1時間キャッシュ
        });

        if (!res.ok) throw new Error(`Django API Error: ${res.status}`);
        
        const data = await res.json();
        
        // Django API v7.1 の構造では、投稿リストは data.results に格納されています
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
    // スラッグが存在しない場合はスキップ
    if (!post.id) return '';
    
    // 日付処理（APIのcreated_atを使用。無ければ現在時刻）
    const lastMod = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString();
    
    return `
  <url>
    <loc>${SITE_URL}/post/${post.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('')}
</urlset>`;

        // XMLとしてレスポンスを返す
        return new NextResponse(sitemap.trim(), {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
                'X-Content-Type-Options': 'nosniff'
            },
        });

    } catch (error) {
        console.error('❌ Sitemap Generation Failed:', error);
        
        // エラー発生時のフォールバック（トップページのみの最小構成）
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
</urlset>`;

        return new NextResponse(fallbackSitemap, {
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}