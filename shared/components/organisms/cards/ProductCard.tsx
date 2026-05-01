'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

type Product = {
  id: number;
  unique_id: string;
  shortTitle?: string;
  title?: string;
  image?: string;
  price?: number;
};

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title =
    product.shortTitle ||
    product.title ||
    'おすすめ商品';

  const price = product.price
    ? `¥${product.price.toLocaleString()}`
    : '';

  const image = product.image || '/no-image.png';

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >
      {/* 🖼 画像 */}
      <img
        src={image}
        alt={title}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.src = '/no-image.png';
        }}
      />

      {/* 🏷 タイトル */}
      <h3 className={styles.title}>
        {title}
      </h3>

      {/* 💰 価格 */}
      <div className={styles.price}>
        {price}
      </div>
    </Link>
  );
}