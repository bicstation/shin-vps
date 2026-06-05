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
  RankingPreviewSection,
} from './_components/home';

import styles from './page.module.css';

export default async function HomePage() {

  //
  // Latest Products
  //

  const latestResult =
    await getUnifiedProducts(
      {
        page_size: 12,
      },
      'avflash'
    );

  const latestProducts =
    latestResult?.results?.map(
      toAdultProductCard
    ) ?? [];

  return (
    <div className={styles.page}>

      {/* AVFLASHとは何か */}
      <HeroSection />

      {/* 次の行動を選ぶ */}
      <ExplorerEntrySection />

      {/* 最新作品 */}
      <LatestProductsSection
        products={latestProducts}
      />

      {/* 人気作品導線 */}
      <RankingPreviewSection />

      {/* 信頼補強 */}
      <StatsSection
        products={latestResult?.count ?? 0}
      />

    </div>
  );
}