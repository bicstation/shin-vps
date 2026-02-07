/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdultProductGallery.module.css';

interface ProductGalleryProps {
  images: string[];
  title: string;
  apiSource?: string;
  // 💡 モデルのJSONデータを受け取る
  sampleMovieData?: {
    url: string;
    preview_image: string;
  } | null;
}

export default function AdultProductGallery({ images, title, apiSource, sampleMovieData }: ProductGalleryProps) {
  // メインエリアに表示中のコンテンツ（URL）
  const [currentContent, setCurrentContent] = useState<string>('');
  // 表示中なのが動画かどうか
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  // --- 💡 DUGA専用のフィルタリングロジック ---
  const displayThumbnails = useMemo(() => {
    if (!images) return [];
    if (apiSource !== 'DUGA') return images;

    return images.filter((img, index) => {
      if (index === 0) return true; // メインジャケットは残す
      
      const isDugaRedundant = 
        img.includes('_120') || 
        img.includes('_240') || 
        img.includes('160x120') || 
        img.includes('120x90') ||
        (img.includes('jacket_') && !img.endsWith('jacket.jpg')); 
        
      return !isDugaRedundant;
    });
  }, [images, apiSource]);

  // 初期表示の設定（動画があれば動画、なければ画像）
  useEffect(() => {
    if (sampleMovieData?.url) {
      setCurrentContent(sampleMovieData.url);
      setIsVideoActive(true);
    } else if (displayThumbnails.length > 0) {
      setCurrentContent(displayThumbnails[0]);
      setIsVideoActive(false);
    }
  }, [displayThumbnails, sampleMovieData]);

  if (!displayThumbnails.length && !sampleMovieData?.url) {
    return (
      <div className={styles.galleryWrapper}>
        <div className={styles.noImage}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>NO VISUAL DATA ARCHIVED</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryWrapper}>
      {/* 1. メインディスプレイエリア */}
      <div className={styles.mainDisplayArea}>
        <div className={styles.imageContainer}>
          {isVideoActive ? (
            <video 
              src={currentContent}
              poster={sampleMovieData?.preview_image || displayThumbnails[0]}
              controls
              autoPlay
              muted
              className={styles.mainVideo}
            />
          ) : (
            <img 
              src={currentContent} 
              alt={title} 
              className={styles.mainImage} 
              style={{ 
                // @ts-ignore
                imageRendering: 'crisp-edges'
              }}
            />
          )}
          
          <div className={styles.mainOverlay} />
          <div className={styles.cornerBrackets} />
          <div className={styles.resolutionTag}>
            {isVideoActive ? 'MODE: LIVE_PREVIEW' : `SOURCE: ${apiSource === 'DUGA' ? 'DUGA_HIGH_RES' : 'STANDARD_STREAM'}`}
          </div>
        </div>
      </div>

      {/* 2. サムネイルリスト */}
      <div className={styles.thumbnailGrid}>
        {/* 🎬 動画サムネイル（存在する場合のみ先頭に表示） */}
        {sampleMovieData?.url && (
          <button
            type="button"
            onClick={() => {
              setCurrentContent(sampleMovieData.url);
              setIsVideoActive(true);
            }}
            className={`${styles.thumbButton} ${isVideoActive ? styles.thumbButtonActive : styles.thumbButtonDefault} ${styles.videoThumb}`}
          >
            <img src={sampleMovieData.preview_image || displayThumbnails[0]} alt="Video Preview" className={styles.thumbImage} />
            <div className={styles.videoIconOverlay}>▶</div>
            <span className={styles.videoLabel}>VIDEO</span>
          </button>
        )}

        {/* 📸 画像サムネイル一覧 */}
        {displayThumbnails.map((img, idx) => {
          const isActive = !isVideoActive && currentContent === img;
          return (
            <button
              key={`${idx}-${img}`}
              type="button"
              onClick={() => {
                setCurrentContent(img);
                setIsVideoActive(false);
              }}
              className={`${styles.thumbButton} ${
                isActive ? styles.thumbButtonActive : styles.thumbButtonDefault
              }`}
            >
              <img src={img} alt="" className={styles.thumbImage} loading="lazy" />
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}