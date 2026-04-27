'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

/* ✅ 型定義 */
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
        <div
          className={styles.scoreBadge}
          style={{
            background:
              score_ai >= 90
                ? '#16a34a'
                : score_ai >= 80
                ? '#2563eb'
                : '#64748b'
          }}
        >
          AI {score_ai}
          <span style={{ marginLeft: '6px', fontSize: '11px' }}>
            {score_ai >= 90
              ? '最上位'
              : score_ai >= 80
              ? '上位'
              : '標準'}
          </span>
        </div>
      )}

      {/* 🎯 タグ */}
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

        {/* 💥 強み（最大3つ） */}
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

          {/* メインCTA（改善済み） */}
          {affiliate_url && (
            <a
              href={affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyBtn}
            >
              👉 {cta_text || '最安価格をチェック（在庫あり）'}
            </a>
          )}

          {/* サブCTA（信頼＋緊急性） */}
          <div className={styles.ctaSub}>
            {cta_sub || '※価格・在庫は変動します'}
          </div>

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