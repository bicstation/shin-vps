export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const WP_API = 'http://nginx-wp-v2/wp-json/wp/v2/posts?_embed';

export async function GET() {
  const res = await fetch(WP_API, { headers: { 'Host': 'stg.blog.tiper.live' } });
  const posts = await res.json();

  const baseUrl = 'https://tiper.live';

  // RSSのXMLを組み立て
  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>BICSTATION - 最新PC情報</title>
        <link>${baseUrl}</link>
        <description>Lenovo PCの最新スペックとニュースをお届けします</description>
        <language>ja</language>
        ${posts.map((post: any) => `
          <item>
            <title><![CDATA[${post.title.rendered}]]></title>
            <link>${baseUrl}/news/${post.slug}</link>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <guid>${baseUrl}/news/${post.slug}</guid>
            <description><![CDATA[${post.excerpt?.rendered || ''}]]></description>
          </item>
        `).join('')}
      </channel>
    </rss>`;

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}