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
 * 🛰️ AdultProductCard - Matrix Edition (ID & Image Optimized)
 * 1. リンク先を product_id_unique へ最適化
 * 2. DUGAを含む全ソースの画像を最高画質(pl.jpg / _l.jpg)へ強制変換
 */
export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- 💡 APIソース判定 ---
  const apiSource = (product.api_source || 'FANZA').toUpperCase();
  const isDuga = apiSource === 'DUGA';
  const isDmm = apiSource === 'DMM';

  // --- 💡 リンク先IDの決定 ---
  const targetId = product.product_id_unique || product.id;
  const detailPath = `/adults/${targetId}`;

  // --- 💡 画像・プレースホルダー最適化 (修正の核心部) ---
  const thumbnail = useMemo(() => {
    // 1. ソースURLの取得 (JSONリストの先頭、または単一フィールド)
    const rawUrl = product.image_url_list?.[0] || product.image_url;
    
    if (!rawUrl) {
      return 'https://placehold.jp/24/333333/cccccc/400x600.png?text=NO%20IMAGE%0A(DATA%20ONLY)';
    }

    // 2. DMMサーバー(pics.dmm.com / .co.jp)を参照しているかチェック
    const isDmmHost = rawUrl.includes('dmm.com') || rawUrl.includes('dmm.co.jp');

    // 3. 高画質化ロジック
    // DUGA経由であっても、DMMホストの画像であれば強制的に置換を実行する
    let highRes = rawUrl;

    if (isDmmHost) {
      // パターンA: ps.jpg または pt.jpg を pl.jpg (Large) に変換
      highRes = highRes.replace(/p[s|t]\.jpg/i, 'pl.jpg');
      
      // パターンB: DUGA等で見られる _m.jpg や _s.jpg を _l.jpg に変換
      highRes = highRes.replace(/_[m|s]\.jpg/i, '_l.jpg');
    }

    return highRes;
  }, [product.image_url_list, product.image_url, isDuga]);

  // --- 💡 動画再生ロジック ---
  const movieData = useMemo(() => {
    const rawMovie = product.sample_movie_url;
    
    if (rawMovie && typeof rawMovie === 'object' && !Array.isArray(rawMovie)) {
      return {
        url: rawMovie.url || null,
        preview_image: rawMovie.preview_image || null
      };
    }
    if (typeof rawMovie === 'string' && rawMovie.startsWith('http')) {
      return { url: rawMovie, preview_image: null };
    }
    return { url: null, preview_image: null };
  }, [product.sample_movie_url]);

  const hasVideo = !!movieData.url;

  useEffect(() => {
    if (isHovered && hasVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {}); 
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, hasVideo]);

  // 属性データの抽出
  const genres = product.genres || [];
  const actors = product.actresses || [];
  const maker = product.maker;
  const series = product.series;
  const score = product.spec_score || 0; 

  /**
   * 🎨 タグのカラーパレット生成
   */
  const getTagStyle = (name: string, type: 'genre' | 'actor' | 'series' | 'attribute') => {
    const paletteMap = {
      genre: [
        { bg: 'bg-pink-900/30', text: 'text-pink-300', border: 'border-pink-500/20' },
        { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-500/20' },
      ],
      actor: [{ bg: 'bg-blue-900/40', text: 'text-blue-200', border: 'border-blue-400/30' }],
      series: [{ bg: 'bg-amber-900/30', text: 'text-amber-200', border: 'border-amber-500/20' }],
      attribute: [{ bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/30' }]
    };
    const palette = paletteMap[type] || paletteMap.genre;
    const index = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
    return palette[index];
  };

  const themeClass = isDuga ? styles.dugaTheme : isDmm ? styles.dmmTheme : styles.fanzaTheme;

  return (
    <div 
      className={`${styles.cardContainer} ${themeClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🖼️ 画像セクション */}
      <div className={styles.imageSection} style={{ aspectRatio: '2 / 3', minHeight: '320px' }}>
        <Link href={detailPath} className="block h-full w-full relative overflow-hidden bg-black">
          {hasVideo && (
            <video
              ref={videoRef}
              src={movieData.url!}
              poster={movieData.preview_image || thumbnail}
              muted
              loop
              playsInline
              referrerPolicy="no-referrer"
              className={`${styles.thumbnail} ${isHovered ? 'opacity-100' : 'opacity-0'} absolute inset-0 z-10 transition-opacity duration-500 object-cover w-full h-full scale-105`}
            />
          )}
          
          <img 
            src={thumbnail} 
            alt={product.title} 
            className={`${styles.thumbnail} ${isHovered && hasVideo ? 'opacity-0 scale-110' : 'opacity-100 scale-100'} transition-all duration-700 object-cover w-full h-full`} 
            loading="lazy"
          />
          
          <div className={styles.imageOverlay} />
          
          {score > 0 && (
            <div className={`${styles.scoreBadge} ${isDuga ? styles.scoreDuga : isDmm ? styles.scoreDmm : styles.scoreFanza}`}>
              <span className={styles.scoreLabel}>AI_SCORE</span>
              <span className={styles.scoreValue}>{score}</span>
            </div>
          )}

          {hasVideo && (
            <div className={isDuga ? styles.sampleBadgeDuga : isDmm ? styles.sampleBadgeDmm : styles.sampleBadge}>
              <span className={styles.sampleDot}>●</span>
              {isHovered ? 'PREVIEWING' : 'SAMPLE'}
            </div>
          )}
        </Link>

        <div className={`${styles.apiBadge} ${isDuga ? styles.dugaBg : isDmm ? styles.dmmBg : styles.fanzaBg}`}>
          {apiSource}
        </div>
      </div>

      {/* 📝 テキスト・情報セクション */}
      <div className={styles.contentSection}>
        <div className="mb-2">
          <h3 className={styles.title}>
            <Link href={detailPath} className="line-clamp-2 leading-tight">
              {product.title}
            </Link>
          </h3>
        </div>

        {product.ai_summary && (
          <div className={styles.summaryBox}>
            <p className={styles.summaryText}>"{product.ai_summary}"</p>
          </div>
        )}

        <div className="space-y-2 mb-3">
          {actors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {actors.slice(0, 3).map((actor: any) => {
                const style = getTagStyle(actor.name, 'actor');
                return (
                  <Link key={actor.id} href={`/actress/${actor.id}`} 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125`}>
                    👤 {actor.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1 mb-3 text-[11px] border-l-2 border-white/10 pl-2">
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Maker:</span>
            {maker ? (
              <Link href={`/maker/${maker.id}`} className={styles.infoLink}>{maker.name}</Link>
            ) : <span className="text-gray-600 italic">Unlisted</span>}
          </div>
          {series && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Series:</span>
              <Link href={`/series/${series.id}`} className={`${styles.infoLink} text-amber-400/80`}>{series.name}</Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4 h-9 content-start overflow-hidden opacity-80">
          {genres.slice(0, 5).map((genre: any) => {
            const style = getTagStyle(genre.name, 'genre');
            return (
              <Link key={genre.id} href={`/genre/${genre.id}`} 
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} hover:border-white/40`}>
                #{genre.name}
              </Link>
            );
          })}
        </div>

        <div className={styles.actionArea}>
          <div className="mb-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className={styles.priceLabel}>Price</span>
              <span className={isDuga ? styles.priceTextDuga : isDmm ? styles.priceTextDmm : styles.priceText}>
                {product.price ? `¥${product.price.toLocaleString()}` : 'OPEN PRICE'}
              </span>
            </div>
            
            <div className="flex flex-col items-end pb-1">
              <span className="text-[7px] text-gray-500 uppercase font-black">AI Spec Level</span>
              <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isDuga ? 'bg-cyan-500' : isDmm ? 'bg-amber-500' : 'bg-[#e94560]'}`} 
                  style={{ width: isHovered ? `${score}%` : '15%' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Link href={detailPath} className={isDuga ? styles.btnViewDuga : isDmm ? styles.btnViewDmm : styles.btnView}>
              DETAILS
            </Link>
            <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer" 
               className={isDuga ? styles.btnGetDuga : isDmm ? styles.btnGetDmm : styles.btnGet}>
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