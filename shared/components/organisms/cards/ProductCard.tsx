'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

type Product = {
  id: number;
  unique_id: string; // ← これ重要
  shortTitle?: string;
  image?: string;
  price?: number;
  displayLabel?: string;
  mainTag?: string;
};

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >

      {/* 🔥 ラベル */}
      {product.displayLabel && (
        <div className={styles.label}>
          {product.displayLabel}
        </div>
      )}

      {/* 🖼 画像 */}
      <img
        src={product.image || '/no-image.png'}
        alt={product.shortTitle || 'product'}
        className={styles.image}
      />

      <div className={styles.body}>

        {/* 🏷 タイトル */}
        <h3 className={styles.title}>
          {product.shortTitle}
        </h3>

        {/* 🏷 タグ */}
        {product.mainTag && (
          <div className={styles.tags}>
            {product.mainTag}
          </div>
        )}

        {/* 💰 価格 */}
        <div className={styles.price}>
          ¥{product.price?.toLocaleString()}
        </div>

        {/* 🔍 CTA（補助） */}
        <div className={styles.cta}>
          詳細を見る
          <span className={styles.ctaSub}>
            スペック確認
          </span>
        </div>

      </div>
    </Link>
  );
}