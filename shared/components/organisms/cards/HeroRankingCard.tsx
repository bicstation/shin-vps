'use client';

import Link from 'next/link';
import styles from './HeroRankingCard.module.css';
import { getMediaUrl } from '@/shared/lib/utils/media';

type Product = {
  id: number;
  unique_id: string;
  title?: string;
  shortTitle?: string;
  image?: string;
  price?: number;
};

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title = product.shortTitle || product.title || 'おすすめ商品';

  const price =
    typeof product.price === 'number'
      ? product.price.toLocaleString()
      : '---';

  const image = getMediaUrl(product.image);

  return (
    <section className={styles.card}>

      {/* 👑 ラベル */}
      <div className={styles.labelWrapper}>
        <span className={styles.label}>
          👑 人気No.1｜今一番売れてる
        </span>
      </div>

      {/* 💬 キャッチ */}
      <h2 className={styles.catch}>
        迷ってる時間が一番ムダ
      </h2>

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
        ¥{price}
      </div>

      {/* 💡 価値 */}
      <div className={styles.value}>
        この価格でこの性能
      </div>

      {/* 🔥 CTA前 */}
      <div className={styles.preCta}>
        迷ったらこれでOK
      </div>

      {/* 🚀 CTA */}
      <Link
        href={`/product/${product.unique_id}`}
        className={styles.cta}
      >
        👉 今すぐチェック（これでOK）
      </Link>

      {/* 🛡 安心 */}
      <div className={styles.sub}>
        送料無料・返品OKで安心
      </div>

    </section>
  );
}