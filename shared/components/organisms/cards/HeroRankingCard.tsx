'use client';

import Link from 'next/link';
import styles from './HeroRankingCard.module.css';

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

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  const rawTitle =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const title =
    rawTitle.length > 50
      ? rawTitle.slice(0, 50) + '...'
      : rawTitle;

  const price =
    typeof product.price === 'number'
      ? product.price.toLocaleString()
      : null;

  const image =
    product.image_url || '/no-image.png';

  const gpu =
    product.gpu_model?.replace('NVIDIA GeForce ', '') || '';

  const cpu = product.cpu_model || '';

  return (
    <section className={styles.card}>

      {/* 💰 ①価格（最優先） */}
      {price && (
        <div className={styles.price}>
          ¥{price}
        </div>
      )}

      {/* 🔥 ②結論コピー */}
      <h2 className={styles.catch}>
        この価格帯ならこれ一択
      </h2>

      {/* 🚀 ③CTA */}
      <Link
        href={`/product/${product.unique_id}`}
        className={styles.cta}
      >
        👉 今すぐこの価格で購入する
      </Link>

      {/* ⚠️ ④補助コピー */}
      <p className={styles.notice}>
        ※在庫切れになることがあります
      </p>

      {/* 🖼 ⑤画像ラベル */}
      <div className={styles.imageLabel}>
        実際の外観
      </div>

      {/* 🖼 ⑤画像 */}
      <img
        src={image}
        alt={title}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.src = '/no-image.png';
        }}
      />

      {/* 🏷 補助タイトル */}
      <h3 className={styles.title}>
        {title}
      </h3>

      {/* 🧩 ⑥スペック */}
      <div className={styles.spec}>
        {gpu && <span className={styles.badge}>{gpu}</span>}
        {cpu && <span className={styles.badgeSub}>{cpu}</span>}
      </div>

    </section>
  );
}