/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';

interface ProductCardProps {
  product: any;
}

export default function AdultProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // --- 💡 DUGA判定 ---
  const isDuga = product.api_source === 'DUGA';

  // --- 💡 画像最適化ロジック ---
  const thumbnail = useMemo(() => {
    const rawUrl = product.image_url_list?.[0] || product.image_url || '/no-image.png';

    if (rawUrl === '/no-image.png') return rawUrl;

    // DUGAはPython側で0番目にパッケージ画像を入れているので、そのまま使用
    if (isDuga) {
      return rawUrl;
    }

    // その他（FANZA等）のフォールバック
    let highRes = rawUrl.replace(/p[s|t]\.jpg/i, 'pl.jpg');
    highRes = highRes.replace('_m.jpg', '_l.jpg');
    return highRes;
  }, [product.image_url_list, product.image_url, product.api_source]);

  // --- 🎥 動画プレビューデータ (モデルのJSONField対応) ---
  const movieData = useMemo(() => {
    const rawMovie = product.sample_movie_url;
    // JSONField(辞書)として保存されている場合
    if (rawMovie && typeof rawMovie === 'object' && !Array.isArray(rawMovie)) {
      return {
        url: rawMovie.url || null,
        preview_image: rawMovie.preview_image || null
      };
    }
    // 古いデータが単なる文字列URLとして残っている場合のフォールバック
    if (typeof rawMovie === 'string' && rawMovie.startsWith('http')) {
      return { url: rawMovie, preview_image: null };
    }
    return { url: null, preview_image: null };
  }, [product.sample_movie_url]);

  const hasVideo = !!movieData.url;

  // --- 属性データの抽出 ---
  const genres = product.genres || [];
  const actors = product.actresses || [];
  const attributes = product.attributes || []; 
  const series = product.series || null;
  const maker = product.maker || null;
  const score = product.spec_score || 0; 
  
  const detailPath = '/adults';

  // タグのスタイル決定ロジック
  const getTagStyle = (name: string, type: 'genre' | 'actor' | 'series' | 'attribute') => {
    const genreColors = [
      { bg: 'bg-pink-900/40', text: 'text-pink-300', border: 'border-pink-500/30' },
      { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-500/30' },
      { bg: 'bg-indigo-900/40', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    ];
    const actorColors = [{ bg: 'bg-blue-900/50', text: 'text-blue-200', border: 'border-blue-400/40' }];
    const seriesColors = [{ bg: 'bg-amber-900/40', text: 'text-amber-200', border: 'border-amber-500/30' }];
    const attributeColors = [{ bg: 'bg-rose-950/60', text: 'text-rose-200', border: 'border-rose-500/40' }];

    let palette = genreColors;
    if (type === 'actor') palette = actorColors;
    else if (type === 'series') palette = seriesColors;
    else if (type === 'attribute') palette = attributeColors;

    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
    return palette[index];
  };

  return (
    <div 
      className={`${styles.cardContainer} ${isDuga ? styles.dugaTheme : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageSection}>
        <Link href={`${detailPath}/${product.id}`} className="block h-full w-full">
          {/* 💡 ホバー時に動画を表示 */}
          {isHovered && hasVideo ? (
            <video
              src={movieData.url!}
              poster={movieData.preview_image || thumbnail}
              autoPlay
              muted
              loop
              playsInline
              className={styles.thumbnail}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <img 
              src={thumbnail} 
              alt={product.title} 
              className={styles.thumbnail} 
              loading="lazy"
              style={{ 
                // @ts-ignore
                imageRendering: 'crisp-edges'
              }} 
            />
          )}
          
          <div className={styles.imageOverlay} />
          
          {/* AI解析スコアバッジ - DUGA時は色を変更 */}
          {score > 0 && (
            <div className={`absolute top-2 left-2 z-20 bg-black/70 backdrop-blur-md border px-2 py-0.5 rounded flex items-baseline gap-1 ${isDuga ? 'border-cyan-500/50' : 'border-pink-500/50'}`}>
              <span className={`text-[9px] font-bold ${isDuga ? 'text-cyan-400' : 'text-pink-400'}`}>SCORE</span>
              <span className="text-sm text-white font-black italic">{score}</span>
            </div>
          )}

          {/* ビデオ有無バッジ - DUGA時は色を変更 */}
          {hasVideo && (
            <div className={isDuga ? styles.sampleBadgeDuga : styles.sampleBadge}>
              <span className={styles.sampleDot}>●</span>
              {isHovered ? 'PREVIEWING' : 'SAMPLE'}
            </div>
          )}
        </Link>
        {/* APIソースバッジ - DUGA時は色を変更 */}
        <div className={isDuga ? styles.apiBadgeDuga : styles.apiBadge}>
          {product.api_source || 'PREMIUM'}
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className={styles.title}>
            <Link href={`${detailPath}/${product.id}`}>{product.title}</Link>
          </h3>
        </div>

        {product.ai_summary && (
          <p className="text-[10px] text-gray-400 line-clamp-1 mb-2 italic">
            " {product.ai_summary} "
          </p>
        )}

        <div className="space-y-2 mb-3">
          {/* 出演者 */}
          {actors.length > 0 && (
            <div className={styles.tagContainer}>
              {actors.slice(0, 2).map((actor: any) => {
                const style = getTagStyle(actor.name || 'Unknown', 'actor');
                return (
                  <Link key={actor.id} href={`/actress/${actor.id}`} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125`}>
                    👤 {actor.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* 属性属性（AI判定） */}
          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {attributes.slice(0, 3).map((attr: any) => {
                const style = getTagStyle(attr.name || 'Attr', 'attribute');
                return (
                  <span key={attr.id} className={`text-[9px] px-1.5 py-0 rounded-sm border ${style.bg} ${style.text} ${style.border} opacity-80`}>
                    {attr.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-0.5 mb-3">
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Maker</span>
            {maker ? (
              <Link href={`/maker/${maker.id}`} className={`${styles.infoLink} ${isDuga ? 'text-cyan-400' : 'text-cyan-300'}`}>{maker.name}</Link>
            ) : <span className="text-[11px] text-gray-600">Unknown</span>}
          </div>
          {series && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Series</span>
              <Link href={`/series/${series.id}`} className={`${styles.infoLink} text-amber-300/90`}>{series.name}</Link>
            </div>
          )}
        </div>

        {/* ジャンルタグ */}
        <div className="flex flex-wrap gap-1 mb-4 h-10 content-start overflow-hidden">
          {genres.slice(0, 4).map((genre: any) => {
            const style = getTagStyle(genre.name || 'Genre', 'genre');
            return (
              <Link key={genre.id} href={`/genre/${genre.id}`} className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} hover:scale-105 transition-transform`}>
                #{genre.name}
              </Link>
            );
          })}
        </div>

        <div className={styles.actionArea}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={styles.infoLabel}>Price</span>
              <span className={isDuga ? styles.priceTextDuga : styles.priceText}>
                {product.price ? `¥${product.price.toLocaleString()}` : 'CHECK PRICE'}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-gray-500 uppercase tracking-tighter">AI Spec Score</span>
              <div className="w-16 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${isDuga ? 'from-cyan-500 to-blue-500' : 'from-pink-500 to-purple-500'}`} 
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`${detailPath}/${product.id}`} className={isDuga ? styles.btnViewDuga : styles.btnView}>
              {hasVideo && <span className="text-xs">🎬</span>}
              VIEW DETAILS
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={isDuga ? styles.btnGetDuga : styles.btnGet}
            >
              <span>GET NOW</span>
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