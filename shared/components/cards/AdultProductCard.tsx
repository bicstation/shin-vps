/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck
// /home/maya/dev/shin-vps/shared/components/cards/AdultProductCard.tsx
import React from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';

export default function ProductCard({ product }: { product: any }) {
  const thumbnail = product.image_url_list?.[0] || '/no-image.png';
  const genres = product.genres || [];
  const actors = product.actresses || [];
  const series = product.series || null;
  const maker = product.maker || null;
  const detailPath = '/adults'; 

  const getTagStyle = (name: string, type: 'genre' | 'actor' | 'series') => {
    // ... (色分けロジックはそのまま維持)
    const genreColors = [
      { bg: 'bg-pink-900/40', text: 'text-pink-300', border: 'border-pink-500/30' },
      { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-500/30' },
      { bg: 'bg-cyan-900/40', text: 'text-cyan-300', border: 'border-cyan-500/30' },
      { bg: 'bg-teal-900/40', text: 'text-teal-300', border: 'border-teal-500/30' },
    ];
    const actorColors = [{ bg: 'bg-blue-900/50', text: 'text-blue-200', border: 'border-blue-400/40' }];
    const seriesColors = [{ bg: 'bg-amber-900/40', text: 'text-amber-200', border: 'border-amber-500/30' }];
    let palette = type === 'actor' ? actorColors : type === 'series' ? seriesColors : genreColors;
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
    return palette[index];
  };

  return (
    <div className={styles.cardContainer}>
      {/* 画像セクション */}
      <div className={styles.imageSection}>
        <Link href={`${detailPath}/${product.id}`} className="block h-full w-full">
          <img src={thumbnail} alt={product.title} className={styles.thumbnail} loading="lazy" />
          <div className={styles.imageOverlay} />
        </Link>
        <div className={styles.apiBadge}>{product.api_source || 'PREMIUM'}</div>
      </div>

      {/* コンテンツセクション */}
      <div className={styles.contentSection}>
        <h3 className={styles.title}>
          <Link href={`${detailPath}/${product.id}`}>{product.title}</Link>
        </h3>

        {/* メーカー & シリーズ */}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Maker</span>
          {maker ? (
            <Link href={`/maker/${maker.id}`} className={`${styles.infoLink} text-[#99e0ff]`}>{maker.name}</Link>
          ) : <span className="text-[11px] text-gray-600 italic">Unknown</span>}
        </div>

        {series && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Series</span>
            <Link href={`/series/${series.id}`} className={`${styles.infoLink} text-amber-400/90 hover:underline`}>{series.name}</Link>
          </div>
        )}

        {/* 出演者 */}
        {actors.length > 0 && (
          <div className={styles.tagContainer}>
            {actors.slice(0, 2).map((actor: any) => {
              const style = getTagStyle(actor.name, 'actor');
              return (
                <Link key={actor.id} href={`/actress/${actor.id}`} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125`}>
                  👤 {actor.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* ジャンル */}
        <div className={`${styles.tagContainer} h-12 content-start`}>
          {genres.slice(0, 4).map((genre: any) => {
            const style = getTagStyle(genre.name, 'genre');
            return (
              <Link key={genre.id} href={`/genre/${genre.id}`} className={`text-[9px] font-black px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125 hover:scale-105`}>
                #{genre.name}
              </Link>
            );
          })}
        </div>

        {/* アクションエリア */}
        <div className={styles.actionArea}>
          <div className="mb-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className={styles.infoLabel}>Price</span>
              <span className={styles.priceText}>{product.price ? `¥${product.price.toLocaleString()}` : 'FREE'}</span>
            </div>
            <div className="text-[#ff9d00] text-[12px] font-bold">★★★★★</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`${detailPath}/${product.id}`} className={styles.btnView}>VIEW DETAILS</Link>
            <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer" className={styles.btnGet}>
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