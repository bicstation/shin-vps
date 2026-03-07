/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client'; // ✅ クライアントコンポーネント

import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdultProductGallery.module.css';

interface ProductGalleryProps {
  images: string[];
  title: string;
  apiSource?: string;
  sampleMovieData?: {
    url: string;
    preview_image: string;
  } | null;
}

/**
 * ==============================================================================
 * 🔞 AdultProductGallery - Omni-Expansion V6.2 (Next.js 15 Build Ready)
 * [DUGA_SCAP_PATTERN_FIX + FANZA_HI_RES + HYBRID_PLAYER]
 * ==============================================================================
 */
export default function AdultProductGallery({ images, title, apiSource, sampleMovieData }: ProductGalleryProps) {
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const sourceStr = (apiSource || '').toUpperCase();
  const isDuga = sourceStr === 'DUGA';
  const isFanza = sourceStr === 'FANZA' || sourceStr === 'DMM';

  // --- 🖼️ 1. 画像最適化ロジック (DUGA/FANZAの両方の複雑なパターンに対応) ---
  const displayThumbnails = useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    
    let processed = images.map((img) => {
      if (!img) return null;

      // ✅ DUGA修正:
      // サンプル(scap/)は維持し、ジャケット画像(120x90等)は最高画質(jacket.jpg)に変換
      if (isDuga && (img.includes('duga.jp') || img.includes('unsecure'))) {
        const isSample = img.includes('/scap/') || img.includes('/cap/');
        if (!isSample) {
          return img.replace(/\/(noauth\/)(.*)\.(jpg|png|jpeg)/i, '/$1jacket.jpg');
        }
        return img;
      }

      // ✅ FANZA / DMM修正:
      if (isFanza) {
        let p = img.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
        // サンプル画像 (-1.jpg 等) を高画質版 (-jp-1.jpg 等) に置換
        if (p.includes('-') && !p.includes('jp-') && !p.includes('pl.jpg')) {
          p = p.replace(/-(\d+)\.jpg/i, '-jp-$1.jpg');
        }
        return p;
      }

      return img;
    });

    // ✅ 重複除去 & ノイズ排除
    return processed.filter((img, index, self) => {
      if (!img) return false;
      if (self.indexOf(img) !== index) return false;
      
      const isNoise = img.includes('120x90') || img.includes('160x120');
      return !isNoise || index === 0;
    }).filter(Boolean) as string[];
  }, [images, isDuga, isFanza]);

  // --- 🎥 2. コンテンツ初期化 ---
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
          <p className="font-black">NO_VISUAL_DATA_ARCHIVED</p>
        </div>
      </div>
    );
  }

  const themeClass = isDuga ? styles.dugaTheme : isFanza ? styles.fanzaTheme : '';

  return (
    <div className={`${styles.galleryWrapper} ${themeClass}`}>
      {/* 1. メインディスプレイエリア */}
      <div className={styles.mainDisplayArea}>
        <div className={styles.imageContainer}>
          {isVideoActive ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {isFanza && currentContent.includes('dmm.co.jp') ? (
                /* FANZAプレイヤー (iFrame) */
                <iframe
                  src={currentContent}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  scrolling="no"
                />
              ) : (
                /* DUGAプレイヤー / 一般動画 (video) */
                <video 
                  key={currentContent}
                  src={currentContent}
                  poster={sampleMovieData?.preview_image || displayThumbnails[0]}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.mainVideo}
                />
              )}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#ff5e78] text-white text-[9px] font-black uppercase z-10 animate-pulse">
                Live_Stream
              </div>
            </div>
          ) : (
            <img 
              key={currentContent}
              src={currentContent} 
              alt={title} 
              className={styles.mainImage} 
              loading="eager"
              onError={(e) => {
                // セーフティネット: DUGAでjacket.jpgが404なら中画質にフォールバック
                if (isDuga && e.currentTarget.src.includes('jacket.jpg')) {
                  e.currentTarget.src = e.currentTarget.src.replace('jacket.jpg', '240x180.jpg');
                }
              }}
            />
          )}
          
          {/* サイバーパンクUI装飾 */}
          <div className={styles.mainOverlay} />
          <div className={styles.cornerBrackets} />
          <div className={styles.scanlineEffect} />
          <div className={styles.uiFrame} />

          <div className={styles.resolutionTag}>
            {isVideoActive ? (
              <span className={styles.livePulse}>● MODE: STREAM_PREVIEW_ACTIVE</span>
            ) : (
              <span>SOURCE: {sourceStr}_ARCHIVE_SCAN</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. サムネイルグリッドエリア */}
      <div className={styles.thumbnailGrid}>
        {/* 動画サムネイル */}
        {sampleMovieData?.url && (
          <button
            type="button"
            onClick={() => {
              setCurrentContent(sampleMovieData.url);
              setIsVideoActive(true);
            }}
            className={`${styles.thumbButton} ${isVideoActive ? styles.thumbButtonActive : ''} ${styles.videoThumb}`}
          >
            <div className="relative w-full h-full">
              <img 
                src={sampleMovieData.preview_image || displayThumbnails[0]} 
                alt="Preview" 
                className={styles.thumbImage} 
              />
              <div className={styles.videoIconOverlay}>▶</div>
            </div>
          </button>
        )}

        {/* 画像サムネイル一覧 */}
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
              className={`${styles.thumbButton} ${isActive ? styles.thumbButtonActive : ''}`}
            >
              <img src={img} alt="" className={styles.thumbImage} loading="lazy" />
              {isActive && <div className={styles.activeIndicator} />}
              <div className={styles.thumbScanline} />
            </button>
          );
        })}
      </div>
    </div>
  );
}