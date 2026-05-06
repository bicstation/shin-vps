'use client';

import Link from 'next/link';
import SemanticSection from '@/shared/components/semantic/SemanticSection';
import { semanticHeroCopy } from '@/shared/lib/semantic/semanticHeroCopy';
import styles from './HeroRankingCard.module.css';

type SemanticAttribute = {
  slug: string;
  name: string;
  type: string;
  semantic_role?: string;
  semantic_weight?: number;
};

type Product = {
  id: number;
  unique_id: string;
  name?: string;
  shortTitle?: string;
  image_url?: string;
  price?: number;
  gpu_model?: string;
  cpu_model?: string;
  attributes?: SemanticAttribute[];
};

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  // -------------------------
  // タイトル
  // -------------------------
  const rawTitle = product.shortTitle || product.name || 'おすすめ商品';
  const title = rawTitle.length > 50 ? rawTitle.slice(0, 50) + '...' : rawTitle;

  // -------------------------
  // 価格
  // -------------------------
  const price = typeof product.price === 'number' ? product.price.toLocaleString() : null;

  // -------------------------
  // 画像
  // -------------------------
  const image = product.image_url || '/no-image.png';

  // -------------------------
  // Semantic Attributes
  // -------------------------
  const gpu = product.gpu_model?.replace('NVIDIA GeForce ', '') || '';
  const cpu = product.cpu_model || '';
  const usageAttribute = product.attributes?.find((attr) => attr.type === 'usage');
  const usage = usageAttribute?.slug || 'default';

  // -------------------------
  // Hero copy
  // -------------------------
  const heroCopy = semanticHeroCopy[usage as keyof typeof semanticHeroCopy] || semanticHeroCopy.default;

  // -------------------------
  // Semantic section attributes
  // -------------------------
  const semanticAttributes = [
    gpu && {
      slug: gpu.toLowerCase(),
      name: gpu,
      type: 'gpu',
      semantic_role: 'highlight',
      semantic_weight: 90,
    },
    cpu && {
      slug: cpu.toLowerCase(),
      name: cpu,
      type: 'cpu',
      semantic_weight: 70,
    },
    usageAttribute && {
      slug: usageAttribute.slug,
      name: usageAttribute.name,
      type: usageAttribute.type,
      semantic_role: 'highlight',
      semantic_weight: 100,
    },
  ].filter(Boolean);

  return (
    <section className={styles.card}>
      {/* 価格 */}
      {price && <div className={styles.price}>¥{price}（税込・送料無料）</div>}

      {/* Heroコピー */}
      <h2 className={styles.catch}>{heroCopy.catch}</h2>
      <p className={styles.notice}>{heroCopy.sub}</p>

      {/* CTA */}
      <Link href={`/product/${product.unique_id}`} className={styles.cta}>
        👉 今すぐこの価格で購入する
      </Link>

      {/* 補助通知 */}
      <p className={styles.notice}>※在庫切れになることがあります</p>

      {/* 画像ラベル */}
      <div className={styles.imageLabel}>実際の外観</div>

      {/* 商品画像 */}
      <img src={image} alt={title} className={styles.image} />

      {/* 商品タイトル */}
      <h3 className={styles.title}>{title}</h3>

      {/* Semantic attributes */}
      <div className={styles.spec}>
        {semanticAttributes.length > 0 && (
          <SemanticSection attributes={semanticAttributes} />
        )}
      </div>
    </section>
  );
}