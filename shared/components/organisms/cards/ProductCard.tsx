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

const shorten = (text: string, max = 36) =>
  text.length > max ? text.slice(0, max) + '...' : text;

const mapLabel = (label?: string) => {
  if (!label) return '';
  if (label.includes('ハイエンド')) return '🚀 ハイスペック';
  if (label.includes('ゲーミング')) return '🎮 ゲーム最強';
  if (label.includes('コスパ')) return '💰 コスパ良';
  return label;
};

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title = shorten(product.title || 'おすすめ商品');
  const image = product.image || '/no-image.png';
  const price = product.price ?? 0;
  const url = product.url || '';
  const label = mapLabel(product.label);
  const mainTag = product.tags?.[0]; // 👈 1つだけ

  return (
    <article className={styles.card}>

      {/* 🔥 ラベル（役割化） */}
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
          onError={(e) => (e.currentTarget.src = '/no-image.png')}
        />

        <div className={styles.body}>
          
          {/* 🏷 タイトル（短縮） */}
          <h3 className={styles.title}>
            {title}
          </h3>

          {/* 🏷 タグ（1つだけ） */}
          {mainTag && (
            <div className={styles.tags}>
              {mainTag}
            </div>
          )}

          {/* 💰 価格 */}
          <div className={styles.price}>
            ¥{price.toLocaleString()}
          </div>

          {/* 🚀 CTA（強化） */}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              👉 今すぐ確認
              <span className={styles.ctaSub}>
                在庫あるうちにチェック
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