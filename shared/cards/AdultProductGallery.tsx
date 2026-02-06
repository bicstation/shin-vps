'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdultProductGallery.module.css';

export default function ProductGallery({ images, title }: { images: string[], title: string }) {
  // 💡 修正1: 初期値に images[0] を直接設定
  // これにより、サーバーサイドでも最初から1枚目の画像がレンダリングされます
  const [mainImage, setMainImage] = useState<string>(images?.[0] || '');

  // 💡 修正2: images プロパティが後から変わった場合（ページ遷移など）への対応
  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return <div className={styles.noImage}>画像がありません</div>;
  }

  return (
    <div className={styles.galleryWrapper}>
      {/* メイン画像表示エリア */}
      <div className={styles.mainDisplayArea}>
        {/* 💡 mainImage が空でないことを確認しつつ表示 */}
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={title} 
            className={styles.mainImage} 
            // 💡 ページ読み込み時のLCP対策（任意）
            loading="eager"
          />
        ) : (
          <div className={styles.placeholder}>Loading...</div>
        )}
      </div>

      {/* サブ画像リスト（ギャラリー） */}
      <div className={styles.thumbnailGrid}>
        {images.map((img, idx) => {
          const isActive = mainImage === img;
          return (
            <button
              key={`${idx}-${img}`}
              type="button"
              onClick={() => setMainImage(img)}
              className={`${styles.thumbButton} ${
                isActive ? styles.thumbButtonActive : styles.thumbButtonDefault
              }`}
            >
              <img 
                src={img} 
                alt={`${title} thumb ${idx}`}
                className={styles.thumbImage} 
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}