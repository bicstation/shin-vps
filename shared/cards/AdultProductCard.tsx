/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';
import RadarChart from '@shared/ui/RadarChart'; // レーダーチャートをインポート

interface ProductCardProps {
  product: any;
}

/**
 * 🛰️ AdultProductCard - Ultimate Unified Edition
 * [IFRAME_PREVIEW + MINI_RADAR_INTEGRATED + FULL_LOGIC]
 */
export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- 💡 1. ソース判定 & ターゲットID設定 ---
  const apiSource = (product.api_source || 'FANZA').toUpperCase();
  const isDuga = apiSource === 'DUGA';
  const isFanza = apiSource === 'FANZA' || apiSource === 'DMM';
  
  const targetId = product.unique_id || product.product_id_unique || product.id;
  const detailPath = `/adults/${targetId}?source=${apiSource}`;

  const getIdentifier = (item: any) => {
    if (!item) return '';
    return item.slug && item.slug !== "null" ? item.slug : item.id;
  };

  // --- 💡 2. 画像ロジック (pl.jpg / _l.jpg 強制) ---
  const thumbnail = useMemo(() => {
    const rawUrl = product.image_url_list?.[0] || product.image_url;
    if (!rawUrl) return 'https://placehold.jp/24/333333/cccccc/400x600.png?text=NO%20IMAGE';

    const isDmmHost = /dmm\.(com|co\.jp)/i.test(rawUrl);
    let highRes = rawUrl;

    if (isDmmHost) {
      highRes = highRes.replace(/p[s|t|m]\.jpg/i, 'pl.jpg');
      highRes = highRes.replace(/_[s|m]\.jpg/i, '_l.jpg');
    }
    return highRes;
  }, [product.image_url_list, product.image_url]);

  // --- 💡 3. 動画・プレビューロジック (iframe対応) ---
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

  // DUGA等のmp4用play/pause
  useEffect(() => {
    if (!isFanza && isHovered && movieData.url && videoRef.current) {
      videoRef.current.play().catch(() => {}); 
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, movieData.url, isFanza]);

  // --- 💡 4. レーダーチャート用データの正規化 ---
  const getSafeScore = (val: any) => {
    if (typeof val === 'number') return val;
    const parsed = parseInt(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const radarData = useMemo(() => [
    { subject: 'V', value: getSafeScore(product.score_visual), fullMark: 100 },
    { subject: 'S', value: getSafeScore(product.score_story), fullMark: 100 },
    { subject: 'E', value: getSafeScore(product.score_erotic), fullMark: 100 },
    { subject: 'R', value: getSafeScore(product.score_rarity), fullMark: 100 },
    { subject: 'C', value: getSafeScore(product.score_cost), fullMark: 100 },
  ], [product]);

  // --- 💡 5. メタデータ抽出 ---
  const releaseDate = product.release_date || '';
  const score = product.spec_score || 0;
  const actors = product.actresses || [];
  const genres = product.genres || [];

  return (
    <div 
      className={`${styles.cardContainer} ${isDuga ? styles.dugaTheme : isFanza ? styles.fanzaTheme : ''} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🖼️ 画像・プレビューエリア */}
      <div className={styles.imageSection}>
        <Link href={detailPath} className="block h-full w-full relative overflow-hidden bg-[#0a0a0a]">
          
          {/* 🎥 動画プレビュー分岐 */}
          {movieData.url && isHovered ? (
            isFanza ? (
              /* FANZA/DMM: iframe埋め込みプレイヤー (ホバー時) */
              <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
                <iframe
                  src={`${movieData.url}&autoplay=1&mute=1`}
                  className="w-full h-full border-none scale-110"
                  allow="autoplay; fullscreen"
                  scrolling="no"
                ></iframe>
              </div>
            ) : (
              /* DUGA/Others: 通常のvideoタグ (ホバー時) */
              <video
                ref={videoRef}
                src={movieData.url}
                muted loop playsInline
                className={`${styles.videoPreview} opacity-100 scale-105`}
              />
            )
          ) : (
            /* 通常時: サムネイル画像 */
            <img 
              src={thumbnail} 
              alt={product.title} 
              className={`${styles.thumbnail} opacity-100`} 
              loading="lazy"
            />
          )}

          {/* 📊 ホバー時に表示されるミニ・レーダーチャート */}
          {isHovered && (
            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center animate-in fade-in duration-300">
              <div className="w-24 h-24">
                <RadarChart data={radarData} hideAxis /> {/* 小型化用のプロップスを想定 */}
              </div>
              <div className="absolute bottom-2 text-[8px] font-black text-[#e94560] tracking-widest uppercase">AI_ANALYZED</div>
            </div>
          )}

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

          {movieData.url && !isHovered && (
            <div className={styles.playIndicator}>
              <div className={styles.playIcon} />
            </div>
          )}
        </Link>
      </div>

      {/* 📝 コンテンツエリア */}
      <div className={styles.contentSection}>
        <div className={styles.actressRow}>
          {actors.length > 0 ? (
            actors.slice(0, 3).map((actor: any) => (
              <Link key={actor.id} href={`/actress/${getIdentifier(actor)}`} className={styles.actressLink}>
                {actor.name}
              </Link>
            ))
          ) : (
            <span className={styles.emptyText}>Actress Unknown</span>
          )}
        </div>

        <h3 className={styles.title}>
          <Link href={detailPath} title={product.title}>
            {product.title}
          </Link>
        </h3>

        {product.ai_summary && (
          <div className={styles.aiSummary}>
            <p>"{product.ai_summary}"</p>
          </div>
        )}

        <div className={styles.metaGrid}>
          {product.maker && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>MAKER</span>
              <Link href={`/maker/${getIdentifier(product.maker)}`} className={styles.metaLink}>
                {product.maker.name}
              </Link>
            </div>
          )}
          {product.series && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>SERIES</span>
              <Link href={`/series/${getIdentifier(product.series)}`} className={styles.metaLink}>
                {product.series.name}
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

        <div className={styles.genreRow}>
          {genres.slice(0, 5).map((genre: any) => (
            <Link key={genre.id} href={`/genre/${getIdentifier(genre)}`} className={styles.genreTag}>
              #{genre.name}
            </Link>
          ))}
        </div>

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
              className={isDuga ? styles.buyBtnDuga : isFanza ? styles.buyBtnFanza : ''}
            >
              OFFICIAL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}