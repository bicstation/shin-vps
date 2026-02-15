/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import styles from '../ProductDetail.module.css';

export default function VisualHeroColumn({ product, source }) {
  const isDuga = source === 'DUGA';
  const isFanza = source === 'FANZA' || source === 'DMM';

  // 画像・動画の正規化ロジックをコンポーネント内に閉じ込める
  let jacketImage = product.image_url_list?.[0] || product.image_url || '/placeholder.png';
  if (isDuga) jacketImage = jacketImage.replace(/jacket_\d+\.jpg/i, 'jacket.jpg');
  else if (isFanza) jacketImage = jacketImage.replace(/p[s|t|m]\.jpg/i, 'pl.jpg');

  const movieData = product.sample_movie_url ? (
    typeof product.sample_movie_url === 'string' 
      ? { url: product.sample_movie_url, preview_image: jacketImage }
      : { url: product.sample_movie_url.url, preview_image: product.sample_movie_url.preview_image || jacketImage }
  ) : null;

  return (
    <section className={styles.visualHeroSection}>
      <div className={styles.visualGrid}>
        {/* 左側：メインジャケット */}
        <div className={styles.jacketColumn}>
          <div className={styles.jacketWrapper}>
            <img 
              src={jacketImage} 
              alt={product.title} 
              className={styles.jacketImage} 
              loading="eager" // LCP向上のため
            />
            <div className={styles.scanline} />
            <div className={styles.cornerMarker} />
          </div>
        </div>

        {/* 右側：ギャラリー・サンプル動画 */}
        <div className={styles.galleryColumn}>
          <AdultProductGallery 
            images={product.image_url_list || [jacketImage]} 
            title={product.title} 
            apiSource={source} 
            sampleMovieData={movieData} 
          />
        </div>
      </div>
    </section>
  );
}