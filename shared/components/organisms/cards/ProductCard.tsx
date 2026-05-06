'use client';

import Link from 'next/link';
import SemanticBadge from '@/shared/components/semantic/SemanticBadge';
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
  attributes?: any[];
};

type Props = {
  product?: Product;
  rank?: number;
};

function getRankLabel(rank?: number) {
  if (!rank) return null;
  if (rank === 1) return '👑 人気No.1';
  if (rank === 2) return '人気No.2';
  if (rank === 3) return 'バランス良';
  if (rank === 4) return 'コスパ良';
  if (rank <= 10) return `TOP${rank}`;
  return null;
}

export default function ProductCard({ product, rank }: Props) {
  if (!product) return null;

  const rawTitle = product.shortTitle || product.name || 'おすすめ商品';
  const title = rawTitle.length > 42 ? rawTitle.slice(0, 42) + '...' : rawTitle;

  const price = typeof product.price === 'number'
    ? `¥${product.price.toLocaleString()}（税込・送料無料）`
    : '';

  const image = product.image_url || '/no-image.png';
  const gpu = product.gpu_model?.replace('NVIDIA GeForce ', '') || '';
  const cpu = product.cpu_model || '';
  const label = getRankLabel(rank);

  return (
    <Link
      href={`/product/${product.unique_id ?? '#'}`}
      className={styles.card ?? ''}
    >
      {/* =========================
          画像
      ========================= */}
      <div className={styles.imageWrap ?? ''}>
        <img src={image} alt={title} className={styles.image ?? ''} />
        <div className={styles.imageGrad ?? ''} />
        {label && <div className={styles.label ?? ''}>{label}</div>}
      </div>

      {/* =========================
          価格
      ========================= */}
      <div className={styles.price ?? ''}>{price}</div>

      {/* =========================
          タイトル
      ========================= */}
      <h3 className={styles.title ?? ''}>{title}</h3>

      {/* =========================
          Semantic section
      ========================= */}
      <div className={styles.spec ?? ''}>
        {gpu && (
          <SemanticBadge
            attribute={{
              slug: gpu.toLowerCase(),
              name: gpu,
              type: 'gpu',
              semantic_role: 'highlight',
              semantic_weight: 90,
            }}
          />
        )}
        {cpu && <span className={styles.badgeSub ?? ''}>{cpu}</span>}
      </div>

      {/* =========================
          CTA
      ========================= */}
      <div className={styles.cta ?? ''}>
        👉 今この価格で購入する →
      </div>
    </Link>
  );
}