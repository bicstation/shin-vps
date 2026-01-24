'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, Activity, Award, ArrowRight } from 'lucide-react';

export default function PopularityRankingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // さきほど Django で追加した新エンドポイントを叩く
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pc-products/popularity-ranking/`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("注目度ランキングの取得に失敗:", err));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-500 font-medium">トレンドを集計中...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ヘッダーエリア */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 mb-10 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-cyan-300" />
          <h1 className="text-3xl font-black italic tracking-wider">POPULARITY TOP 100</h1>
        </div>
        <p className="text-blue-100 opacity-90">
          過去24時間のアクセス数に基づいたリアルタイム・トレンドランキング
        </p>
      </div>

      {/* ランキンググリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {products.map((product, index) => (
          <RankingCard key={product.unique_id} product={product} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

function RankingCard({ product, rank }: { product: any, rank: number }) {
  const isTop3 = rank <= 3;
  
  return (
    <Link href={`/product/${product.unique_id}`}>
      <div className={`
        group relative flex items-center bg-white border border-gray-100 rounded-2xl p-4 transition-all
        hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5
        ${isTop3 ? 'ring-2 ring-blue-500 ring-opacity-10 bg-blue-50/10' : ''}
      `}>
        {/* 順位 */}
        <div className="flex-shrink-0 w-14 flex justify-center">
          <span className={`text-2xl font-black italic ${
            rank === 1 ? 'text-yellow-500 scale-125' : 
            rank === 2 ? 'text-slate-400 scale-110' : 
            rank === 3 ? 'text-orange-500 scale-105' : 'text-gray-300'
          }`}>
            {rank.toString().padStart(2, '0')}
          </span>
        </div>

        {/* 画像 */}
        <div className="flex-shrink-0 w-20 h-20 relative mx-4 bg-white rounded-lg p-1 border border-gray-50">
          <Image
            src={product.image_url || '/no-image.png'}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        {/* 情報 */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full">
              {product.maker_name}
            </span>
            {isTop3 && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600 animate-pulse">
                <Activity className="w-3 h-3" /> HOT NOW
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-lg font-black text-gray-900">
              ¥{product.price?.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              性能スコア: {product.spec_score}
            </span>
          </div>
        </div>

        {/* 矢印 */}
        <div className="flex-shrink-0 ml-4">
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}