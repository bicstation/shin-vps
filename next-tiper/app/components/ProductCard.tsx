/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }: { product: any }) {
  const thumbnail = product.image_url_list?.[0] || '/no-image.png';
  const genres = product.genres || [];
  const basePath = process.env.NEXT_PUBLIC_BASE_TIPER || '';

  return (
    <div className="group overflow-hidden rounded-lg border border-[#3d3d66] bg-[#1f1f3a] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      
      {/* 画像セクション：ここを修正 */}
      <Link 
        href={`${basePath}/adults/${product.id}`} 
        className="block relative aspect-[3/4] w-full overflow-hidden bg-[#111122]"
      >
        <img
          src={thumbnail}
          alt={product.title}
          className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
          /* 💡 object-contain にすることで、画像全体が枠内に収まります。p-1で少し余白を付けています */
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
          {product.api_source}
        </div>
      </Link>

      {/* コンテンツセクション */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="line-clamp-2 text-sm font-bold h-10 text-white leading-tight hover:text-[#00d1b2] transition-colors">
          <Link href={`${basePath}/adults/${product.id}`}>
            {product.title}
          </Link>
        </h3>

        <p className="mt-1 text-[11px] text-[#99e0ff] truncate">
          {product.maker?.name || 'Unknown'}
        </p>

        {/* ジャンルタグ */}
        <div className="mt-2 flex flex-wrap gap-1 h-12 overflow-hidden items-start">
          {genres.slice(0, 3).map((genre: any) => (
            <Link
              key={genre.id}
              href={`${basePath}/adults/genre/${genre.id}`}
              className="text-[9px] bg-[#111122] text-[#00d1b2] px-1.5 py-0.5 rounded border border-[#00d1b2]/30 hover:bg-[#00d1b2] hover:text-white transition-colors"
            >
              #{genre.name}
            </Link>
          ))}
        </div>

        {/* 価格とボタンを下寄せにするための spacer */}
        <div className="mt-auto">
          <div className="mt-2 mb-3">
            <span className="text-white font-bold text-base">
              ¥{product.price ? product.price.toLocaleString() : '---'}
            </span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#3d3d66]">
            <Link 
              href={`${basePath}/adults/${product.id}`}
              className="flex-1 text-center text-[10px] bg-[#3d3d66] text-white py-2 rounded font-bold hover:bg-[#4d4d80] transition-colors"
            >
              詳細
            </Link>
            <a 
              href={product.affiliate_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 text-center text-[10px] bg-[#e94560] text-white py-2 rounded font-bold hover:bg-[#ff5e78] transition-colors"
            >
              公式サイト
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}