// app/page.tsx

// @ts-nocheck

import {
  getUnifiedProducts,
  toAdultProductCard,
} from '@/shared/lib/api/django/adult/products';

import {
  HeroSection,
  StatsSection,
  LatestProductsSection,
  ExplorerEntrySection,
} from './_components/home';

import styles from './page.module.css';

export default async function HomePage() {

  const result = await getUnifiedProducts(
    {
      page_size: 12,
    },
    'avflash'
  );

  const products =
    result?.results?.map(
      toAdultProductCard
    ) ?? [];

  return (
    <div className={styles.page}>

      <HeroSection />

      <StatsSection
        products={result?.count ?? 0}
      />

      <LatestProductsSection
        products={products}
      />

      <ExplorerEntrySection />

    </div>
  );
}

