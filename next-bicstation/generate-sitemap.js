// generate-sitemap.js
const fs = require('fs');

async function generate() {
  const DJANGO_API = 'http://django-v2:8000/api/pc-products/?limit=500';
  const baseUrl = 'https://bicstation.com';

  console.log('Fetching products from Django...');
  try {
    const res = await fetch(DJANGO_API);
    const data = await res.json();
    const items = data.results || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc></url>
  ${items.map(p => `<url><loc>${baseUrl}/product/${p.unique_id}</loc></url>`).join('')}
</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log(`Success! Created sitemap.xml with ${items.length} products.`);
  } catch (e) {
    console.error('Failed to generate sitemap:', e);
  }
}

generate();