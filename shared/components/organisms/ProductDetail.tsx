'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './ProductDetail.module.css';
import { getMediaUrl } from '@/shared/lib/utils/media';
import { getApiBase } from '@/shared/lib/config/api';

type Product = {
  unique_id?: string;
  title?: string;
  image?: string;
  price?: number;
  url?: string;
  tags?: string[]; // 🔥 修正：文字列配列
};

export default function ProductDetail({ product }: { product?: Product }) {
  const [related, setRelated] = useState<Product[]>([]);

  /**
   * 🔥 関連商品取得
   */
  useEffect(() => {
    if (!product?.unique_id) return;

    const fetchRelated = async () => {
      try {
        const base = getApiBase();
        const res = await fetch(
          `${base}/products/related/${product.unique_id}/?limit=4`
        );

        if (!res.ok) return;

        const data = await res.json();
        setRelated(Array.isArray(data) ? data : data?.results || []);
      } catch {
        // 無視
      }
    };

    fetchRelated();
  }, [product?.unique_id]);

  if (!product) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  const title = product.title || 'おすすめ商品';

  const price =
    typeof product.price === 'number'
      ? `¥${product.price.toLocaleString()}`
      : '---';

  const image = getMediaUrl(product.image);

  return (
    <div className={styles.wrapper}>

      {/* 🖼 画像 */}
      <img
        src={image}
        alt={title}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.src = '/no-image.png';
        }}
      />

      {/* 💬 キャッチ */}
      <div className={styles.catch}>
        迷ったらこれ
      </div>

      {/* 🏷 タイトル */}
      <h1 className={styles.title}>
        {title}
      </h1>

      {/* 💰 価格 */}
      <div className={styles.price}>
        {price}
      </div>

      {/* 🏷 タグ（最重要：CTA直前） */}
      {product?.tags?.length > 0 && (
        <div className={styles.tagWrapper}>
          {product.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 🚀 CTA */}
      <Link
        href={product.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        👉 最安値を見る
      </Link>

      {/* 🔥 後押し */}
      <div className={styles.sub}>
        在庫切れになる前にチェック
      </div>

      {/* 🔽 関連商品 */}
      {related.length > 0 && (
        <div className={styles.relatedSection}>

          <h2 className={styles.relatedTitle}>
            他の候補も見る
          </h2>

          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link
                key={item.unique_id}
                href={`/product/${item.unique_id}`}
                className={styles.relatedCard}
              >
                <img
                  src={getMediaUrl(item.image)}
                  alt={item.title}
                  className={styles.relatedImage}
                />

                <div className={styles.relatedName}>
                  {item.title}
                </div>

                <div className={styles.relatedPrice}>
                  {item.price
                    ? `¥${item.price.toLocaleString()}`
                    : ''}
                </div>
              </Link>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}