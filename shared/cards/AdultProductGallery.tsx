'use client'; // ✅ 最上部に配置

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

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
 * 🔞 AdultProductGallery - Omni-Expansion V5.8
 * [DUGA_ULTRA_RES + FANZA_IFRAME_SWITCH + ERROR_RESILIENCE]
 * ==============================================================================
 */
export default function AdultProductGallery({ images, title, apiSource, sampleMovieData }: ProductGalleryProps) {
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const sourceStr = (apiSource || '').toUpperCase();
  const isDuga = sourceStr === 'DUGA';
  const isFanza = sourceStr === 'FANZA' || sourceStr === 'DMM';

  // --- 🖼️ 1. 高画質化・重複除去・最適化ロジック (完全版) ---
  const displayThumbnails = useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    
    let processed = images.map(img => {
      // ✅ DUGA: 徹底的な高画質化 (jacket.jpgへの強制変換)
      if (isDuga && (img.includes('duga.jp') || img.includes('unsecure'))) {
        const dugaPattern = /(unsecure\/[^/]+\/[^/]+\/noauth\/)(.*)\.(jpg|png|jpeg)/i;
        if (dugaPattern.test(img)) {
          return img.replace(dugaPattern, '$1jacket.jpg');
        }
        // パターン外でもサイズ指定があれば置換
        return img.replace(/\/\d+x\d+\.jpg/i, '/jacket.jpg').replace(/jacket_\d+\.jpg/i, 'jacket.jpg');
      }

      // ✅ FANZA / DMM: 高画質フラグ (pl.jpg / _l.jpg)
      if (isFanza) {
        return img.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
      }

      return img;
    });

    // ✅ 重複除去 & ゴミ画像（極小サムネイル）の排除
    return processed.filter((img, index, self) => {
      if (!img) return false;
      // 置換の結果同じURLになったものを統合
      if (self.indexOf(img) !== index) return false;
      
      // DUGAの極小バナー等のノイズを除去
      const isNoise = img.includes('120x90') || img.includes('160x120') || img.includes('_120.jpg');
      // ただし、画像がそれしかない場合は残すためのロジック
      return !isNoise || processed.length === 1;
    });
  }, [images, isDuga, isFanza]);

  // --- 🎥 2. コンテンツ初期化ロジック ---
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
                /* FANZA/DMM特有のiframeプレイヤー対応 */
                <iframe
                  src={currentContent}
                  className="w-full h-full border-none shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  scrolling="no"
                />
              ) : (
                /* DUGA及び直接mp4等のビデオタグ対応 */
                <video 
                  key={currentContent}
                  src={currentContent}
                  poster={sampleMovieData?.preview_image || (displayThumbnails.length > 0 ? displayThumbnails[0] : '')}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.mainVideo}
                />
              )}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#ff5e78] text-white text-[9px] font-black uppercase tracking-widest z-10 animate-pulse">
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
                // 💡 セーフティネット: jacket.jpgが404なら中画質に落として再試行
                if (isDuga && e.currentTarget.src.includes('jacket.jpg')) {
                  e.currentTarget.src = e.currentTarget.src.replace('jacket.jpg', '240x180.jpg');
                }
              }}
              style={{ 
                // @ts-ignore
                imageRendering: isDuga ? 'crisp-edges' : 'auto' 
              }}
            />
          )}
          
          {/* 💡 サイバーパンク装飾レイヤー (Omni-Expansion仕様) */}
          <div className={styles.mainOverlay} />
          <div className={styles.cornerBrackets} />
          <div className={styles.scanlineEffect} />
          <div className={styles.uiFrame} />

          <div className={styles.resolutionTag}>
            {isVideoActive ? (
              <span className={styles.livePulse}>● MODE: STREAM_PREVIEW_ACTIVE</span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                SOURCE: {isDuga ? 'DUGA_ULTRA_HD_SCAN' : isFanza ? 'FANZA_4K_MASTER' : 'CORE_ARCHIVE'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. サムネイルグリッドエリア */}
      <div className={styles.thumbnailGrid}>
        {/* 🎬 動画サムネイル (常に先頭) */}
        {sampleMovieData?.url && (
          <button
            type="button"
            onClick={() => {
              setCurrentContent(sampleMovieData.url);
              setIsVideoActive(true);
            }}
            className={`${styles.thumbButton} ${isVideoActive ? styles.thumbButtonActive : styles.thumbButtonDefault} ${styles.videoThumb}`}
          >
            <div className="relative w-full h-full">
              <img 
                src={sampleMovieData.preview_image || (displayThumbnails.length > 0 ? displayThumbnails[0] : '')} 
                alt="Preview" 
                className={styles.thumbImage} 
              />
              <div className={styles.videoIconOverlay}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/80 text-[7px] px-1 font-bold text-white uppercase tracking-tighter">Sample</div>
            </div>
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
              <div className={styles.thumbScanline} />
            </button>
          );
        })}
      </div>
    </div>
  );
}