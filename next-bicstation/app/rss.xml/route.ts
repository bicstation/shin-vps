import { NextResponse } from 'next/server';
import { fetchWordPressPosts } from '@shared/lib/api';
import { getSiteMetadata } from '@shared/lib/siteConfig';

/**
 * 💡 RSS フィード生成 Route Handler
 * @shared/lib/api.ts の共通関数を使用して
 * WordPress から最新の投稿を取得し、XML 形式で出力します。
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1時間ごとに再生成（ISR/キャッシュ）

export async function GET() {
  const { site_prefix } = getSiteMetadata();
  const isProd = process.env.NODE_ENV === 'production';
  
  // 💡 サイト構成に基づいたベースURLの設定
  const baseUrl = isProd ? 'https://bicstation.com' : `http://localhost:8083${site_prefix}`;

  // 1. 共通API関数から投稿データを取得
  const posts = await fetchWordPressPosts(20);

  // 2. RSSアイテムの組み立て
  const feedItems = posts.map((post: any) => {
    // 投稿日時を RFC822 形式に変換
    const pubDate = new Date(post.date).toUTCString();
    // 本文または抜粋（HTMLエンティティやタグへの対策として CDATA を使用）
    const description = post.excerpt?.rendered || post.content?.rendered || '';
    
    return `
    <item>
      <title><![CDATA[${post.title?.rendered || ''}]]></title>
      <link>${baseUrl}/news/${post.slug}</link>
      <guid isPermaLink="false">${baseUrl}/news/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
  }).join('');

  // 3. 全体の XML 構造の組み立て
  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BICSTATION - 最新PCスペック解析・ニュース</title>
    <link>${baseUrl}</link>
    <description>AI解析スコアに基づいたPC製品ランキングと最新ニュースをお届けします。</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

  // 4. 正しい Content-Type を設定してレスポンスを返す
  return new NextResponse(rssFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}