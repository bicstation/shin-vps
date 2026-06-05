// app/adults/page.tsx

// @ts-nocheck

import Link from 'next/link';

import {
  getUnifiedProducts,
  toAdultProductCard,
} from '@/shared/lib/api/django/adult/products';

import Pagination
  from '@/shared/components/molecules/Pagination';

import AdultProductExplorerCard
  from '@/shared/components/organisms/cards/AdultProductExplorerCard';

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

  const result =
    await getUnifiedProducts(
      {
        page: currentPage,
        page_size: 24,
      },
      'avflash'
    );

  const products =
    result?.results?.map(
      toAdultProductCard
    ) ?? [];

  const totalCount =
    result?.count ?? 0;

  return (
    <div className={styles.page}>

      {/* Hero */}

      <section className={styles.hero}>

        <h1 className={styles.title}>
          作品一覧
        </h1>

        <p className={styles.description}>
          気になる作品を探してみましょう。
        </p>

        <div className={styles.meta}>

          <span>
            掲載作品数：
            {totalCount.toLocaleString()}件
          </span>

          <span>
            ページ：
            {currentPage}
          </span>

        </div>

      </section>

      {/* Navigation */}

      <section className={styles.navigation}>

        <Link
          href="/"
          className={styles.backLink}
        >
          ← トップへ戻る
        </Link>

      </section>

      {/* Grid */}

      <section className={styles.products}>

        {products.length > 0 ? (

          <div className={styles.grid}>

            {products.map(product => (
              <AdultProductExplorerCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          <div className={styles.empty}>

            表示できる作品がありません。

          </div>

        )}

      </section>

      {/* Pagination */}

      <section
        className={styles.paginationArea}
      >

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