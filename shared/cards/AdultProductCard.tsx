/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';

interface ProductCardProps {
  product: any;
}

/**
 * 🛰️ AdultProductCard - Ultimate Unified Edition
 * 日本語スラグURL対応版
 */
export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- 💡 1. ソース判定 & ターゲットID設定 ---
  const apiSource = (product.api_source || 'FANZA').toUpperCase();
  const isDuga = apiSource === 'DUGA';
  const isDmm = apiSource === 'DMM';
  
  // 詳細ページはシステム固有のID（またはunique_id）を使用
  const targetId = product.unique_id || product.product_id_unique || product.id;
  const detailPath = `/adults/${targetId}?source=${apiSource}`;

  /**
   * ✅ 安全なURL識別子（スラグ）を取得するヘルパー
   * DB側の修正により、slugに日本語名が入っているため、それを優先します。
   */
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

  // --- 💡 3. 動画プレビューロジック ---
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
    if (isHovered && movieData.url && videoRef.current) {
      videoRef.current.play().catch(() => {}); 
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, movieData.url]);

  // --- 💡 4. メタデータ抽出 ---
  const releaseDate = product.release_date || '';
  const score = product.spec_score || 0;
  const actors = product.actresses || [];
  const genres = product.genres || [];

  return (
    <div 
      className={`${styles.cardContainer} ${isDuga ? styles.dugaTheme : isDmm ? styles.dmmTheme : styles.fanzaTheme} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🖼️ 画像・プレビューエリア */}
      <div className={styles.imageSection}>
        <Link href={detailPath} className="block h-full w-full relative overflow-hidden bg-[#0a0a0a]">
          {movieData.url && (
            <video
              ref={videoRef}
              src={movieData.url}
              poster={movieData.preview || thumbnail}
              muted loop playsInline
              referrerPolicy="no-referrer"
              className={`${styles.videoPreview} ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            />
          )}
          
          <img 
            src={thumbnail} 
            alt={product.title} 
            className={`${styles.thumbnail} ${isHovered && movieData.url ? 'opacity-0' : 'opacity-100'}`} 
            loading="lazy"
          />

          <div className={`${styles.sourceBadge} ${isDuga ? styles.dugaBg : isDmm ? styles.dmmBg : styles.fanzaBg}`}>
            {apiSource}
          </div>

          {score > 0 && (
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
        
        {/* A. 出演者リンク (Identifierをスラグに変更) */}
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

        {/* B. タイトル */}
        <h3 className={styles.title}>
          <Link href={detailPath} title={product.title}>
            {product.title}
          </Link>
        </h3>

        {/* C. AI要約 */}
        {product.ai_summary && (
          <div className={styles.aiSummary}>
            <p>"{product.ai_summary}"</p>
          </div>
        )}

        {/* D. 詳細メタデータ (Identifierをスラグに変更) */}
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
          {product.director && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>DIRECTOR</span>
              <Link href={`/director/${getIdentifier(product.director)}`} className={styles.metaLink}>
                {product.director.name}
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

        {/* E. ジャンルタグ (Identifierをスラグに変更) */}
        <div className={styles.genreRow}>
          {genres.slice(0, 5).map((genre: any) => (
            <Link key={genre.id} href={`/genre/${getIdentifier(genre)}`} className={styles.genreTag}>
              #{genre.name}
            </Link>
          ))}
        </div>

        {/* F. フッター (価格 & アクション) */}
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
              className={isDuga ? styles.buyBtnDuga : isDmm ? styles.buyBtnDmm : styles.buyBtnFanza}
            >
              OFFICIAL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}