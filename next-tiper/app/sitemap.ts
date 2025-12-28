import { MetadataRoute } from 'next';
import { getAdultProducts } from '../lib/api'; // 全商品取得用の関数（既存のもの）

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = 'https://tiper.live/tiper';

  // 1. 静的ページ
  const routes = ['', '/adults'].map((route) => ({
    url: `${baseURL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 2. 動的ページ（商品詳細）
  // 大量にある場合は直近の100件などに絞るのが一般的です
  const products = await getAdultProducts(); 
  const productEntries = (products?.results || []).map((product: any) => ({
    url: `${baseURL}/adults/${product.id}`,
    lastModified: new Date(product.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...productEntries];
}