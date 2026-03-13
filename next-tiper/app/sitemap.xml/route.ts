export const dynamic = 'force-dynamic';

import { getSiteMainPosts } from '@/shared/lib/api';

export async function GET() {
  const baseURL = 'https://tiper.live';
  
  // 💡 本来はAPIから全件数を取得すべきですが、一旦固定値で計算します
  const counts = {
    products: 300000, // 30万件
    actresses: 65000,  // 6.5万件
  };
  const LIMIT = 50000; // Googleの1ファイル上限

  const generateSitemaps = (type: string, total: number) => {
    const numFiles = Math.ceil(total / LIMIT);
    return Array.from({ length: numFiles })
      .map((_, i) => `<sitemap><loc>${baseURL}/sitemaps/${type}-${i}.xml</loc></sitemap>`)
      .join('');
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseURL}/sitemaps/static.xml</loc></sitemap>
  ${generateSitemaps('products', counts.products)}
  ${generateSitemaps('actresses', counts.actresses)}
</sitemapindex>`.trim();

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}