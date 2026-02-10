/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネントのインポート
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
 * 💡 ユーティリティ: HTMLデコード
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
 * 🎬 メインホームコンポーネント (Server Component)
 */
export default async function Home(props: {
  searchParams: Promise<{ page?: string; offset?: string }>
}) {
  const resolvedSearchParams = await props.searchParams;

  // 1. ページネーション設定
  const limit = 24; // グリッド表示に適した24件
  let currentOffset = 0;
  if (resolvedSearchParams.offset) {
    currentOffset = Number(resolvedSearchParams.offset) || 0;
  } else {
    const pageNum = Number(resolvedSearchParams.page) || 1;
    currentOffset = (pageNum - 1) * limit;
  }

  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const isFirstPage = displayCurrentPage === 1;

  // 2. データフェッチ (並列実行)
  const [wpData, productData, makersData] = await Promise.all([
    isFirstPage
      ? getSiteMainPosts(0, 6).catch(() => ({ results: [], count: 0 }))
      : Promise.resolve({ results: [], count: 0 }),
    getAdultProducts({ limit, offset: currentOffset, ordering: '-id' })
      .catch(() => ({ results: [], count: 0 })),
    fetchMakers().catch(() => [])
  ]);

  // 3. プロダクトデータの抽出
  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = Number(productData?.count) || 0;

  // 4. メーカーデータの整形 (サイドバー用)
  let makers = [];
  if (Array.isArray(makersData)) {
    makers = makersData;
  } else if (makersData && (makersData as any).results) {
    // Django DRF ページネーション対応
    makers = (makersData as any).results;
  }

  // 5. WordPress記事の整形 (サイドバー用)
  const latestPosts = (wpData?.results || []) as WPPost[];
  const sidebarRecentPosts = latestPosts.map(p => ({
    id: p.id.toString(),
    title: decodeHtml(p.title.rendered),
    slug: p.slug
  }));

  const isApiConnected = products.length > 0;

  return (
    <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white font-sans overflow-x-hidden">

      {/* 🌌 1. ヒーローセクション (1ページ目のみ表示) */}
      {isFirstPage && (
        <section className="relative py-32 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#16162d] to-[#0a0a14]">
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.1),transparent_70%)]"></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
              <span className="text-[10px] font-black tracking-[0.4em] text-[#e94560] uppercase animate-pulse">
                Global Network Nodes Active
              </span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              TIPER<span className="text-[#e94560] not-italic">LIVE</span>
            </h1>
            <div className="mt-10 flex flex-col items-center">
              <p className="text-gray-500 text-[10px] md:text-xs font-bold tracking-[0.8em] uppercase opacity-70">
                Premium Intelligence Hub / Matrix Edition
              </p>
              <div className="mt-8 w-px h-16 bg-gradient-to-b from-[#e94560] to-transparent"></div>
            </div>
          </div>
        </section>
      )}

      {/* 🏗️ 2. メインレイアウト */}
      <div className={`w-full max-w-[1800px] mx-auto px-[4%] flex flex-col lg:flex-row gap-12 xl:gap-16 ${isFirstPage ? 'mt-16' : 'mt-32'}`}>

        {/* 💡 左翼: サイドバー */}
        <aside className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-8">

            {/* プラットフォーム・クイック・セレクター */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'DUGA', path: '/brand/duga' },
                { name: 'FANZA', path: '/brand/fanza' },
                { name: 'DMM', path: '/brand/fanza' },
              ].map((plat) => (
                <Link key={plat.name} href={plat.path} className="block">
                  <div className="py-3 text-center border border-white/5 bg-white/[0.02] rounded-sm text-[9px] font-black text-gray-500 hover:text-white hover:bg-[#e94560] hover:border-[#e94560] transition-all cursor-pointer uppercase tracking-tighter">
                    {plat.name}
                  </div>
                </Link>
              ))}
            </div>

            {/* APIエラー警告 */}
            {!isApiConnected && (
              <div className="p-5 border border-red-500/20 bg-red-950/5 rounded-sm">
                <div className="flex items-center gap-2 mb-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  System Alert
                </div>
                <p className="text-[9px] text-gray-500 font-mono leading-relaxed uppercase">
                  Failed to establish connection to Django node. Registry is currently empty.
                </p>
              </div>
            )}

            {/* 共通サイドバーコンポーネント */}
            <Sidebar
              makers={makers}
              recentPosts={sidebarRecentPosts}
            />
          </div>
        </aside>

        {/* 💡 中央: メインストリーム */}
        <main className="flex-grow min-w-0">

          {/* A: 最新ニュース (1段目) */}
          {isFirstPage && (
            <section className="mb-24">
              <div className="flex items-end justify-between mb-10 border-b border-white/[0.05] pb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                  <span className="w-2 h-8 bg-[#e94560]"></span>
                  Latest <span className="text-[#e94560]">Intelligence</span>
                </h2>
                <Link href="/news" className="group text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-widest uppercase flex items-center gap-2">
                  All Reports <span className="text-[#e94560] group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {latestPosts.length > 0 ? (
                  latestPosts.slice(0, 3).map((post) => {
                    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/api/placeholder/800/450';
                    return (
                      <Link
                        key={post.id}
                        href={`/news/${post.slug}`}
                        className="group bg-[#16162d]/40 border border-white/[0.03] hover:border-[#e94560]/40 transition-all duration-500 overflow-hidden"
                      >
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={imageUrl}
                            alt={post.title?.rendered}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-5">
                          <span className="text-[#e94560] text-[9px] font-black uppercase tracking-widest mb-2 block">
                            {formatDate(post.date)}
                          </span>
                          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                            {decodeHtml(post.title?.rendered)}
                          </h3>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">No reports available.</p>
                )}
              </div>
            </section>
          )}

          {/* B: 商品グリッド (2段目) */}
          <section>
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                Archived <span className="text-[#e94560]">Units</span>
              </h2>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-3xl font-black text-white tabular-nums italic leading-none">{totalCount.toLocaleString()}</p>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mt-1">Registry Total</p>
                </div>
              </div>
            </div>

            {/* 💡 多列グリッドレイアウト */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-x-6 gap-y-12">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-40 text-center border border-dashed border-white/5 bg-white/[0.01]">
                  <p className="text-gray-700 font-black tracking-[0.5em] uppercase animate-pulse">
                    Database_Offline / Link_Broken
                  </p>
                </div>
              )}
            </div>

            {/* ページネーション (条件付きレンダリング) */}
            {totalCount > limit && (
              <div className="mt-28 pt-16 border-t border-white/[0.05]">
                <Pagination
                  currentOffset={currentOffset}
                  limit={limit}
                  totalCount={totalCount}
                  basePath="/"
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}