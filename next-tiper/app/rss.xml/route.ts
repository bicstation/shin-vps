import { getAdultProducts } from '../../lib/api';

export async function GET() {
  const baseURL = 'https://tiper.live/tiper';
  const products = await getAdultProducts(); // 最新の商品を取得

  const items = (products?.results || [])
    .map((product: any) => `
      <item>
        <title><![CDATA[${product.title}]]></title>
        <link>${baseURL}/adults/${product.id}</link>
        <description><![CDATA[${product.maker?.name || ''} - ${product.title}]]></description>
        <pubDate>${new Date(product.release_date).toUTCString()}</pubDate>
        <guid isPermaLink="false">${product.id}</guid>
      </item>
    `)
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Tiper - 最新アダルト商品情報</title>
        <link>${baseURL}</link>
        <description>最新の商品入荷情報をお届けします</description>
        <language>ja</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}