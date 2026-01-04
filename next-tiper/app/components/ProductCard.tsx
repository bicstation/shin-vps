/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';

/**
 * ProductCard コンポーネント
 * Django API から取得した製品データをカード形式で表示します。
 */
export default function ProductCard({ product }: { product: any }) {
  // 画像リストの先頭を使用
  const thumbnail = product.image_url_list?.[0] || '/no-image.png';
  
  // JSONのキー名に合わせて定義を修正
  const genres = product.genres || [];
  const actors = product.actresses || []; // JSONのキー名 "actresses" に修正
  const series = product.series || null;
  const maker = product.maker || null;
  
  /**
   * 💡 パスの設定
   * next.config.mjs の basePath 設定に合わせて調整
   */
  const detailPath = '/adults'; 

  /**
   * 💡 タグの色分けロジック
   */
  const getTagStyle = (name: string, type: 'genre' | 'actor' | 'series') => {
    const genreColors = [
      { bg: 'bg-pink-900/40', text: 'text-pink-300', border: 'border-pink-500/30' },
      { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-500/30' },
      { bg: 'bg-cyan-900/40', text: 'text-cyan-300', border: 'border-cyan-500/30' },
      { bg: 'bg-teal-900/40', text: 'text-teal-300', border: 'border-teal-500/30' },
    ];
    
    const actorColors = [
      { bg: 'bg-blue-900/50', text: 'text-blue-200', border: 'border-blue-400/40' }
    ];

    const seriesColors = [
      { bg: 'bg-amber-900/40', text: 'text-amber-200', border: 'border-amber-500/30' }
    ];

    let palette = genreColors;
    if (type === 'actor') palette = actorColors;
    if (type === 'series') palette = seriesColors;

    // 名前からハッシュ値を生成して色を固定
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
    return palette[index];
  };

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-[#3d3d66] bg-[#1a1a2e] transition-all duration-500 hover:-translate-y-1 hover:border-[#e94560]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      
      {/* 💡 画像セクション */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Link href={`${detailPath}/${product.id}`} className="block h-full w-full">
          <img
            src={thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent opacity-80" />
        </Link>
        
        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#00d1b2] border border-[#00d1b2]/30">
            {product.api_source || 'PREMIUM'}
          </span>
        </div>
      </div>

      {/* 💡 コンテンツセクション */}
      <div className="flex flex-grow flex-col p-4">
        
        {/* タイトル */}
        <h3 className="line-clamp-2 min-h-[2.8rem] text-[14px] font-bold leading-tight text-white transition-colors group-hover:text-[#00d1b2]">
          <Link href={`${detailPath}/${product.id}`}>
            {product.title}
          </Link>
        </h3>

        {/* 1. メーカー情報 */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider min-w-[40px]">Maker</span>
          {maker ? (
            <Link 
              href={`/maker/${maker.id}`}
              className="truncate text-[11px] font-bold text-[#99e0ff] hover:text-[#00d1b2] transition-colors"
            >
              {maker.name}
            </Link>
          ) : (
            <span className="text-[11px] text-gray-600 italic">Unknown</span>
          )}
        </div>

        {/* 2. シリーズ情報 */}
        {series && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider min-w-[40px]">Series</span>
            <Link 
              href={`/series/${series.id}`}
              className="truncate text-[11px] font-bold text-amber-400/90 hover:underline transition-colors"
            >
              {series.name}
            </Link>
          </div>
        )}

        {/* 3. 出演者 (actresses) */}
        {actors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 overflow-hidden">
            {actors.slice(0, 2).map((actor: any) => {
              const style = getTagStyle(actor.name, 'actor');
              return (
                <Link
                  key={actor.id}
                  href={`/actress/${actor.id}`}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125`}
                >
                  👤 {actor.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* 4. ジャンルタグ */}
        <div className="mt-3 flex flex-wrap gap-1.5 h-12 overflow-hidden content-start">
          {genres.slice(0, 4).map((genre: any) => {
            const style = getTagStyle(genre.name, 'genre');
            return (
              <Link
                key={genre.id}
                href={`/genre/${genre.id}`}
                className={`text-[9px] font-black px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} transition-all hover:brightness-125 hover:scale-105`}
              >
                #{genre.name}
              </Link>
            );
          })}
        </div>

        {/* 💡 下部アクションエリア */}
        <div className="mt-auto pt-4 border-t border-[#3d3d66]/30">
          <div className="mb-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Price</span>
              <span className="text-xl font-black text-[#e94560]">
                {product.price ? `¥${product.price.toLocaleString()}` : 'FREE'}
              </span>
            </div>
            <div className="text-[#ff9d00] text-[12px] font-bold">★★★★★</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link 
              href={`${detailPath}/${product.id}`}
              className="flex items-center justify-center rounded-lg bg-[#2a2a4a] px-2 py-2.5 text-[11px] font-black text-white transition-all hover:bg-[#3d3d66] active:scale-95 border border-white/5"
            >
              VIEW DETAILS
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#e94560] to-[#ff5e78] px-2 py-2.5 text-[11px] font-black text-white shadow-lg shadow-[#e94560]/20 transition-all hover:brightness-110 hover:shadow-[#e94560]/40 active:scale-95"
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