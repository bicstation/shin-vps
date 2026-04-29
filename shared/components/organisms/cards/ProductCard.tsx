'use client';

import styles from './ProductCard.module.css';

type Product = {
  id: number;
  title?: string;
  image?: string | null;
  price?: number;
  url?: string | null;
  label?: string;
  tags?: string[];
};

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  // 🔒 安全処理
  const title = product.title || 'おすすめ商品';
  const image = product.image || '/no-image.png';
  const price = product.price ?? 0;
  const url = product.url || '';
  const label = product.label || '';
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

  return (
    <article className={styles.card}>
      
      {/* 🔥 ラベル（目立たせる） */}
      {label && (
        <div className={styles.label}>
          {label}
        </div>
      )}

      <div className={styles.inner}>
        
        {/* 🖼 画像 */}
        <img
          src={image}
          alt={title}
          className={styles.image}
        />

        <div className={styles.body}>
          
          {/* タイトル */}
          <h3 className={styles.title}>
            {title}
          </h3>

          {/* タグ */}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.join(' / ')}
            </div>
          )}

          {/* 価格 */}
          <div className={styles.price}>
            ¥{price.toLocaleString()}
          </div>

          {/* CTA（強化版） */}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              👉 今すぐチェック
              <span className={styles.ctaSub}>
                在庫あるうちに確認
              </span>
            </a>
          ) : (
            <div className={styles.ctaDisabled}>
              現在リンク準備中
            </div>
          )}

        </div>
      </div>
    </article>
  );
}

