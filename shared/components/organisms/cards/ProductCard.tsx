'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

type Product = {
  id: number;
  unique_id: string;
  name?: string;
  shortTitle?: string;
  image_url?: string;
  price?: number;
  gpu_model?: string;
  cpu_model?: string;
};

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  const rawTitle =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const title =
    rawTitle.length > 42
      ? rawTitle.slice(0, 42) + '...'
      : rawTitle;

  const price =
    typeof product.price === 'number'
      ? `¥${product.price.toLocaleString()}（税込・送料無料）`
      : '';

  const image =
    product.image_url || '/no-image.png';

  const gpu =
    product.gpu_model?.replace('NVIDIA GeForce ', '') || '';

  const cpu = product.cpu_model || '';

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >
      {/* 🖼 画像 */}
      <div className={styles.imageWrap}>
        <img
          src={image}
          alt={title}
          className={styles.image}
          onError={(e) => {
            e.currentTarget.src = '/no-image.png';
          }}
        />
        <div className={styles.imageGrad} />

        {/* 🏷 ラベル */}
        <div className={styles.label}>
          人気No.2
        </div>
      </div>

      {/* 💰 価格（最優先） */}
      <div className={styles.price}>
        {price}
      </div>

      {/* 🏷 タイトル */}
      <h3 className={styles.title}>
        {title}
      </h3>

      {/* 💡 スペック */}
      <div className={styles.spec}>
        {gpu && <span className={styles.badge}>{gpu}</span>}
        {cpu && <span className={styles.badgeSub}>{cpu}</span>}
      </div>

      {/* 🚀 CTA（ボタン化） */}
      <div className={styles.cta}>
        👉 今この価格で購入する →
      </div>

    </Link>
  );
}