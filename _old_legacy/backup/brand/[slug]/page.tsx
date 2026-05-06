'use client';

import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function BrandPage({ params }: any) {
  const slug = params?.slug || 'score';

  let products: any[] = [];

  try {
    const data = await fetchPCProductRanking(slug);

    const rawProducts = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : [];

    console.log('[RANKING COUNT]', rawProducts.length);

    products = rawProducts;
  } catch (e) {
    console.error('[RANKING FETCH ERROR]', e);
  }

  if (!products.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>⚠️ データが取得できません</h2>
        <p>API状態を確認してください</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className="text-2xl font-bold text-center mb-6">
        {slug.toUpperCase()} ランキング
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p, i) => {
          if (!p) return null; // undefined をスキップ

          return (
            <ProductCard
              key={p.unique_id ?? i} // fallback は index
              product={p}
              rank={i + 1}
              className={styles.card ?? ''} // className 安全化
            />
          );
        })}
      </div>
    </div>
  );
}