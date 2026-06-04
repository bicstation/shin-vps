// @ts-nocheck

import Link from 'next/link';
import SafeImage from '@/shared/components/atoms/SafeImage';

import {
  ProductCardVM,
} from '@/shared/lib/api/django/adult/products';

import styles from './AdultProductExplorerCard.module.css';

interface Props {
  product: ProductCardVM;
}

export default function AdultProductExplorerCard({
  product,
}: Props) {
  return (
    <article className={styles.card}>
      <Link
        href={`/adults/${product.id}`}
        className={styles.link}
      >
        {/* Thumbnail */}
        <div className={styles.thumbnailWrapper}>
          <SafeImage
            src={
              product.image ||
              '/images/common/no-image.jpg'
            }
            alt={product.title}
            className={styles.thumbnail}
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>
            {product.title}
          </h3>

          {product.maker && (
            <div className={styles.meta}>
              <span className={styles.label}>
                メーカー
              </span>
              <span className={styles.value}>
                {product.maker}
              </span>
            </div>
          )}

          {product.releaseDate && (
            <div className={styles.meta}>
              <span className={styles.label}>
                発売日
              </span>
              <span className={styles.value}>
                {product.releaseDate}
              </span>
            </div>
          )}

          <div className={styles.footer}>
            詳細を見る →
          </div>
        </div>
      </Link>
    </article>
  );
}

