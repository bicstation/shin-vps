/**
 * =====================================================================
 * 🏆 BICSTATION RSS フィード生成 (Route Handler)
 * 🛡️ Maya's Logic: 物理構造 v12.1 (Final Sync)
 * 物理パス: app/rss.xml/route.ts
 * 修正内容: インポートパスを django/posts に統一 & siteConfig 関数の実行
 * =====================================================================
 */

import { NextResponse } from 'next/server';

// ✅ 修正ポイント 1: siteConfig.ts の export default getSiteMetadata に対応
import getSiteMetadata from '@/shared/lib/utils/siteConfig';

// ✅ 修正ポイント 2: grep結果に基づき、正しい物理パスを指定
// インポートエラーを防ぐため、wordpress ではなく posts から取得
import { fetchPostList } from '@/shared/lib/api/django/posts';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1時間ごとにキャッシュ更新

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  
  // 💡 siteConfig (getSiteMetadata) から動的にサイト情報を取得
  const config = getSiteMetadata();
  
  // サイトのベースURLを確定 (config.url がない場合のフォールバック)
  const baseUrl = isProd ? (config.url || 'https://api.bicstation.com') : `http://localhost:8083`;

  /**
   * 🚀 Django API から最新記事を取得
   * エンドポイント 'posts' から最新 20 件を取得。空レスポンスに対するガードを追加。
   */
  const wpDataResponse = await fetchPostList(20, 0, 'bicstation').catch(() => ({ results: [], count: 0 }));
  const posts = wpDataResponse?.results || [];

  // 1. RSSアイテムの組み立て
  const feedItems = Array.isArray(posts) ? posts.map((post: any) => {
    // 投稿日時を RFC822 形式に変換
    const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
    
    // スラッグに基づく URL 生成
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    
    // 内容の抽出 (安全のためオプショナルチェイニングを使用)
    const title = post.title?.rendered || 'Untitled';
    const description = post.excerpt?.rendered || '';
    
    return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
  }).join('') : '';

  // 2. 全体の XML 構造の組み立て
  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.name || 'BICSTATION'} - 最新PCスペック解析・ニュース</title>
    <link>${baseUrl}</link>
    <description>${config.description || ''}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

  // 3. 正しい Content-Type と Cache-Control を設定してレスポンスを返す
  return new NextResponse(rssFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}