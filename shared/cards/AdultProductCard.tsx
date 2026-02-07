/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import styles from './AdultProductCard.module.css';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  // --- 💡 画像のボケ対策ロジック ---
  const rawThumbnail = product.image_url_list?.[0] || product.image_url || '/no-image.png';
  
  const getHighResThumbnail = (url: string) => {
    if (!url) return '/no-image.png';
    // FANZA: ps/pt(小) -> pl(大)
    let highRes = url.replace(/p[s|t]\.jpg/i, 'pl.jpg');
    // DUGA: _m -> _l
    highRes = highRes.replace('_m.jpg', '_l.jpg');
    return highRes;
  };

  const thumbnail = getHighResThumbnail(rawThumbnail);

  const genres = product.genres || [];
  const actors = product.actresses || [];
  const attributes = product.attributes || []; 
  const series = product.series || null;
  const maker = product.maker || null;
  const hasSample = !!product.sample_movie_url;
  const score = product.spec_score || 0; 
  
  const detailPath = '/adults';

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
    <div className={styles.cardContainer}>
      <div className={styles.imageSection}>
        <Link href={`${detailPath}/${product.id}`} className="block h-full w-full">
          <img 
            src={thumbnail} 
            alt={product.title} 
            className={styles.thumbnail} 
            loading="lazy"
            /* ✅ 修正ポイント：imageRendering を auto から crisp-edges 系に変更 */
            style={{ 
              imageRendering: '-webkit-optimize-contrast', // Safari用
              // @ts-ignore
              imageRendering: 'crisp-edges'              // 標準
            }} 
          />
          <div className={styles.imageOverlay} />
          
          {score > 0 && (
            <div className="absolute top-2 left-2 z-20 bg-black/70 backdrop-blur-md border border-pink-500/50 px-2 py-0.5 rounded flex items-baseline gap-1">
              <span className="text-[9px] text-pink-400 font-bold">SCORE</span>
              <span className="text-sm text-white font-black italic">{score}</span>
            </div>
          )}

          {hasSample && (
            <div className={styles.sampleBadge}>
              <span className={styles.sampleDot}>●</span>
              SAMPLE
            </div>
          )}
        </Link>
        <div className={styles.apiBadge}>{product.api_source || 'PREMIUM'}</div>
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

        {actors.length > 0 && (
          <div className={`${styles.tagContainer} mb-2`}>
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

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {attributes.slice(0, 3).map((attr: any) => {
              const style = getTagStyle(attr.name, 'attribute');
              return (
                <span key={attr.id} className={`text-[9px] px-1.5 py-0 rounded-sm border ${style.bg} ${style.text} ${style.border} opacity-80`}>
                  {attr.name}
                </span>
              );
            })}
          </div>
        )}

        <div className="space-y-0.5 mb-3">
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Maker</span>
            {maker ? (
              <Link href={`/maker/${maker.id}`} className={`${styles.infoLink} text-cyan-300`}>{maker.name}</Link>
            ) : <span className="text-[11px] text-gray-600">Unknown</span>}
          </div>
          {series && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Series</span>
              <Link href={`/series/${series.id}`} className={`${styles.infoLink} text-amber-300/90`}>{series.name}</Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4 h-10 content-start overflow-hidden">
          {genres.slice(0, 4).map((genre: any) => {
            const style = getTagStyle(genre.name, 'genre');
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
              <span className={styles.priceText}>
                {product.price ? `¥${product.price.toLocaleString()}` : 'CHECK PRICE'}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-gray-500 uppercase tracking-tighter">AI Spec Score</span>
              <div className="w-16 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500" 
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`${detailPath}/${product.id}`} className={styles.btnView}>
              {hasSample && <span className="text-xs">🎬</span>}
              VIEW DETAILS
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.btnGet}
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