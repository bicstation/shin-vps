import fs from 'fs';
import path from 'path';

async function generate() {
  const baseUrl = 'https://bicstation.com';
  const outputPath = path.join(process.cwd(), 'public', 'sitemap_gen', 'sitemap.xml');
  const tsvPath = '/usr/src/app/master_data/attributes.tsv';
  const allUrls = [];
  const lastMod = new Date().toISOString();

  console.log("🚀 BicStation サイトマップ生成プロセス開始...");

  // 1. 静的ページ
  ['', '/about'].forEach(p => allUrls.push(`${baseUrl}${p}`));

  // 2. スペック属性 (TSV)
  try {
    if (fs.existsSync(tsvPath)) {
      const content = fs.readFileSync(tsvPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '').slice(1);
      lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length > 2) {
          const slug = columns[2].trim();
          if (slug) allUrls.push(`${baseUrl}/pc-products/?attribute=${slug}`);
        }
      });
    }
  } catch (e) { console.error("❌ TSV Error:", e.message); }

  // 3. ブランド取得
  try {
    const res = await fetch('http://django-v2:8000/api/pc-makers/', { headers: { 'Host': 'localhost' } });
    if (res.ok) {
      const makers = await res.json();
      makers.forEach(m => { if (m.maker) allUrls.push(`${baseUrl}/brand/${m.maker.toLowerCase()}`); });
    }
  } catch (e) { console.error("❌ Maker API Error"); }

  // 4. 商品全件 (Whileループ)
  let djangoApiUrl = 'http://django-v2:8000/api/pc-products/';
  try {
    while (djangoApiUrl) {
      const res = await fetch(djangoApiUrl, { headers: { 'Host': 'localhost' } });
      if (!res.ok) break;
      const data = await res.json();
      (data.results || []).forEach(p => { if (p.unique_id) allUrls.push(`${baseUrl}/products/${p.unique_id}`); });
      djangoApiUrl = data.next ? data.next.replace(/https?:\/\/[^\/]+/, 'http://django-v2:8000') : null;
    }
  } catch (e) { console.error("❌ Product API Error"); }

  // 5. WP記事
  try {
    const wpRes = await fetch('http://nginx-wp-v2/wp-json/wp/v2/bicstation?per_page=100', { headers: { 'Host': 'localhost:8083' } });
    if (wpRes.ok) {
      const posts = await wpRes.json();
      posts.forEach(post => { if (post.slug) allUrls.push(`${baseUrl}/bicstation/${post.slug}`); });
    }
  } catch (e) { console.error("❌ WP API Error"); }

  // 6. 出力
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url><loc>${url}</loc><lastmod>${lastMod}</lastmod></url>`).join('\n')}
</urlset>`;

  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml);
  console.log(`✨ 完了！ 合計 ${allUrls.length} 件のURLを保存しました。`);
}
generate();
