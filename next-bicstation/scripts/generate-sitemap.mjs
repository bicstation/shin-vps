import fs from 'fs';
import path from 'path';

async function generate() {
  const baseUrl = 'https://bicstation.com';
  const outputPath = path.join(process.cwd(), 'public', 'sitemap_gen', 'sitemap.xml');
  const tsvPath = '/usr/src/app/master_data/attributes.tsv'; // Djangoから共有されたマスタパス
  const allUrls = [];
  const lastMod = new Date().toISOString();

  console.log("🚀 BicStation サイトマップ生成プロセス開始...");

  // --- 1. 静的ページ ---
  ['', '/about'].forEach(p => allUrls.push(`${baseUrl}${p}`));

  // --- 2. スペック属性ページ (TSVファイルから読み込み) ---
  try {
    if (fs.existsSync(tsvPath)) {
      const content = fs.readFileSync(tsvPath, 'utf-8');
      // 改行で分割し、空行を除去。ヘッダー(1行目)をスキップ
      const lines = content.split('\n').filter(line => line.trim() !== '').slice(1);
      
      lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length > 2) {
          const slug = columns[2].trim(); // 3列目がslug
          if (slug) {
            allUrls.push(`${baseUrl}/pc-products/?attribute=${slug}`);
          }
        }
      });
      console.log(`✅ TSVよりスペック属性ページを抽出しました。`);
    } else {
      console.error(`⚠️ TSVファイルが見つかりません: ${tsvPath}`);
    }
  } catch (e) {
    console.error("❌ TSV解析エラー:", e.message);
  }

  // --- 3. ブランド（メーカー）一覧 (Django API経由) ---
  try {
    const res = await fetch('http://django-v2:8000/api/pc-makers/', { 
      headers: { 'Host': 'localhost' } 
    });
    if (res.ok) {
      const makers = await res.json();
      makers.forEach(m => {
        if (m.maker) {
          allUrls.push(`${baseUrl}/brand/${m.maker.toLowerCase()}`);
        }
      });
      console.log(`✅ ブランド一覧を取得しました。`);
    }
  } catch (e) {
    console.error("❌ ブランドAPI取得失敗:", e.message);
  }

  // --- 4. 商品全件取得 (Django API / ページネーション対応) ---
  let djangoApiUrl = 'http://django-v2:8000/api/pc-products/';
  try {
    while (djangoApiUrl) {
      const res = await fetch(djangoApiUrl, { headers: { 'Host': 'localhost' } });
      if (!res.ok) break;
      const data = await res.json();
      
      (data.results || []).forEach(p => {
        if (p.unique_id) {
          allUrls.push(`${baseUrl}/products/${p.unique_id}`);
        }
      });

      // data.nextがあればURLをDocker内部ネットワーク用に書き換えてループ継続
      djangoApiUrl = data.next ? data.next.replace(/https?:\/\/[^\/]+/, 'http://django-v2:8000') : null;
    }
    console.log(`✅ 全商品の取得が完了しました。`);
  } catch (e) {
    console.error("❌ 商品API取得失敗:", e.message);
  }

  // --- 5. WordPress ブログ記事取得 ---
  try {
    const wpRes = await fetch('http://nginx-wp-v2/wp-json/wp/v2/bicstation?per_page=100', { 
      headers: { 'Host': 'localhost:8083' } 
    });
    if (wpRes.ok) {
      const posts = await wpRes.json();
      posts.forEach(post => {
        if (post.slug) {
          allUrls.push(`${baseUrl}/bicstation/${post.slug}`);
        }
      });
      console.log(`✅ ブログ記事を取得しました。`);
    }
  } catch (e) {
    console.error("❌ WP API取得失敗:", e.message);
  }

  // --- 6. XML生成と書き出し ---
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url><loc>${url}</loc><lastmod>${lastMod}</lastmod></url>`).join('\n')}
</urlset>`;

  try {
    // ディレクトリがなければ作成
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    fs.writeFileSync(outputPath, xmlContent);
    console.log(`✨ 成功！ 合計 ${allUrls.length} 件のURLを含むサイトマップを更新しました。`);
  } catch (e) {
    console.error("❌ サイトマップ書き込み失敗:", e.message);
  }
}

generate();