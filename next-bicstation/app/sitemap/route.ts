import { NextResponse } from 'next/server';
import { fetchPCProducts, fetchPostList } from '@shared/components/lib/api';
import { getSiteMetadata } from '@shared/components/lib/siteConfig';

/**
 * 💡 Next.js App Router用 Sitemap生成 Route Handler
 * 共通 API 層を利用して Django 商品データと WordPress 投稿データを統合します。
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const isProd = process.env.NODE_ENV === 'production';
    const { site_prefix } = getSiteMetadata();
    
    // 💡 basePath利用時、locタグに含めるURLは「ブラウザから見える完全なURL」にする
    // site_prefix が '/bicstation' の場合、開発環境では localhost:8083/bicstation となるよう調整
    const baseUrl = isProd 
        ? 'https://bicstation.com' 
        : `http://localhost:8083${site_prefix}`;

    console.log(`[Sitemap XML] Start generation. BaseURL: ${baseUrl}`);

    let productUrls = '';
    let postUrls = '';

    // --- 1. Django商品データ取得 (PC製品) ---
    try {
        // 大量のデータを取得するため limit を 500 に設定
        const pcData = await fetchPCProducts('', 0, 500);
        const items = pcData.results || [];
        
        productUrls = items.map((p: any) => `
  <url>
    <loc>${baseUrl}/product/${p.unique_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
        
        console.log(`[Sitemap XML] Django Success: ${items.length} items fetched.`);
    } catch (e) {
        console.error("[Sitemap XML] Django Fetch Error:", e);
    }

    // --- 2. WordPress投稿データ取得 (ブログ記事) ---
    try {
        // RSSやサイトマップ用にデフォルトの 'posts' エンドポイントから取得
        // fetchPostList は api.ts 内で Host ヘッダー等の複雑な設定を隠蔽済み
        const wpData = await fetchPostList('posts', 100);
        const posts = wpData.results || [];
        
        postUrls = posts.map((post: any) => {
            const lastMod = new Date(post.modified || post.date).toISOString();
            return `
  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }).join('');
        
        console.log(`[Sitemap XML] WordPress Success: ${posts.length} posts fetched.`);
    } catch (e) {
        console.error("[Sitemap XML] WordPress Fetch Error:", e);
    }

    // --- 3. XML文字列の組み立て ---
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pc-products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ranking</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${productUrls}${postUrls}
</urlset>`;

    // --- 4. XMLレスポンスの返却 ---
    return new NextResponse(xml.trim(), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}