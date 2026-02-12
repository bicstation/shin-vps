/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネント
import ProductCard from '@shared/cards/AdultProductCard';
// 💡 統合版サイドバー (マーケット分析対応版)
import UnifiedSidebar from '@shared/layout/Sidebar/AdultSidebar'; 
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
// 💡 統合APIを利用
import { getUnifiedProducts, fetchMakers, fetchGenres } from '@shared/lib/api/django/adult';
import { WPPost, AdultProduct } from '@shared/lib/api/types';
import { constructMetadata } from '@shared/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1分キャッシュ

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata() {
  return constructMetadata(
    "TIPER Live | プレミアム・アーカイブ",
    "DUGA・FANZA・DMMの最新コンテンツをAI解析。統合デジタルアーカイブ。",
    undefined,
    '/'
  );
}

/**
 * 💡 ユーティリティ
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
export default async function Home() {
  // 1. 並列データフェッチ
  const [wpData, productData, makersData, genresData] = await Promise.all([
    getSiteMainPosts(0, 6).catch(() => ({ results: [], count: 0 })),
    getUnifiedProducts({ 
      limit: 24, 
      page: 1, 
      ordering: '-release_date',
    }).catch((e) => {
      console.error("Home: Unified API Error", e);
      return { results: [], count: 0 };
    }),
    fetchMakers({ limit: 100, ordering: '-product_count' }).catch(() => []),
    fetchGenres({ limit: 100, ordering: '-product_count' }).catch(() => [])
  ]);

  const products = (productData?.results || []) as AdultProduct[];
  const totalCount = Number(productData?.count) || 0;

  /**
   * ✅ サイドバー用：メーカーデータのTop 20抽出
   */
  const rawMakers = Array.isArray(makersData) ? makersData : (makersData as any)?.results || [];
  const topMakers = rawMakers
    .sort((a: any, b: any) => (b.product_count || b.count || 0) - (a.product_count || a.count || 0))
    .slice(0, 20)
    .map((m: any) => ({
      id: m.id,
      name: m.name || `Studio ${m.id}`,
      slug: m.slug || m.id.toString(),
      product_count: m.product_count || m.count || 0
    }));

  /**
   * ✅ サイドバー用：ジャンルデータのTop 20抽出
   */
  const rawGenres = Array.isArray(genresData) ? genresData : (genresData as any)?.results || [];
  const topGenres = rawGenres
    .sort((a: any, b: any) => (b.product_count || b.count || 0) - (a.product_count || a.count || 0))
    .slice(0, 20)
    .map((g: any) => ({
      id: g.id,
      name: g.name,
      slug: g.slug || g.id.toString(),
      product_count: g.product_count || g.count || 0
    }));

  // WordPress記事の整形
  const latestPosts = (wpData?.results || []) as WPPost[];
  const sidebarRecentPosts = latestPosts.map(p => ({
    id: p.id.toString(),
    title: decodeHtml(p.title.rendered),
    slug: p.slug
  }));

  const isApiConnected = products.length > 0;

  return (
    <div className="pb-24 bg-[#08080c] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white font-sans overflow-x-hidden">

      {/* 🌌 1. ヒーローセクション */}
      <section className="relative py-32 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#11111d] to-[#08080c]">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.08),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
            <span className="text-[10px] font-black tracking-[0.4em] text-[#e94560] uppercase animate-pulse">
              System Online / Unified Intelligence Feed
            </span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            TIPER<span className="text-[#e94560] not-italic">LIVE</span>
          </h1>
          <div className="mt-10 flex flex-col items-center">
            <p className="text-gray-500 text-[10px] md:text-xs font-bold tracking-[0.8em] uppercase opacity-70">
              Premium Digital Archive / Matrix Evolution
            </p>
            <div className="mt-8 w-px h-16 bg-gradient-to-b from-[#e94560] to-transparent"></div>
          </div>
        </div>
      </section>

      {/* 🏗️ 2. メインレイアウト */}
      <div className="w-full max-w-[1800px] mx-auto px-[4%] flex flex-col lg:flex-row gap-12 xl:gap-16 mt-16">

        {/* 💡 左翼: サイドバーエリア */}
        <aside className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-8">
            
            {/* 💡 統合版サイドバー（マーケット分析・仕訳データ対応） */}
            {/* productが渡されない場合、サイドバーは自動的に全体の統計をフェッチします */}
            <UnifiedSidebar 
              makers={topMakers} 
              recentPosts={sidebarRecentPosts} 
            />

            {!isApiConnected && (
              <div className="p-5 border border-red-500/20 bg-red-950/5 rounded-sm">
                <p className="text-[9px] text-red-500 font-mono leading-relaxed uppercase">
                  [!] API Connection Failure: Unified Registry Empty.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* 💡 中央: メインストリーム */}
        <main className="flex-grow min-w-0">

          {/* A: 最新ニュース (WordPress) */}
          {latestPosts.length > 0 && (
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.slice(0, 3).map((post) => (
                  <Link key={post.id} href={`/news/${post.slug}`} className="group bg-[#16162d]/20 border border-white/[0.03] hover:border-[#e94560]/40 transition-all duration-500 overflow-hidden">
                    <div className="aspect-video overflow-hidden relative bg-black">
                      <img
                        src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/api/placeholder/800/450'}
                        alt={post.title?.rendered}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] to-transparent opacity-60"></div>
                    </div>
                    <div className="p-5">
                      <span className="text-[#e94560] text-[9px] font-black uppercase tracking-widest mb-2 block">{formatDate(post.date)}</span>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">{decodeHtml(post.title?.rendered)}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* B: 最新動画アーカイブ */}
          <section>
            <div className="flex justify-between items-end mb-12 border-b border-white/[0.05] pb-6">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                New <span className="text-[#e94560]">Arrivals</span>
              </h2>
              <div className="text-right">
                <p className="text-2xl font-black text-white italic leading-none">
                  {isApiConnected ? totalCount.toLocaleString() : '---'}
                </p>
                <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mt-1">Unified Registry Count</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 min-h-[600px]">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center border border-dashed border-white/5 bg-white/[0.01]">
                  <div className="inline-block animate-spin mb-4 text-[#e94560]">
                    <svg className="w-8 h-8" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
                  </div>
                  <p className="text-gray-700 font-black tracking-widest text-[10px] uppercase">
                    Awaiting incoming unified feed from Django...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-24 text-center">
              <Link href="/videos" className="inline-block group relative px-16 py-6 overflow-hidden border border-[#e94560]/50 bg-transparent transition-all duration-500 hover:shadow-[0_0_40px_rgba(233,69,96,0.3)]">
                <div className="absolute inset-0 w-0 bg-[#e94560] transition-all duration-[400ms] ease-out group-hover:w-full"></div>
                <span className="relative z-10 text-[12px] font-black uppercase tracking-[0.5em] text-white">
                  Enter Full Archive <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                </span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}