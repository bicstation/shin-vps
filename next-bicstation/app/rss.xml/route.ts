/**
 * =====================================================================
 * 🏆 BICSTATION RSS フィード生成 (Route Handler)
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * 物理パス: app/rss.xml/route.ts
 * 修正内容: WordPress 依存を排除し Django Bridge & 正しい siteConfig パスを適用
 * =====================================================================
 */

import { NextResponse } from 'next/server';

// ✅ 修正ポイント 1: 物理構造 shared/lib/utils/siteConfig.ts に合わせる
import { siteConfig } from '@/shared/lib/utils/siteConfig';

// ✅ 修正ポイント 2: WordPress を廃止し、Django Bridge からコンテンツを取得
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1時間ごとにキャッシュ更新

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  
  // 💡 サイト構成に基づいたベースURLの設定 (siteConfig から取得)
  const baseUrl = isProd ? siteConfig.url : `http://localhost:8083`;

  // 1. Django Bridge から最新の「お知らせ/レポート」データを取得 (最大20件)
  // fetchDjangoBridgeContent は内部で Django API を叩く共通関数
  const posts = await fetchDjangoBridgeContent('latest_news', 20).catch(() => []);

  // 2. RSSアイテムの組み立て
  const feedItems = Array.isArray(posts) ? posts.map((post: any) => {
    // 投稿日時を RFC822 形式に変換 (Django からの ISO 文字列を変換)
    const pubDate = post.created_at ? new Date(post.created_at).toUTCString() : new Date().toUTCString();
    
    // スラッグまたは ID に基づく URL 生成
    const postSlug = post.slug || post.id;
    const postUrl = `${baseUrl}/news/${postSlug}`;
    
    // 内容の抽出 (CDATA で HTML 特殊文字を保護)
    const description = post.excerpt || post.content || '';
    
    return `
    <item>
      <title><![CDATA[${post.title || ''}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
  }).join('') : '';

  // 3. 全体の XML 構造の組み立て (siteConfig の値を使用)
  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} - 最新PCスペック解析・ニュース</title>
    <link>${baseUrl}</link>
    <description>${siteConfig.description}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

  // 4. 正しい Content-Type と Cache-Control を設定してレスポンスを返す
  return new NextResponse(rssFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}