'use client';

import Link from 'next/link';

import SemanticBadge from '@/shared/components/semantic/SemanticBadge';

import styles from './ProductCard.module.css';

// -------------------------
// 型
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

type Props = {
  product?: Product;
  rank?: number;
};

// -------------------------
// ラベル
// -------------------------
function getRankLabel(rank?: number) {
  if (!rank) return null;

  if (rank === 1) return '👑 人気No.1';
  if (rank === 2) return '人気No.2';
  if (rank === 3) return 'バランス良';
  if (rank === 4) return 'コスパ良';

  if (rank <= 10) return `TOP${rank}`;

  return null;
}

// -------------------------
// コンポーネント
// -------------------------
export default function ProductCard({
  product,
  rank,
}: Props) {

  if (!product) return null;

  // -------------------------
  // タイトル
  // -------------------------
  const rawTitle =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const title =
    rawTitle.length > 42
      ? rawTitle.slice(0, 42) + '...'
      : rawTitle;

  // -------------------------
  // 価格
  // -------------------------
  const price =
    typeof product.price === 'number'
      ? `¥${product.price.toLocaleString()}（税込・送料無料）`
      : '';

  // -------------------------
  // 画像
  // -------------------------
  const image =
    product.image_url || '/no-image.png';

  // -------------------------
  // GPU
  // -------------------------
  const gpu =
    product.gpu_model
      ?.replace('NVIDIA GeForce ', '')
      || '';

  // -------------------------
  // CPU
  // -------------------------
  const cpu =
    product.cpu_model || '';

  // -------------------------
  // ランクラベル
  // -------------------------
  const label = getRankLabel(rank);

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >

      {/* =========================
          画像
      ========================= */}
      <div className={styles.imageWrap}>

        <img
          src={image}
          alt={title}
          className={styles.image}
        />

        <div className={styles.imageGrad} />

        {/* 🏷 ラベル */}
        {label && (
          <div className={styles.label}>
            {label}
          </div>
        )}

      </div>

      {/* =========================
          価格
      ========================= */}
      <div className={styles.price}>
        {price}
      </div>

      {/* =========================
          タイトル
      ========================= */}
      <h3 className={styles.title}>
        {title}
      </h3>

      {/* =========================
          semantic spec
      ========================= */}
      <div className={styles.spec}>

        {/* 🔥 semantic rendering */}
        {gpu && (
          <SemanticBadge
            attribute={{
              slug: gpu.toLowerCase(),
              name: gpu,
              type: 'gpu',
            }}
          />
        )}

        {/* CPUは旧構造維持（Phase1） */}
        {cpu && (
          <span className={styles.badgeSub}>
            {cpu}
          </span>
        )}

      </div>

      {/* =========================
          CTA
      ========================= */}
      <div className={styles.cta}>
        👉 今この価格で購入する →
      </div>

    </Link>
  );
}