import fs from 'fs';
import path from 'path';

async function generate() {
  // ローカル開発時は localhost:8000 など、お使いのDjangoのURLに合わせてください
  const DJANGO_API = 'http://localhost:8083/api/pc-products/?limit=500';
  const baseUrl = 'https://bicstation.com';

  console.log('🔄 Djangoから商品データを取得中...');

  try {
    const res = await fetch(DJANGO_API);
    if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`);
    
    const data = await res.json();
    const items = data.results || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc></url>
  ${items.map(p => `
  <url>
    <loc>${baseUrl}/product/${p.unique_id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`;

    // publicフォルダの下にsitemap.xmlを書き出す
    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    
    console.log(`✅ 成功！ ${items.length} 件の商品を含むサイトマップを作成しました。`);
    console.log(`保存先: ${outputPath}`);
  } catch (e) {
    console.error('❌ エラーが発生しました:', e.message);
  }
}

generate();