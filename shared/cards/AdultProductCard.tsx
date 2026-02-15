/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';
import RadarChart from '@shared/ui/RadarChart';

interface ProductCardProps {
  product: any;
}

export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 💡 1. ソース判定 & パス生成 ---
  const apiSource = (product.api_source || 'FANZA').toUpperCase();
  const isDuga = apiSource === 'DUGA';
  const isFanza = apiSource === 'FANZA' || apiSource === 'DMM';
  
  const targetId = product.unique_id || product.product_id_unique || product.id;
  const detailPath = `/adults/${targetId}?source=${apiSource}`;

  const getIdentifier = (item: any) => {
    if (!item) return '';
    return item.slug && item.slug !== "null" ? item.slug : item.id;
  };

  // --- 💡 2. 画像ロジック (高画質化 & DUGA対応) ---
  const thumbnail = useMemo(() => {
    const rawUrl = product.image_url_list?.[0] || product.image_url;
    if (!rawUrl) return 'https://placehold.jp/24/333333/cccccc/400x600.png?text=NO%20IMAGE';

    if (isDuga) {
      const match = rawUrl.match(/unsecure\/([^/]+)\/([^/]+)\//);
      if (match) {
        const [_, labelId, workId] = match;
        return imgError 
          ? `https://pic.duga.jp/unsecure/${labelId}/${workId}/noauth/240x180.jpg`
          : `https://pic.duga.jp/unsecure/${labelId}/${workId}/noauth/jacket.jpg`;
      }
    }

    let highRes = rawUrl;
    if (/dmm\.(com|co\.jp)/i.test(rawUrl)) {
      highRes = highRes.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
    }
    return highRes;
  }, [product.image_url_list, product.image_url, isDuga, imgError]);

  // --- 💡 3. 動画・プレビューロジック ---
  const movieData = useMemo(() => {
    const rawMovie = product.sample_movie_url;
    if (rawMovie && typeof rawMovie === 'object') {
      return { url: rawMovie.url || null, preview: rawMovie.preview_image || null };
    }
    if (typeof rawMovie === 'string' && rawMovie.startsWith('http')) {
      return { url: rawMovie, preview: null };
    }
    return { url: null, preview: null };
  }, [product.sample_movie_url]);

  useEffect(() => {
    if (!isFanza && isHovered && movieData.url && videoRef.current) {
      videoRef.current.play().catch(() => {}); 
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, movieData.url, isFanza]);

  // --- 💡 4. レーダーチャート解析データ ---
  const getSafeScore = (val: any) => {
    const parsed = typeof val === 'number' ? val : parseInt(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const radarData = useMemo(() => [
    { subject: 'V', value: getSafeScore(product.score_visual), fullMark: 100 },
    { subject: 'S', value: getSafeScore(product.score_story), fullMark: 100 },
    { subject: 'E', value: getSafeScore(product.score_erotic), fullMark: 100 },
    { subject: 'R', value: getSafeScore(product.score_rarity), fullMark: 100 },
    { subject: 'C', value: getSafeScore(product.score_cost), fullMark: 100 },
  ], [product]);

  const releaseDate = product.release_date || '';
  const score = product.spec_score || 0;
  const actors = product.actresses || [];
  const genres = product.genres || [];

  return (
    <div 
      ref={containerRef}
      className={`${styles.cardContainer} ${isDuga ? styles.dugaTheme : isFanza ? styles.fanzaTheme : ''} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🖼️ 上部：イメージ＆プレビューエリア */}
      <div className={styles.imageSection}>
        <Link href={detailPath} className={styles.imageInnerLink}>
          {/* プレビュー動画 (Hover時) */}
          {movieData.url && isHovered ? (
            isFanza ? (
              <div className={styles.iframeWrapper}>
                <iframe
                  src={`${movieData.url}&autoplay=1&mute=1`}
                  className={styles.previewIframe}
                  allow="autoplay; fullscreen"
                  scrolling="no"
                />
              </div>
            ) : (
              <video
                ref={videoRef}
                src={movieData.url}
                muted loop playsInline
                className={styles.videoPreview}
              />
            )
          ) : (
            <>
              {/* スケルトンローダー */}
              {!isLoaded && (
                <div className={styles.skeleton}>
                   <div className={styles.skeletonText}>DECODING_VISUAL...</div>
                </div>
              )}
              <img 
                src={thumbnail} 
                alt={product.title} 
                className={`${styles.thumbnail} ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                  if (isDuga && !imgError) setImgError(true);
                  setIsLoaded(true);
                }}
              />
            </>
          )}

          {/* AI解析オーバーレイ (Hover時) */}
          {isHovered && (
            <div className={styles.analysisOverlay}>
              <div className={styles.radarWrapper}>
                <RadarChart data={radarData} hideAxis />
              </div>
              <div className={styles.analysisLabel}>AI_ANALYZED</div>
            </div>
          )}

          {/* 共通バッジ・スコア */}
          <div className={`${styles.sourceBadge} ${isDuga ? styles.dugaBg : isFanza ? styles.fanzaBg : ''}`}>
            {apiSource}
          </div>

          {score > 0 && !isHovered && (
            <div className={styles.scoreOverlay}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreVal}>{score}</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* 📝 下部：情報エリア */}
      <div className={styles.contentSection}>
        {/* 女優・メーカー行 */}
        <div className={styles.actressRow}>
          {actors.length > 0 ? (
            actors.slice(0, 2).map((actor: any) => (
              <Link key={actor.id} href={`/actress/${getIdentifier(actor)}`} className={styles.actressLink}>
                {actor.name}
              </Link>
            ))
          ) : product.maker ? (
            <Link href={`/maker/${getIdentifier(product.maker)}`} className={styles.actressLink}>
              {product.maker.name}
            </Link>
          ) : (
            <span className={styles.emptyText}>GENERIC_NODE</span>
          )}
        </div>

        {/* タイトル */}
        <h3 className={styles.title}>
          <Link href={detailPath} title={product.title}>
            {product.title}
          </Link>
        </h3>

        {/* AIサマリー (高さ固定を推奨) */}
        {product.ai_summary && (
          <div className={styles.aiSummary}>
            <p>"{product.ai_summary}"</p>
          </div>
        )}

        {/* メタ情報 */}
        <div className={styles.metaGrid}>
          {product.maker && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>MAKER</span>
              <Link href={`/maker/${getIdentifier(product.maker)}`} className={styles.metaLink}>
                {product.maker.name}
              </Link>
            </div>
          )}
          {releaseDate && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>RELEASE</span>
              <span className={styles.metaValue}>{releaseDate.replace(/-/g, '/')}</span>
            </div>
          )}
        </div>

        {/* ジャンルタグ */}
        <div className={styles.genreRow}>
          {genres.slice(0, 4).map((genre: any) => (
            <Link key={genre.id} href={`/genre/${getIdentifier(genre)}`} className={styles.genreTag}>
              #{genre.name}
            </Link>
          ))}
        </div>

        {/* フッターアクション */}
        <div className={styles.footerArea}>
          <div className={styles.priceContainer}>
            <span className={styles.priceSymbol}>¥</span>
            <span className={styles.priceValue}>
              {product.price ? product.price.toLocaleString() : '---'}
            </span>
          </div>

          <div className={styles.buttonGroup}>
            <Link href={detailPath} className={styles.detailsBtn}>
              DETAILS
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={isDuga ? styles.buyBtnDuga : isFanza ? styles.buyBtnFanza : styles.buyBtnDefault}
            >
              OFFICIAL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}