'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

// -------------------------
// 型（PCProductベース）
// -------------------------
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

// -------------------------
// コンポーネント
// -------------------------
export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const price =
    typeof product.price === 'number'
      ? `¥${product.price.toLocaleString()}`
      : '';

  const image =
    product.image_url || '/no-image.png';

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

      {/* 💰 価格（主役） */}
      <div className={styles.price}>
        {price}
      </div>

      {/* 💡 スペックバッジ */}
      <div className={styles.spec}>
        {product.gpu_model && (
          <span className={styles.badge}>
            {product.gpu_model.replace('NVIDIA GeForce ', '')}
          </span>
        )}
        {product.cpu_model && (
          <span className={styles.badgeSub}>
            {product.cpu_model}
          </span>
        )}
      </div>

      {/* 👉 軽いCTA */}
      <div className={styles.cta}>
        詳細を見る →
      </div>
    </Link>
  );
}