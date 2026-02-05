'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdultProductGallery.module.css';

export default function ProductGallery({ images, title }: { images: string[], title: string }) {
  const [mainImage, setMainImage] = useState<string>('');

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
        {mainImage && (
          <img 
            src={mainImage} 
            alt={title} 
            className={styles.mainImage} 
          />
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
              onClick={() => {
                console.log('Clicked image:', img);
                setMainImage(img);
              }}
              className={`${styles.thumbButton} ${
                isActive ? styles.thumbButtonActive : styles.thumbButtonDefault
              }`}
            >
              <img 
                src={img} 
                alt={`${title} thumb ${idx}`}
                className={styles.thumbImage} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}