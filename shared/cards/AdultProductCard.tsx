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
 * 🛰️ AdultProductCard - Matrix Edition (Video Fixed)
 * FANZAのリファラ制限を回避し、プレビュー動画を確実に再生させる修正版
 */
export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- 💡 APIソース判定 ---
  const apiSource = product.api_source || 'FANZA';
  const isDuga = apiSource === 'DUGA';

  // --- 💡 画像最適化ロジック ---
  const thumbnail = useMemo(() => {
    const rawUrl = product.image_url_list?.[0] || product.image_url || '/no-image.png';
    if (rawUrl === '/no-image.png') return rawUrl;

    if (isDuga) return rawUrl;

    // FANZA等のサムネイルをラージサイズに置換
    let highRes = rawUrl.replace(/p[s|t]\.jpg/i, 'pl.jpg');
    highRes = highRes.replace('_m.jpg', '_l.jpg');
    return highRes;
  }, [product.image_url_list, product.image_url, isDuga]);

  // --- 💡 動画再生ロジック（重要：FANZA対応） ---
  const movieData = useMemo(() => {
    const rawMovie = product.sample_movie_url;
    
    // JSONField(オブジェクト)対応
    if (rawMovie && typeof rawMovie === 'object' && !Array.isArray(rawMovie)) {
      return {
        url: rawMovie.url || null,
        preview_image: rawMovie.preview_image || null
      };
    }
    // 文字列URLフォールバック
    if (typeof rawMovie === 'string' && rawMovie.startsWith('http')) {
      return { url: rawMovie, preview_image: null };
    }
    return { url: null, preview_image: null };
  }, [product.sample_movie_url]);

  const hasVideo = !!movieData.url;

  // ホバー時にプログラムから再生を開始させる（ブラウザ制限の確実な回避）
  useEffect(() => {
    if (isHovered && hasVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Video auto-play failed. Referrer or Policy issue.", error);
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, hasVideo]);

  // --- 属性データの抽出 ---
  const genres = product.genres || [];
  const actors = product.actresses || [];
  const attributes = product.attributes || []; 
  const series = product.series;
  const maker = product.maker;
  const score = product.spec_score || 0; 
  const detailPath = '/adults';

  /**
   * 🎨 タグのカラーパレット生成
   */
  const getTagStyle = (name: string, type: 'genre' | 'actor' | 'series' | 'attribute') => {
    const paletteMap = {
      genre: [
        { bg: 'bg-pink-900/30', text: 'text-pink-300', border: 'border-pink-500/20' },
        { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-500/20' },
        { bg: 'bg-indigo-900/30', text: 'text-indigo-300', border: 'border-indigo-500/20' },
      ],
      actor: [{ bg: 'bg-blue-900/40', text: 'text-blue-200', border: 'border-blue-400/30' }],
      series: [{ bg: 'bg-amber-900/30', text: 'text-amber-200', border: 'border-amber-500/20' }],
      attribute: [{ bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/30' }]
    };

    const palette = paletteMap[type] || paletteMap.genre;
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
    return palette[index];
  };

  return (
    <div 
      className={`${styles.cardContainer} ${isDuga ? styles.dugaTheme : styles.fanzaTheme}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🖼️ 画像・プレビューセクション */}
      <div className={styles.imageSection}>
        <Link href={`${detailPath}/${product.id}`} className="block h-full w-full relative overflow-hidden">
          {/* 💡 FANZA再生の肝: 
              1. referrerPolicy="no-referrer" でリファラ制限を突破
              2. muted playsInline は必須
              3. Refを使用してEffectからPlayを叩く
          */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={movieData.url!}
              poster={movieData.preview_image || thumbnail}
              muted
              loop
              playsInline
              referrerPolicy="no-referrer"
              className={`${styles.thumbnail} ${isHovered ? 'opacity-100' : 'opacity-0'} absolute inset-0 z-10 transition-opacity duration-300 object-cover w-full h-full`}
            />
          )}
          
          <img 
            src={thumbnail} 
            alt={product.title} 
            className={`${styles.thumbnail} ${isHovered && hasVideo ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
            loading="lazy"
          />
          
          <div className={styles.imageOverlay} />
          
          {/* AI解析スコア */}
          {score > 0 && (
            <div className={`${styles.scoreBadge} ${isDuga ? styles.scoreDuga : styles.scoreFanza}`}>
              <span className={styles.scoreLabel}>AI_SCORE</span>
              <span className={styles.scoreValue}>{score}</span>
            </div>
          )}

          {/* ビデオ有無表示 */}
          {hasVideo && (
            <div className={isDuga ? styles.sampleBadgeDuga : styles.sampleBadge}>
              <span className={styles.sampleDot}>●</span>
              {isHovered ? 'PREVIEWING' : 'SAMPLE'}
            </div>
          )}
        </Link>

        {/* ソースラベル */}
        <div className={isDuga ? styles.apiBadgeDuga : styles.apiBadge}>
          {apiSource}
        </div>
      </div>

      {/* 📝 テキスト・情報セクション */}
      <div className={styles.contentSection}>
        <div className="mb-2">
          <h3 className={styles.title}>
            <Link href={`${detailPath}/${product.id}`}>{product.title}</Link>
          </h3>
        </div>

        {/* AI要約テキスト */}
        {product.ai_summary && (
          <div className={styles.summaryBox}>
            <p className={styles.summaryText}>
              "{product.ai_summary}"
            </p>
          </div>
        )}

        {/* メタタグエリア (出演者 & 属性) */}
        <div className="space-y-2 mb-4">
          {actors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {actors.slice(0, 2).map((actor: any) => {
                const style = getTagStyle(actor.name || 'Unknown', 'actor');
                return (
                  <Link 
                    key={actor.id} 
                    href={`/actress/${actor.id}`} 
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${style.bg} ${style.text} ${style.border} transition-all hover:bg-opacity-80`}
                  >
                    👤 {actor.name}
                  </Link>
                );
              })}
            </div>
          )}

          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {attributes.slice(0, 3).map((attr: any) => {
                const style = getTagStyle(attr.name || 'Attr', 'attribute');
                return (
                  <span key={attr.id} className={`text-[9px] font-medium px-1.5 py-0 rounded border ${style.bg} ${style.text} ${style.border} opacity-70`}>
                    {attr.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* メーカー & シリーズ */}
        <div className="space-y-1 mb-4 text-[11px]">
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Maker</span>
            {maker ? (
              <Link href={`/maker/${maker.id}`} className={styles.infoLink}>
                {maker.name}
              </Link>
            ) : <span className="text-gray-600">Unknown</span>}
          </div>
          {series && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Series</span>
              <Link href={`/series/${series.id}`} className={`${styles.infoLink} text-amber-400/80`}>
                {series.name}
              </Link>
            </div>
          )}
        </div>

        {/* ジャンルタグ (ハッシュタグ形式) */}
        <div className="flex flex-wrap gap-1 mb-6 h-10 content-start overflow-hidden">
          {genres.slice(0, 4).map((genre: any) => {
            const style = getTagStyle(genre.name || 'Genre', 'genre');
            return (
              <Link 
                key={genre.id} 
                href={`/genre/${genre.id}`} 
                className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} hover:border-white/40 transition-colors`}
              >
                #{genre.name}
              </Link>
            );
          })}
        </div>

        {/* 💳 アクション・価格エリア */}
        <div className={styles.actionArea}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={styles.priceLabel}>Access Fee</span>
              <span className={isDuga ? styles.priceTextDuga : styles.priceText}>
                {product.price ? `¥${product.price.toLocaleString()}` : 'MARKET PRICE'}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Spec Analysis</span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isDuga ? 'bg-cyan-500' : 'bg-[#e94560]'}`} 
                  style={{ width: isHovered ? `${score}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`${detailPath}/${product.id}`} className={isDuga ? styles.btnViewDuga : styles.btnView}>
              DETAILS
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={isDuga ? styles.btnGetDuga : styles.btnGet}
            >
              <span>GET</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}