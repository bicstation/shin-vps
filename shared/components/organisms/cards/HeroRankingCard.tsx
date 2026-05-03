'use client';

import Link from 'next/link';
import styles from './HeroRankingCard.module.css';

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
  spec_score?: number;
};

// -------------------------
// コンポーネント
// -------------------------
export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  // -------------------------
  // タイトル（長さ制御）
  // -------------------------
  const rawTitle =
    product.shortTitle ||
    product.name ||
    'おすすめ商品';

  const title =
    rawTitle.length > 60
      ? rawTitle.slice(0, 60) + '...'
      : rawTitle;

  // -------------------------
  // 価格
  // -------------------------
  const price =
    typeof product.price === 'number'
      ? product.price.toLocaleString()
      : '---';

  // -------------------------
  // 画像
  // -------------------------
  const image =
    product.image_url || '/no-image.png';

  // -------------------------
  // GPU簡略表示
  // -------------------------
  const gpu =
    product.gpu_model?.replace('NVIDIA GeForce ', '') || '';

  const cpu = product.cpu_model || '';

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

      {/* 💰 価格（主役） */}
      <div className={styles.price}>
        ¥{price}
      </div>

      {/* 💡 理由（重要） */}
      <div className={styles.reason}>
        高性能GPU＋バランス最強構成
      </div>

      {/* 💡 スペック（バッジ化） */}
      <div className={styles.spec}>
        {gpu && <span className={styles.badge}>{gpu}</span>}
        {cpu && <span className={styles.badgeSub}>{cpu}</span>}
      </div>

      {/* ⭐ スコア */}
      {product.spec_score && (
        <div className={styles.score}>
          総合スコア：{product.spec_score}
        </div>
      )}

      {/* 🔥 CTA前 */}
      <div className={styles.preCta}>
        迷ったらこれでOK
      </div>

      {/* 🚀 CTA（強化） */}
      <Link
        href={`/product/${product.unique_id}`}
        className={styles.cta}
      >
        👉 今すぐ最安価格を見る
      </Link>

      {/* 🛡 安心 */}
      <div className={styles.sub}>
        送料無料・返品OKで安心
      </div>

    </section>
  );
}