/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネントのインポート（パスを修正済み）
import ProductCard from '@shared/cards/AdultProductCard'; 
import Pagination from '@shared/common/Pagination'; 
import Sidebar from '@shared/layout/Sidebar'; 
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { getAdultProducts, fetchMakers } from '@shared/lib/api/django';
import { WPPost, AdultProduct } from '@shared/lib/api/types';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
  return constructMetadata(
    "TIPER Live | プレミアム・アダルトメディア解析アーカイブ", 
    "最新のアダルトコンテンツとニュースをAI解析スコアと共に提供。TIPER Liveの独占アーカイブ。", 
    undefined, 
    '/'
  );
}

/**
 * 💡 ユーティリティ: HTMLデコード & 日付
 */
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

/**
 * 💡 メインホームコンポーネント
 */
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
  const [wpData, productData, makersData] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [], count: 0 })), 
    getAdultProducts({ limit, offset, ordering: '-id' }).catch(() => ({ results: [], count: 0 })),
    fetchMakers().catch(() => [])
  ]);

  const latestPosts = (wpData?.results || []) as WPPost[];
  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = productData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const makers = Array.isArray(makersData) ? makersData : (makersData as any).results || [];

  return (
    <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white">
      
      {/* 🌌 1. ヒーローセクション: さらにサイバーに強化 */}
      <section className="relative py-32 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#16162d] to-[#0a0a14]">
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.1),transparent_70%)]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
            <span className="text-[10px] font-black tracking-[0.6em] text-[#e94560] uppercase animate-pulse">Mainframe Access Established</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
            TIPER<span className="text-[#e94560] not-italic">LIVE</span>
          </h1>
          <div className="mt-10 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm font-bold tracking-[0.8em] uppercase opacity-70">
              Exclusive Media Content Hub
            </p>
            <div className="mt-8 w-px h-16 bg-gradient-to-b from-[#e94560] to-transparent"></div>
          </div>
        </div>
      </section>

      {/* 🏗️ 2. メインレイアウト */}
      <div className="max-w-[1440px] mx-auto px-[5%] flex flex-col lg:flex-row gap-16 mt-16">
        
        {/* 💡 サイドバー (Sticky) */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <Sidebar 
              makers={makers} 
              latestPosts={latestPosts} 
            />
          </div>
        </aside>

        {/* 💡 メインコンテンツエリア */}
        <div className="flex-grow min-w-0 flex flex-col gap-24">
          
          {/* A: ニュースセクション (最新投稿) */}
          <section>
            <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                  <span className="w-2 h-8 bg-[#e94560]"></span>
                  Latest <span className="text-[#e94560]">Intelligence</span>
                </h2>
                <p className="text-[9px] font-bold text-gray-600 tracking-[0.3em] uppercase mt-2">Internal News Feed</p>
              </div>
              <Link href="/news" className="group text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-widest uppercase flex items-center gap-2">
                All Reports <span className="text-[#e94560] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestPosts.length > 0 ? (
                latestPosts.slice(0, 4).map((post) => {
                  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/api/placeholder/800/450';
                  return (
                    <Link 
                      key={post.id} 
                      href={`/news/${post.slug}`}
                      className="group bg-[#16162d]/40 rounded-3xl overflow-hidden border border-white/[0.03] hover:border-[#e94560]/40 transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="aspect-[16/9] overflow-hidden relative">
                        <img 
                          src={imageUrl} 
                          alt={post.title?.rendered}
                          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-[#e94560] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            {formatDate(post.date)}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-[#e94560] transition-colors">
                          {decodeHtml(post.title?.rendered)}
                        </h3>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-gray-700 italic border border-dashed border-white/5 rounded-3xl">No signal detected...</div>
              )}
            </div>
          </section>

          {/* B: 商品グリッドセクション */}
          <section className="relative">
            {/* 装飾用背景 */}
            <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[3rem] -z-10 pointer-events-none"></div>

            <div className="flex justify-between items-end mb-12 px-2">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  Archived <span className="text-[#e94560]">Units</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#e94560] animate-ping"></span>
                  <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Real-time DB Sync Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white italic leading-none">{totalCount.toLocaleString()}</p>
                <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Registry Total</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-14">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-gray-700 font-black border-2 border-dashed border-white/5 rounded-[3rem]">
                  DATABASE CONNECTION OFFLINE
                </div>
              )}
            </div>

            {/* 💡 ページネーション・コントロール・センター */}
            <div className="mt-28 pt-16 border-t border-white/[0.05]">
              <div className="flex flex-col items-center gap-8">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  baseUrl="/" 
                />
                
                {/* ページ情報のメタ表示 */}
                <div className="flex items-center gap-6">
                  <span className="h-px w-12 bg-white/5"></span>
                  <p className="text-[9px] font-black text-gray-600 tracking-[0.4em] uppercase">
                    Sector {currentPage} of {totalPages} / Offset {offset}
                  </p>
                  <span className="h-px w-12 bg-white/5"></span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      {/* ⚡ 最下部装飾 */}
      <div className="mt-32 h-px w-full bg-gradient-to-r from-transparent via-[#e94560]/20 to-transparent"></div>
    </div>
  );
}