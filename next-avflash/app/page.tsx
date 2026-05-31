// @ts-nocheck
console.log(
  'HOME PAGE EXECUTED'
);

import Link from 'next/link';

import {
  getUnifiedProducts,
  toAdultProductCard,
} from '@/shared/lib/api/django/adult/products';

import AdultProductExplorerCard from '@/shared/components/organisms/cards/AdultProductExplorerCard';

import styles from './page.module.css';

export default async function HomePage() {
  const result = await getUnifiedProducts(
    {
      page_size: 12,
    },
    'avflash'
  );

  const products =
    result.results.map(
      toAdultProductCard
    );

 console.log(
    'RESULT',
    result
    );

 console.log(
    'RESULTS',
    result?.results
    );

 console.log(
    'FIRST',
    result?.results?.[0]
    );

 console.log(
    'COUNT',
    result?.count
    );

 console.log(
    'RESULTS_LENGTH',
    result?.results?.length
    );

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          AVFLASH
        </h1>

        <p className={styles.heroSubTitle}>
          作品を探す
        </p>
      </section>

      {/* Statistics */}
      <section className={styles.statistics}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {result.count?.toLocaleString() ?? '0'}
          </span>

          <span className={styles.statLabel}>
            登録作品
          </span>
        </div>
      </section>

      {/* Latest Products */}
      <section className={styles.latestSection}>
        <div className={styles.sectionHeader}>
          <h2>最新作品</h2>
        </div>

        <div className={styles.productGrid}>
          {products.map(product => (
            <AdultProductExplorerCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Explorer Entry */}
      <section className={styles.explorerEntry}>
        <Link
          href="/adults"
          className={styles.explorerButton}
        >
          すべての作品を見る
        </Link>
      </section>
    </div>
  );
}

