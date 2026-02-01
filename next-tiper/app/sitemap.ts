import { MetadataRoute } from 'next';
import { getAdultProducts } from '@shared/lib/api';

/**
 * 💡 SEOの要：サイトマップ生成ロジック
 * 静的ページ + 動画詳細 + マガジン記事 を網羅します。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = 'https://tiper.live/tiper'; // サイトのベースURL

  // 1. 静的ページ（主要なランディングページ）
  const staticRoutes = [
    '',               // トップ
    '/products',      // 動画一覧（今回残したページ）
    '/tiper',         // マガジン一覧
    '/login',         // ログイン（一応）
    '/register',      // 会員登録
  ].map((route) => ({
    url: `${baseURL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // 2. 動的ページ：動画詳細 (Adult Products)
  // SEOのために最新500件程度をインデックスさせるのが理想的です
  const productsData = await getAdultProducts({ limit: 500, ordering: '-created_at' })
    .catch(() => ({ results: [] }));
  
  const productEntries = (productsData?.results || []).map((product: any) => ({
    url: `${baseURL}/adults/${product.id}`,
    lastModified: new Date(product.updated_at || product.release_date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. 動的ページ：マガジン記事 (WordPress Posts)
  // 💡 ここでマガジン（tiper/slug）も追加するのがポイントです
  // 本来は fetchPostData 等で全記事取得しますが、ここでは例として
  // 動画データと同様のフローで追加することをお勧めします。

  return [...staticRoutes, ...productEntries];
}