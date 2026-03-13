export const dynamic = 'force-dynamic';
import { fetchPostList } from '@/shared/lib/api';

export async function GET() {
  const baseURL = 'https://tiper.live';
  const posts = await fetchPostList('post', 500).catch(() => ({ results: [] }));

  const staticUrls = ['', '/adults', '/blog', '/actresses', '/brand', '/ranking'].map(path => 
    `<url><loc>${baseURL}${path}</loc><priority>1.0</priority></url>`
  );

  const blogUrls = (posts?.results || []).map((p: any) => 
    `<url><loc>${baseURL}/blog/${p.slug}</loc><priority>0.7</priority></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticUrls, ...blogUrls].join('')}
</urlset>`.trim();

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}