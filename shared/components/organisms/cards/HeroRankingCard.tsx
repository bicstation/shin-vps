'use client';

import Link from 'next/link';

import SemanticSection
  from '@/shared/components/semantic/SemanticSection';

import {
  semanticHeroCopy
} from '@/shared/lib/semantic/semanticHeroCopy';

import {
  semanticHeroPolicy
} from '@/shared/lib/semantic/semanticHeroPolicy';

import styles from './HeroRankingCard.module.css';

// -------------------------
// 型
// -------------------------
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

// -------------------------
// Hero Ranking Card
// -------------------------
export default function HeroRankingCard({
  product,
}: {
  product?: Product
}) {

  if (!product) return null;

  // -------------------------
  // タイトル
  // -------------------------
  const rawTitle =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const title =
    rawTitle.length > 50
      ? rawTitle.slice(0, 50) + '...'
      : rawTitle;

  // -------------------------
  // 価格
  // -------------------------
  const price =
    typeof product.price === 'number'
      ? product.price.toLocaleString()
      : null;

  // -------------------------
  // 画像
  // -------------------------
  const image =
    product.image_url || '/no-image.png';

  // -------------------------
  // semantic attrs
  // -------------------------
  const gpu =
    product.gpu_model
      ?.replace('NVIDIA GeForce ', '')
      || '';

  const cpu =
    product.cpu_model || '';

  // -------------------------
  // backend semantic usage
  // -------------------------
  const usageAttribute =
    product.attributes?.find(
      (attr) => attr.type === 'usage'
    );

  // -------------------------
  // semantic usage
  // -------------------------
  const usage =
    usageAttribute?.slug || 'default';

  // -------------------------
  // semantic hero copy
  // -------------------------
  const heroCopy =
    semanticHeroCopy[
      usage as keyof typeof semanticHeroCopy
    ]
    || semanticHeroCopy.default;

  // -------------------------
  // semantic hero policy
  // -------------------------
  const heroPolicy =
    semanticHeroPolicy[
      usage as keyof typeof semanticHeroPolicy
    ]
    || semanticHeroPolicy.default;

  // -------------------------
  // semantic section attrs
  // -------------------------
  const semanticAttributes = [

    // 🔥 GPU（強調）
    gpu && {
      slug: gpu.toLowerCase(),
      name: gpu,
      type: 'gpu',

      semantic_role: 'highlight',
      semantic_weight: 90,
    },

    // CPU
    cpu && {
      slug: cpu.toLowerCase(),
      name: cpu,
      type: 'cpu',

      semantic_weight: 70,
    },

    // usage intent
    usageAttribute && {
      slug: usageAttribute.slug,
      name: usageAttribute.name,
      type: usageAttribute.type,

      semantic_role: 'highlight',
      semantic_weight: 100,
    },

  ].filter(Boolean);

  return (
    <section
      className={`
        ${styles.card}
        ${heroPolicy.emphasis}
      `}
    >

      {/* =========================
          ① 価格（最優先）
      ========================= */}
      {price && (
        <div className={styles.price}>
          ¥{price}
        </div>
      )}

      {/* =========================
          ② semantic copy
      ========================= */}
      <h2 className={styles.catch}>
        {heroCopy.catch}
      </h2>

      {/* =========================
          sub copy
      ========================= */}
      <p className={styles.notice}>
        {heroCopy.sub}
      </p>

      {/* =========================
          ③ CTA
      ========================= */}
      <Link
        href={`/product/${product.unique_id}`}
        className={`
          ${styles.cta}
          ${heroPolicy.cta}
        `}
      >
        👉 今すぐこの価格で購入する
      </Link>

      {/* =========================
          補助通知
      ========================= */}
      <p className={styles.notice}>
        ※在庫切れになることがあります
      </p>

      {/* =========================
          ⑤ 画像ラベル
      ========================= */}
      <div className={styles.imageLabel}>
        実際の外観
      </div>

      {/* =========================
          ⑤ 画像
      ========================= */}
      <img
        src={image}
        alt={title}
        className={styles.image}
      />

      {/* =========================
          タイトル
      ========================= */}
      <h3 className={styles.title}>
        {title}
      </h3>

      {/* =========================
          semantic section
      ========================= */}
      <div className={styles.spec}>

        <SemanticSection
          attributes={semanticAttributes}
        />

      </div>

    </section>
  );
}