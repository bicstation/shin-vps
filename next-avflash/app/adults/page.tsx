// @ts-nocheck

import {
  getUnifiedProducts,
  toAdultProductCard,
} from '@/shared/lib/api/django/adult/products';

import Pagination from '@/shared/components/molecules/Pagination';

import AdultProductExplorerCard from '@/shared/components/organisms/cards/AdultProductExplorerCard';

import styles from './page.module.css';

interface PageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function AdultsPage({
  searchParams,
}: PageProps) {
  const currentPage = Number(
    searchParams?.page ?? 1
  );

  const result = await getUnifiedProducts(
    {
      page: currentPage,
      page_size: 24,
    },
    'avflash'
  );

  const products =
    result.results.map(
      toAdultProductCard
    );

  const totalCount =
    result.count ?? 0;


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
      {/* Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>
          AVFLASH Explorer
        </h1>

        <p className={styles.subTitle}>
          作品を探す
        </p>
      </section>

      {/* Grid */}
      <section>
        <div className={styles.grid}>
          {products.map(product => (
            <AdultProductExplorerCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Pagination */}
      <section className={styles.paginationArea}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={24}
          basePath="/adults"
        />
      </section>
    </div>
  );
}

