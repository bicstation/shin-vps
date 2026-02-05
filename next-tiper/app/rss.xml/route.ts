/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ 修正ポイント: shared/lib/api から共通のフェッチ関数をインポート
import { getAdultProducts } from '@shared/lib/api';

/**
 * 💡 RSSフィード生成ロジック
 * Route Handlers を使用して XML を動的に返します。
 */
export async function GET() {
  const baseURL = 'https://tiper.live/tiper';
  
  // 💡 最新の動画データを取得
  // shared/lib/api 内で定義された型やオプションを利用します
  const data = await getAdultProducts({ 
    limit: 50, 
    ordering: '-created_at' 
  }).catch((err) => {
    console.error("❌ RSS Generation Error:", err);
    return { results: [] };
  });
  
  const products = data?.results || [];

  const items = products
    .map((product: any) => {
      // 日付のバリデーション（不正な日付によるエラー防止）
      const pubDate = product.release_date 
        ? new Date(product.release_date).toUTCString() 
        : new Date().toUTCString();

      // サムネイル画像の取得（最初の1枚）
      const thumbnail = product.image_url_list?.[0] || '';

      // RSS項目の組み立て（CDAATAセクションを使用して特殊文字を保護）
      return `
      <item>
        <title><![CDATA[${product.title}]]></title>
        <link>${baseURL}/adults/${product.id}</link>
        <description><![CDATA[
          ${thumbnail ? `<img src="${thumbnail}" style="max-width:300px;display:block;margin-bottom:10px;" /><br/>` : ''}
          メーカー: ${product.maker?.name || '---'}<br/>
          出演者: ${product.actresses?.map((a: any) => a.name).join(', ') || '---'}
        ]]></description>
        ${thumbnail ? `<enclosure url="${thumbnail}" length="0" type="image/jpeg" />` : ''}
        <pubDate>${pubDate}</pubDate>
        <guid isPermaLink="false">${product.id}</guid>
        <category><![CDATA[アダルト動画]]></category>
      </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/"
>
  <channel>
    <title>Tiper - 最新動画情報アーカイブ</title>
    <link>${baseURL}</link>
    <description>最新の商品入荷情報をサイバーパンクなスピードでお届けします</description>
    <language>ja</language>
    <copyright>Copyright 2026 Tiper Live</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // ✅ キャッシュ戦略: 1時間キャッシュ (s-maxage=3600)
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}