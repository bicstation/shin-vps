'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';
import { transformProduct } from '@/shared/lib/transformProduct';

{products.map((p) => (
  <ProductCard key={p.id} product={transformProduct(p)} />
))}

/* ✅ 型定義（ここかなり重要） */
type Product = {
  display_name?: string;
  short_tag?: string;
  selling_points?: string[];
  short_comment?: string;
  price?: number;
  affiliate_url?: string;
  unique_id?: string;
  image_url?: string;
  score_ai?: number;
  cta_text?: string;
  cta_sub?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  if (!product) return null;

  const {
    display_name = '商品名未設定',
    short_tag,
    selling_points = [],
    short_comment,
    price,
    affiliate_url,
    unique_id,
    image_url,
    score_ai,
    cta_text,
    cta_sub
  } = product;

  return (
    <article className={styles.card}>

      {/* 🔥 スコア */}
      {score_ai !== undefined && (
        <div className={styles.scoreBadge}>
          AI {score_ai}
        </div>
      )}

      {/* 🎯 タグ（誰向け） */}
      {short_tag && (
        <div className={styles.recommendTag}>
          {short_tag}
        </div>
      )}

      {/* 🖼 画像 */}
      <div className={styles.imageArea}>
        <img
          src={image_url || '/no-image.png'}
          alt={display_name}
          loading="lazy"
        />
      </div>

      <div className={styles.cardBody}>

        {/* 🏷 タイトル */}
        <h3 className={styles.productName}>
          <Link href={`/product/${unique_id || ''}`}>
            {display_name}
          </Link>
        </h3>

        {/* 💥 強み（最大3つに制限） */}
        {selling_points.length > 0 && (
          <ul className={styles.pointList}>
            {selling_points.slice(0, 3).map((p, i) => (
              <li key={i}>✔ {p}</li>
            ))}
          </ul>
        )}

        {/* 🧠 コメント */}
        {short_comment && (
          <p className={styles.shortComment}>
            {short_comment}
          </p>
        )}

        {/* 💰 価格 */}
        {price !== undefined && (
          <p className={styles.price}>
            ¥{Number(price).toLocaleString()}
          </p>
        )}

        {/* 🚀 CTA */}
        <div className={styles.actions}>

          {/* メインCTA（最重要） */}
          {affiliate_url && (
            <a
              href={affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyBtn}
            >
              👉 {cta_text || '今すぐチェック'}
            </a>
          )}

          {/* サブCTA（信頼＋緊急性） */}
          {cta_sub && (
            <div className={styles.ctaSub}>
              {cta_sub}
            </div>
          )}

          {/* 詳細（逃げ道） */}
          {unique_id && (
            <Link
              href={`/product/${unique_id}`}
              className={styles.detailBtn}
            >
              詳細を見る
            </Link>
          )}

        </div>

      </div>
    </article>
  );
}