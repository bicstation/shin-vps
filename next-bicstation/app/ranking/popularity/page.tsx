import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { fetchPCPopularityRanking } from '@/lib/api';

// 1. SEO メタデータの設定
export const metadata: Metadata = {
  title: '注目度・売れ筋PCランキングTOP100 | BICSTATION',
  description: '今、最もアクセスされているPCをリアルタイム集計。過去24時間のアクセスデータに基づいた人気ランキング100選を公開中。',
  openGraph: {
    title: '注目度・売れ筋PCランキングTOP100 | BICSTATION',
    description: 'トレンドのパソコンがひと目でわかる！リアルタイム注目度ランキング。',
    type: 'website',
  },
};

export default async function PopularityRankingPage() {
  // 2. サーバーサイドでデータ取得
  const products = await fetchPCPopularityRanking();

  // 3. 構造化データ (ItemList) の作成
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://your-domain.com/product/${product.unique_id}`,
      "name": product.name
    }))
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 構造化データの挿入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダーエリア */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 mb-10 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-cyan-300" />
          <h1 className="text-3xl font-black italic tracking-wider underline-offset-4">
            POPULARITY TOP 100
          </h1>
        </div>
        <p className="text-blue-100 opacity-90 leading-relaxed">
          最新のアクセス統計に基づき、今ユーザーが本当に注目しているパソコンをランキング形式で紹介します。
          毎時更新されるトレンドデータから、最適な1台を見つけてください。
        </p>
      </header>

      {/* ランキングリスト（セマンティックな ol タグを使用） */}
      <ol className="grid grid-cols-1 gap-6 mb-10">
        {products.map((product, index) => (
          <li key={product.unique_id}>
            <RankingCard product={product} rank={index + 1} />
          </li>
        ))}
      </ol>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© BICSTATION PC Trending Analysis - データは定期的に更新されます</p>
      </footer>
    </div>
  );
}

function RankingCard({ product, rank }: { product: any, rank: number }) {
  const isTop3 = rank <= 3;
  
  return (
    <Link href={`/product/${product.unique_id}`} className="block group">
      <article className={`
        relative flex items-center bg-white border border-gray-100 rounded-2xl p-4 transition-all
        hover:shadow-xl hover:border-blue-300 hover:-translate-y-1
        ${isTop3 ? 'ring-2 ring-blue-500 ring-opacity-10 bg-blue-50/10' : ''}
      `}>
        {/* 順位表示 */}
        <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center border-r border-gray-100">
          <span className={`text-3xl font-black italic ${
            rank === 1 ? 'text-yellow-500' : 
            rank === 2 ? 'text-slate-400' : 
            rank === 3 ? 'text-orange-500' : 'text-gray-300'
          }`}>
            {rank}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Rank</span>
        </div>

        {/* 製品画像 */}
        <div className="flex-shrink-0 w-24 h-24 relative mx-6">
          <Image
            src={product.image_url || '/no-image.png'}
            alt={`${product.name} - 注目ランキング第${rank}位`}
            fill
            sizes="100px"
            className="object-contain"
          />
        </div>

        {/* 情報セクション */}
        <div className="flex-grow min-w-0">
          <header className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {product.maker_name}
            </span>
            {isTop3 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                <Activity className="w-3 h-3" /> Trending Now
              </span>
            )}
          </header>
          
          <h2 className="text-base font-bold text-gray-800 truncate mb-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h2>

          <div className="flex items-center gap-4">
            <p className="text-xl font-black text-blue-900">
              ¥{product.price?.toLocaleString()}<span className="text-xs ml-0.5 font-normal">（税込）〜</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                AI Score: {product.spec_score}
              </span>
            </div>
          </div>
        </div>

        {/* アクションボタン（視覚的なガイド） */}
        <div className="flex-shrink-0 ml-4 hidden sm:block">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </article>
    </Link>
  );
}