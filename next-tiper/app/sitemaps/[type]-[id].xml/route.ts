export const dynamic = 'force-dynamic';
import { getUnifiedProducts } from '@shared/lib/api/django/adult';

export async function GET(
  request: Request,
  { params }: { params: { type: string; id: string } }
) {
  const baseURL = 'https://tiper.live';
  const apiBaseURL = 'http://127.0.0.1:8083/api'; // 状況に合わせて内部IP等に変更
  
  // "0.xml" から "0" を取得
  const pageIndex = parseInt(params.id.replace('.xml', '')) || 0;
  const LIMIT = 50000;
  const OFFSET = pageIndex * LIMIT;

  try {
    let urls: string[] = [];

    if (params.type === 'adults') {
      // 💡 動画データ取得
      const data = await getUnifiedProducts({ limit: LIMIT, offset: OFFSET, ordering: '-created_at' });
      urls = (data?.results || []).map((p: any) => {
        const finalId = p.display_id || p.product_id_unique;
        return `<url><loc>${baseURL}/adults/${finalId}?source=${(p.api_source || 'fanza').toUpperCase()}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod><priority>0.8</priority></url>`;
      });

    } else if (params.type === 'actresses') {
      // 💡 女優データ取得 (fetchで直接叩く例)
      const res = await fetch(`${apiBaseURL}/master/actresses/?limit=${LIMIT}&offset=${OFFSET}`);
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
  } catch (error) {
    return new Response("Internal Error", { status: 500 });
  }
}