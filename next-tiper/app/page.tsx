/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import ProductCard from './components/ProductCard'; 
import { getAdultProducts, fetchPostList } from '../lib/api'; 

export const dynamic = 'force-dynamic';

// --- ユーティリティ関数 ---
const decodeHtml = (html: string) => {
  if (!html) return '';
  const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  // 💡 ページネーション計算
  const currentPage = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // 💡 データフェッチ (最新順をリクエスト)
  const [latestPosts, productData] = await Promise.all([
    fetchPostList(5).catch(() => []), 
    getAdultProducts({ limit, offset, ordering: '-id' }).catch(() => ({ results: [], count: 0 }))
  ]);

  const products = productData?.results || [];
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
        <div className="section-title-line">
          <div>
            <h2 className="text-white text-2xl md:text-3xl font-bold">🔥 最新コンテンツ</h2>
            <p className="text-gray-500 text-sm mt-1">新着アイテムを毎日更新中</p>
          </div>
          <span className="text-gray-600 text-sm font-mono">{totalCount} ITEMS</span>
        </div>

        {/* 商品グリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-gray-700 font-bold">
              NO PRODUCTS FOUND.
            </div>
          )}
        </div>

        {/* ページネーション (globals.css の btn-pagination を使用) */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-8">
            {currentPage > 1 && (
              <Link href={`?page=${currentPage - 1}`} className="btn-pagination">
                PREV
              </Link>
            )}
            
            <div className="text-xl font-black tracking-widest">
              <span className="text-[#e94560]">{currentPage}</span>
              <span className="mx-3 text-gray-800">/</span>
              <span className="text-gray-600">{totalPages}</span>
            </div>

            {currentPage < totalPages && (
              <Link href={`?page=${currentPage + 1}`} className="btn-pagination">
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
          {Array.isArray(latestPosts) && latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/tiper/${post.slug}`} 
                className="news-card"
              >
                <div className="font-bold text-xl text-gray-100 mb-2 group-hover:text-[#e94560]">
                  {decodeHtml(post.title?.rendered)}
                </div>
                <div className="text-gray-600 text-sm flex items-center gap-2">
                  <span className="text-[#e94560]">DATE:</span> {formatDate(post.date)}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-700 italic">No announcements at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}