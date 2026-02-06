/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネントのインポート
import ProductCard from '@shared/cards/AdultProductCard'; 
import Pagination from '@shared/common/Pagination'; // 💡 指定のコンポーネントを使用
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { getAdultProducts } from '@shared/lib/api/django';
import { WPPost, AdultProduct } from '@shared/lib/api/types';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return constructMetadata(
    "最新コンテンツ一覧", 
    "Tiper Live の最新アダルトコンテンツとニュースをお届けします。", 
    undefined, 
    '/'
  );
}

// --- ユーティリティ ---
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

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // 💡 データフェッチ (並列実行)
  const [wpData, productData] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [], count: 0 })), 
    getAdultProducts({ limit, offset, ordering: '-id' }).catch(() => ({ results: [], count: 0 }))
  ]);

  const latestPosts = (wpData?.results || []) as WPPost[];
  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = productData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="pb-16 bg-[#0a0a14] min-h-screen text-gray-100">
      
      {/* 1. ヒーローセクション */}
      <section className="relative py-28 px-[5%] text-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1f3a]/30 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic">
            TIPER<span className="text-[#e94560]">LIVE</span>
          </h1>
          <p className="text-gray-500 mt-4 text-xs md:text-sm font-bold tracking-[0.6em] uppercase">
            Exclusive Media Content & Daily Updates
          </p>
        </div>
      </section>

      {/* 2. WordPress ニュースセクション (グリッド表示) */}
      <section className="py-16 px-[5%] max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#e94560]"></span>
            Latest News
          </h2>
          <Link href="/news" className="text-[10px] font-bold text-gray-500 hover:text-[#e94560] transition-colors tracking-widest uppercase">
            View All Articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => {
              // 💡 アイキャッチ画像の取得
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/api/placeholder/800/450';
              return (
                <Link 
                  key={post.id} 
                  href={`/news/${post.slug}`}
                  className="group bg-[#16162d] rounded-2xl overflow-hidden border border-white/5 hover:border-[#e94560]/30 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={imageUrl} 
                      alt={post.title?.rendered}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/60 backdrop-blur-md text-[#e94560] text-[10px] font-black px-2 py-1 rounded border border-[#e94560]/30">
                        {formatDate(post.date)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#e94560] transition-colors leading-tight mb-3">
                      {decodeHtml(post.title?.rendered)}
                    </h3>
                    <div 
                      className="text-gray-500 text-xs line-clamp-2 font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || '' }}
                    />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-[#16162d]/50 rounded-2xl border border-dashed border-gray-800">
              <p className="text-gray-500 text-sm italic uppercase tracking-widest">No articles found.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Django 商品セクション */}
      <section className="py-16 px-[5%] max-w-[1400px] mx-auto bg-[#0c0c1a] rounded-[3rem] shadow-inner">
        <div className="flex justify-between items-end mb-12 px-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase italic">
              New <span className="text-[#e94560]">Items</span>
            </h2>
            <p className="text-gray-600 text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">Updated Every 24 Hours</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-gray-700 text-[10px] font-mono leading-none tracking-tighter uppercase">Total Archive</p>
            <p className="text-xl font-black text-gray-500">{totalCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-gray-700 font-bold border-2 border-dashed border-white/5 rounded-3xl">
              DATABASE CONNECTION ERROR
            </div>
          )}
        </div>

        {/* 💡 共通 Pagination コンポーネントの適用 */}
        <div className="mt-20">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/" 
          />
        </div>
      </section>

    </div>
  );
}