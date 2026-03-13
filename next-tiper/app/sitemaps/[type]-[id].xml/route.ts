export const dynamic = 'force-dynamic';

/**
 * ✅ Maya's Logic v3 への統合
 * 存在しないパスからのインポートを修正し、エイリアス化された関数を使用します。
 */
import { getUnifiedProducts } from '@/shared/lib/api';

export async function GET(
  request: Request,
  { params }: { params: { type: string; id: string } }
) {
  const baseURL = 'https://tiper.live';
  
  // "0.xml" から数値を取得
  const pageIndex = parseInt(params.id.replace('.xml', '')) || 0;
  const LIMIT = 50000;
  const OFFSET = pageIndex * LIMIT;

  try {
    let urls: string[] = [];

    if (params.type === 'products') {
      /**
       * 💡 動画データ取得
       * getUnifiedProducts は内部で Host ヘッダーを自動付与し、
       * 適切なドメイン置換 (replaceInternalUrls) を行います。
       */
      const { results } = await getUnifiedProducts({ 
        limit: LIMIT, 
        offset: OFFSET, 
        ordering: '-id' // created_at が無い場合に備え安全な ID 降順
      });

      urls = (results || []).map((p: any) => {
        const finalId = p.unique_id || p.id;
        const lastMod = p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString();
        return `<url><loc>${baseURL}/adults/${finalId}</loc><lastmod>${lastMod}</lastmod><priority>0.8</priority></url>`;
      });

    } else if (params.type === 'actresses') {
      /**
       * 💡 女優データ取得
       * fetch を直接使う場合も、Host ヘッダーを忘れないようにします。
       */
      const res = await fetch(`http://django-v3:8000/api/adult-actresses/?limit=${LIMIT}&offset=${OFFSET}`, {
          headers: { 'Host': 'tiper.live' } // 各サイトのドメインに合わせる
      });
      const data = await res.json();
      urls = (data?.results || []).map((a: any) => 
        `<url><loc>${baseURL}/actresses/${a.slug || a.id}</loc><priority>0.6</priority></url>`
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`.trim();

    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (error: any) {
    console.error(`🚨 [Sitemap Generation Error]: ${error.message}`);
    return new Response("Internal Error", { status: 500 });
  }
}