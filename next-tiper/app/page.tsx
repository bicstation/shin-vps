/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネント
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
    "TIPER Live | プレミアム・アーカイブ", 
    "DUGA・FANZA・DMMの最新コンテンツをAI解析。独占アーカイブ。", 
    undefined, 
    '/'
  );
}

/**
 * 💡 ユーティリティ: HTMLデコード & 日付フォーマット
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
 * 🎬 メインホームコンポーネント
 */
export default async function Home(props: { 
  searchParams: Promise<{ page?: string; offset?: string }> 
}) {
  // 1. Next.js 15 非同期パラメータの解決
  const resolvedSearchParams = await props.searchParams;
  
  const limit = 20;
  let currentOffset = 0;
  if (resolvedSearchParams.offset) {
    currentOffset = Number(resolvedSearchParams.offset) || 0;
  } else {
    const pageNum = Number(resolvedSearchParams.page) || 1;
    currentOffset = (pageNum - 1) * limit;
  }

  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const isFirstPage = displayCurrentPage === 1;

  // 🔍 🚀 サーバー側デバッグログ
  console.log(`\n--- 🛡️ [SYSTEM] TIPER Live Core Boot ---`);
  console.log(`[TARGET] Internal: ${process.env.API_INTERNAL_URL || 'Not Set (using default)'}`);
  console.log(`[TARGET] Public: ${process.env.NEXT_PUBLIC_API_URL}`);

  // 2. データフェッチ (例外処理を強化し、JSONエラーによるクラッシュを防ぐ)
  // Promise.allで並列取得し、個別のエラーが全体を止めないようにする
  const [wpData, productData, makersData] = await Promise.all([
    isFirstPage 
      ? getSiteMainPosts(0, 6).catch(e => { console.error("❌ WP API Error:", e.message); return { results: [], count: 0 }; }) 
      : Promise.resolve({ results: [], count: 0 }),
    getAdultProducts({ limit, offset: currentOffset, ordering: '-id' })
      .catch(e => { console.error("❌ Django Products Error:", e.message); return { results: [], count: 0 }; }),
    fetchMakers()
      .catch(e => { console.error("❌ Makers API Error:", e.message); return []; })
  ]);

  // 🔍 🚀 受信データの検証
  const productsResult = productData?.results || [];
  const totalInDb = productData?.count || 0;
  
  // makersデータの抽出（resultsがある場合と配列の場合の両方に対応）
  let makers = [];
  if (Array.isArray(makersData)) {
    makers = makersData;
  } else if (makersData && typeof makersData === 'object' && (makersData as any).results) {
    makers = (makersData as any).results;
  }

  // 3. データの整形
  const latestPosts = (wpData?.results || []) as WPPost[];
  const products = productsResult as AdultProduct[];
  const totalCount = Number(totalInDb) || 0;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;
  
  // Sidebar用記事データの整形
  const sidebarRecentPosts = latestPosts.map(p => ({ 
    id: p.id.toString(), 
    title: decodeHtml(p.title.rendered), 
    slug: p.slug 
  }));

  // API疎通判定
  const isApiConnected = products.length > 0 || makers.length > 0;

  console.log(`[DATA] Products: ${products.length} / Makers: ${makers.length} / News: ${latestPosts.length}`);
  console.log(`--- 🛡️ [DEBUG END] ---\n`);

  return (
    <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white font-sans">
      
      {/* 🌌 1. ヒーローセクション（3大プラットフォーム統合版） */}
      {isFirstPage && (
        <section className="relative py-32 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#16162d] to-[#0a0a14]">
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.1),transparent_70%)]"></div>
          
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
              <span className="text-[10px] font-black tracking-[0.4em] text-[#e94560] uppercase animate-pulse">
                DUGA × FANZA × DMM Nodes Active
              </span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
              TIPER<span className="text-[#e94560] not-italic">LIVE</span>
            </h1>
            <div className="mt-10 flex flex-col items-center">
              <p className="text-gray-500 text-xs md:text-sm font-bold tracking-[0.8em] uppercase opacity-70">
                Premium Intelligence Hub
              </p>
              <div className="mt-8 w-px h-16 bg-gradient-to-b from-[#e94560] to-transparent"></div>
            </div>
          </div>
        </section>
      )}

      {/* 🏗️ 2. メインレイアウト */}
      <div className={`max-w-[1440px] mx-auto px-[5%] flex flex-col lg:flex-row gap-16 ${isFirstPage ? 'mt-16' : 'mt-32'}`}>
        
        {/* 💡 サイドバーエリア */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            
            {/* 🔴 デバッグ警告: API未接続時のみ表示 */}
            {!isApiConnected && (
               <div className="mb-6 p-4 border border-red-500/30 bg-red-950/10 rounded-2xl">
                 <div className="flex items-center gap-2 mb-2 text-red-500">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                   <span className="text-[10px] font-black uppercase tracking-widest">Connection Alert</span>
                 </div>
                 <p className="text-[10px] text-gray-400 font-mono italic leading-relaxed">
                   [ALERT] DATA_FETCH_FAILURE<br/>
                   Target: {process.env.NEXT_PUBLIC_API_URL}<br/>
                   Reason: No data returned from Django.
                 </p>
               </div>
            )}

            {/* プラットフォームセレクター（概念的配置） */}
            <div className="mb-8 grid grid-cols-3 gap-2">
              {['DUGA', 'FANZA', 'DMM'].map(plat => (
                <div key={plat} className="py-2 text-center border border-white/5 bg-white/[0.02] rounded-lg text-[9px] font-black text-gray-500 hover:text-[#e94560] hover:border-[#e94560]/30 transition-all cursor-pointer">
                  {plat}
                </div>
              ))}
            </div>

            <Sidebar 
              makers={makers} 
              recentPosts={sidebarRecentPosts} 
            />
          </div>
        </aside>

        {/* 💡 メインコンテンツエリア */}
        <div className="flex-grow min-w-0 flex flex-col gap-24">
          
          {/* A: ニュースセクション（1ページ目のみ表示） */}
          {isFirstPage && (
            <section>
              <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                    <span className="w-2 h-8 bg-[#e94560]"></span>
                    Latest <span className="text-[#e94560]">Intelligence</span>
                  </h2>
                  <p className="text-[9px] font-bold text-gray-600 tracking-[0.3em] uppercase mt-2">Platform Reports</p>
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
                  <div className="col-span-full py-12 text-center text-gray-700 italic border border-dashed border-white/5 rounded-3xl">
                    WAITING_FOR_WP_SIGNAL
                  </div>
                )}
              </div>
            </section>
          )}

          {/* B: 商品グリッドセクション */}
          <section className="relative">
            {!isFirstPage && (
              <div className="mb-12 border-b border-white/5 pb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-gray-500">
                  <span className="text-[#e94560]">Archive</span> Node / Sector {displayCurrentPage}
                </h2>
              </div>
            )}
            
            <div className="flex justify-between items-end mb-12 px-2">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  Archived <span className="text-[#e94560]">Units</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#e94560] animate-ping"></span>
                  <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Multi-Platform Sync Active</p>
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
                  DATABASE_OFFLINE
                  <p className="text-[10px] mt-4 text-gray-800 font-mono uppercase tracking-[0.2em]">
                    Check: {process.env.NEXT_PUBLIC_API_URL}
                  </p>
                </div>
              )}
            </div>

            {/* 💡 ページネーション */}
            {totalCount > limit && (
              <div className="mt-28 pt-16 border-t border-white/[0.05]">
                <div className="flex flex-col items-center gap-8">
                  <Pagination 
                    currentOffset={currentOffset} 
                    limit={limit} 
                    totalCount={totalCount}
                    basePath="/" 
                  />
                  <div className="flex items-center gap-6">
                    <span className="h-px w-12 bg-white/5"></span>
                    <p className="text-[9px] font-black text-gray-600 tracking-[0.4em] uppercase">
                      Sector {displayCurrentPage} of {displayTotalPages}
                    </p>
                    <span className="h-px w-12 bg-white/5"></span>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
      
      {/* ⚡ フッター装飾 */}
      <div className="mt-32 h-px w-full bg-gradient-to-r from-transparent via-[#e94560]/20 to-transparent"></div>
    </div>
  );
}