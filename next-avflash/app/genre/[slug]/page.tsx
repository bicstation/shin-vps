// @ts-nocheck

import Link from 'next/link';

import {
  getUnifiedProducts,
  toAdultProductCard,
} from '@/shared/lib/api/django/adult/products';

import AdultProductExplorerCard
  from '@/shared/components/organisms/cards/AdultProductExplorerCard';

import styles from './page.module.css';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GenrePage({
  params,
}: Props) {

  const { slug } =
    await params;

  const genre =
    decodeURIComponent(slug);

  //
  // 将来
  // genre filter対応
  //

  const result =
    await getUnifiedProducts(
      {
        page_size: 24,
      },
      'avflash'
    );

  const products =
    result?.results?.map(
      toAdultProductCard
    ) ?? [];

  return (
    <div className={styles.page}>

      <div className={styles.header}>

        <Link
          href="/genre"
          className={styles.backLink}
        >
          ← ジャンル一覧へ戻る
        </Link>

        <h1 className={styles.title}>
          {genre}
        </h1>

        <p className={styles.description}>
          「{genre}」作品一覧
        </p>

      </div>

      <div className={styles.grid}>

        {products.map(
          (product) => (
            <AdultProductExplorerCard
              key={product.id}
              product={product}
            />
          )
        )}

      </div>

    </div>
  );
}