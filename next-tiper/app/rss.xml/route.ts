export const dynamic = 'force-dynamic';

import { getUnifiedProducts } from '@shared/lib/api/django/adult';
import { fetchPostList } from '@shared/lib/api/django-bridge.ts';

// 💡 ソース名を名寄せして統一するヘルパー
const getNormalizedSource = (apiSource: string): string => {
  const s = (apiSource || '').toLowerCase();
  if (s.includes('dmm')) return 'DMM';
  if (s.includes('fanza')) return 'FANZA';
  if (s.includes('duga')) return 'DUGA';
  return apiSource.toUpperCase();
};

export async function GET() {
  const baseURL = 'https://tiper.live';
  const feedURL = `${baseURL}/rss.xml`;

  try {
    // 1. 最新データの取得 (動画20件 + 記事10件)
    const [productsData, postsData] = await Promise.all([
      getUnifiedProducts({ limit: 20, ordering: '-created_at' }).catch(() => ({ results: [] })),
      fetchPostList('post', 10).catch(() => ({ results: [] })),
    ]);

    const items: string[] = [];

    // 2. 動画データをRSSアイテムに変換
    (productsData?.results || []).forEach((product: any) => {
      // 💡 サイトマップのロジックと完全に同期
      const finalId = product.display_id || product.product_id_unique;
      const displaySource = getNormalizedSource(product.api_source);
      
      if (finalId) {
        // 💡 URL形式をサイトマップと統一: /adults/DISPLAY_ID?source=SOURCE
        const productUrl = `${baseURL}/adults/${finalId}?source=${displaySource}`;
        const pubDate = new Date(product.updated_at || product.created_at || new Date()).toUTCString();
        
        items.push(`
      <item>
        <title><![CDATA[${product.title}]]></title>
        <link>${productUrl}</link>
        <guid isPermaLink="true">${productUrl}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${product.ai_summary || product.title}]]></description>
      </item>`);
      }
    });

    // 3. マガジン記事をRSSアイテムに変換
    (postsData?.results || []).forEach((post: any) => {
      const postUrl = `${baseURL}/blog/${post.slug}`;
      const pubDate = new Date(post.date || new Date()).toUTCString();
      
      items.push(`
      <item>
        <title><![CDATA[${post.title?.rendered || post.title}]]></title>
        <link>${postUrl}</link>
        <guid isPermaLink="true">${postUrl}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${post.excerpt?.rendered || ''}]]></description>
      </item>`);
    });

    // 4. RSS全体の組み立て
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tiper.live - 最新動画・マガジン</title>
    <link>${baseURL}</link>
    <description>最新の動画情報とマガジン記事をお届けします。</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedURL}" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

    return new Response(rss.trim(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      },
    });

  } catch (error) {
    console.error("RSS generation failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}