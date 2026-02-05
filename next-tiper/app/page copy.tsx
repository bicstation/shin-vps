/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */

import React from 'react';
import Link from 'next/link';
import ProductCard from '@shared/cards/AdultProductCard'; 

/**
 * 💡 APIインポート
 * shared/lib/api/index.ts から統合された関数と型を取得します。
 */
import { 
  getSiteMainPosts, 
  getAdultProducts, 
  WPPost, 
  AdultProduct 
} from '@shared/lib/api';
import { constructMetadata } from '@shared/lib/metadata';

/**
 * 💡 強制的動的レンダリング
 * 常に最新のAPIデータを反映させるため、キャッシュをバイパスします。
 */
export const dynamic = 'force-dynamic';

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
  return constructMetadata(
    "最新コンテンツ一覧", 
    "Tiper Live の最新アダルトコンテンツとニュースをお届けします。", 
    undefined, 
    '/'
  );
}

// --- ユーティリティ関数 ---
const decodeHtml = (html: string) => {
  if (!html) return '';
  const map: { [key: string]: string } = { 
    '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
  };
  return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
             .replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ja-JP', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  });
};

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  /**
   * 💡 データフェッチ (並列実行)
   * WordPress(お知らせ)とDjango(商品データ)を同時に取得します。
   */
  const [wpData, productData] = await Promise.all([
    getSiteMainPosts(0, 5).catch((err) => {
      console.error("[WP Fetch Error]:", err);
      return { results: [], count: 0 };
    }), 
    getAdultProducts({ 
      limit, 
      offset, 
      ordering: '-id',
    }).catch((err) => {
      console.error("[Django Fetch Error]:", err);
      return { results: [], count: 0 };
    })
  ]);

  const latestPosts = (wpData?.results || []) as WPPost[];
  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = productData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="pb-16">
      
      {/* 1. ヒーローセクション */}
      <section className="py-24 px-[5%] text-center bg-gradient-to-b from-[#1f1f3a] to-[#111122] border-b border-gray-900">
        <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] text-white uppercase drop-shadow-2xl">
          TIPER LIVE
        </h1>
        <p className="text-[#e94560] mt-6 text-lg md:text-2xl font-bold tracking-widest">
          Premium Media & Django Integration
        </p>
      </section>

      {/* 2. Django 商品セクション */}
      <section className="py-12 px-[5%]">
        <div className="flex justify-between items-end mb-8 border-b border-[#3d3d66]/50 pb-4">
          <div>
            <h2 className="text-white text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-[#e94560]">🔥</span> 最新コンテンツ
            </h2>
            <p className="text-gray-500 text-sm mt-1">新着アイテムを毎日更新中</p>
          </div>
          <span className="text-gray-600 text-sm font-mono tracking-tighter">
            {totalCount} ITEMS
          </span>
        </div>

        {/* 商品グリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-gray-700 font-bold border-2 border-dashed border-[#3d3d66]/30 rounded-2xl">
              <p className="text-xl mb-2">NO PRODUCTS FOUND.</p>
              <p className="text-sm font-normal text-gray-500">
                API Host: {process.env.NEXT_PUBLIC_API_URL || 'Check .env'} | Group: adult
              </p>
            </div>
          )}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-8">
            {currentPage > 1 && (
              <Link href={`?page=${currentPage - 1}`} className="btn-pagination px-6 py-2 bg-[#1f1f3a] text-white rounded hover:bg-[#e94560] transition-colors">
                PREV
              </Link>
            )}
            
            <div className="text-xl font-black tracking-widest flex items-center gap-2">
              <span className="text-[#e94560]">{currentPage}</span>
              <span className="text-gray-800">/</span>
              <span className="text-gray-600">{totalPages}</span>
            </div>

            {currentPage < totalPages && (
              <Link href={`?page=${currentPage + 1}`} className="btn-pagination px-6 py-2 bg-[#1f1f3a] text-white rounded hover:bg-[#e94560] transition-colors">
                NEXT
              </Link>
            )}
          </div>
        )}
      </section>

      {/* 3. WordPress ニュースフィード */}
      <section className="py-20 px-[5%] bg-[#0c0c1a] border-t border-gray-900">
        <h2 className="text-[#e94560] mb-12 text-3xl font-black text-center tracking-[0.3em] uppercase">
          Tiper News
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/news/${post.slug}`} 
                className="group block p-6 bg-[#16162d] border border-transparent hover:border-[#e94560]/50 rounded-xl transition-all"
              >
                <div className="font-bold text-xl text-gray-100 mb-2 group-hover:text-[#e94560] transition-colors">
                  {decodeHtml(post.title?.rendered)}
                </div>
                <div className="text-gray-600 text-sm flex items-center gap-2">
                  <span className="text-[#e94560] font-black uppercase text-[10px]">DATE:</span> {formatDate(post.date)}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-700 italic py-10">No announcements at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}