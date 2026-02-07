/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - Category Listing Page (Matrix Edition)
 * ==============================================================================
 * このページは、Next.js 15の非同期I/OとDjango REST Frameworkの高速連携、
 * そしてWordPressの最新ニュースを統合した、TIPERの基幹アーカイブページです。
 */

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation'; 
import { Metadata } from 'next';

// ✅ 共通コンポーネント (Atomic Design準拠)
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar';
import Pagination from '@shared/common/Pagination';

// ✅ 内部ロジック・API
import { fetchMakers, getAdultProducts } from '@shared/lib/api/django';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

/**
 * 💡 SEOメタデータ生成 (高度な文字列抽出)
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    
    // ガード
    if (!category || !id) return constructMetadata("Error", "Missing Identifier");

    // カテゴリの物理名への変換
    const labelMap: { [key: string]: string } = {
        'genre': 'ジャンル',
        'actress': '出演女優',
        'maker': 'メーカー',
        'series': 'シリーズ',
        'label': 'レーベル',
    };
    const categoryLabel = labelMap[category] || category.toUpperCase();

    return constructMetadata(
        `${categoryLabel} ID:${id} - プレミアム解析アーカイブ | TIPER Live`,
        `TIPER AIが解析した、${categoryLabel}「ID:${id}」に関連する高品質なアダルトコンテンツ一覧です。最新のリリース情報からAI解析スコア、ユーザーレビューまで網羅。`,
        undefined,
        `/${category}/${id}`
    );
}

/**
 * 💡 カテゴリ一覧ページメインコンポーネント
 */
export default async function CategoryListPage(props: { 
    params: Promise<{ category: string, id: string }>,
    searchParams: Promise<{ page?: string, sort?: string }>
}) {
    // 1. Next.js 15 準拠の非同期パラメータ解決
    const [resolvedParams, resolvedSearchParams] = await Promise.all([
        props.params,
        props.searchParams
    ]);
    
    const { category, id } = resolvedParams;
    const currentPageNum = Number(resolvedSearchParams.page) || 1;
    const currentSort = resolvedSearchParams.sort || '-created_at'; 
    const limit = 20;
    const offset = (currentPageNum - 1) * limit;

    // --- 🛡️ 不正URLガード ---
    if (!category || !id || category === 'undefined' || id === 'undefined') {
        return notFound(); 
    }

    // 2. APIクエリキーの動的マッピング
    const categoryMap: { [key: string]: string } = {
        'genre': 'genres',
        'actress': 'actresses',
        'maker': 'maker',
        'makers': 'maker',
        'series': 'series',
        'label': 'label',
    };
    const queryKey = categoryMap[category] || category;

    // 3. データフェッチ (並列実行でTime To First Byteを最小化)
    const [productData, makersData, wpData] = await Promise.all([
        getAdultProducts({
            [queryKey]: id,
            offset: offset,
            limit: limit,
            ordering: currentSort
        }).catch((e) => {
            console.error("Critical: Failed to fetch products", e);
            return { results: [], count: 0 };
        }),
        fetchMakers().catch(() => []),
        getSiteMainPosts(0, 5).catch(() => ({ results: [] }))
    ]);

    const products = productData?.results || [];
    const totalCount = productData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const makers = Array.isArray(makersData) ? makersData : (makersData as any).results || [];
    const latestPosts = wpData?.results || [];

    // 4. 表示用カテゴリ名称のインテリジェント抽出
    let categoryDisplayName = "";
    if (products.length > 0) {
        const first = products[0];
        try {
            if (category.includes('genre')) {
                categoryDisplayName = first.genres?.find((x: any) => String(x.id) === id)?.name;
            } else if (category.includes('actress')) {
                categoryDisplayName = first.actresses?.find((x: any) => String(x.id) === id)?.name;
            } else if (category.includes('maker')) {
                categoryDisplayName = first.maker?.name;
            } else if (category === 'series') {
                categoryDisplayName = first.series?.name;
            } else if (category === 'label') {
                categoryDisplayName = first.label?.name;
            }
        } catch (e) {
            console.warn("Display name extraction partially failed", e);
        }
    }

    return (
        <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white">
            
            {/* 🌌 セクション1: ダイナミック・ヒーローヘッダー */}
            <header className="relative py-28 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#16162d] to-[#0a0a14]">
                {/* サイバーパンク背景レイヤー */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.1),transparent_70%)]"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <span className="h-[1px] w-8 bg-[#e94560]"></span>
                        <span className="text-[11px] font-black tracking-[0.5em] text-[#e94560] uppercase animate-pulse">
                            Node Stream / {category}
                        </span>
                        <span className="h-[1px] w-8 bg-[#e94560]"></span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white italic uppercase leading-none drop-shadow-2xl">
                        {categoryDisplayName || `NODE_ID: ${id}`}
                    </h1>
                    
                    <div className="mt-10 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase opacity-50">Archive Capacity</span>
                            <span className="text-2xl font-black text-white italic">
                                {totalCount.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-[#e94560] tracking-widest uppercase">Items</span>
                        </div>
                        <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                    </div>
                </div>
            </header>

            {/* 🏗️ セクション2: メイン・グリッド・システム */}
            <div className="max-w-[1440px] mx-auto px-[5%] flex flex-col lg:flex-row gap-16 mt-20">
                
                {/* 💡 左翼: 高機能サイドバー (Sticky実装) */}
                <aside className="w-full lg:w-[340px] flex-shrink-0">
                    <div className="lg:sticky lg:top-28 space-y-12">
                        <Sidebar 
                            makers={makers} 
                            latestPosts={latestPosts} 
                        />
                        {/* 追加のバナーや情報エリアをここに挿入可能 */}
                    </div>
                </aside>

                {/* 💡 中央: コンテンツストリーム */}
                <main className="flex-grow min-w-0">
                    
                    {/* ツールバー (ソート・フィルタ) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 pb-8 border-b border-white/[0.05]">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Sort Algorithm</h3>
                            <div className="text-sm font-bold text-white italic">MATCHING_RESULTS_STREAM</div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {[
                                { label: 'DATE_DESC', value: '-created_at', desc: '最新順' },
                                { label: 'VIEW_RANK', value: '-views', desc: '人気順' },
                                { label: 'PRICE_FLOW', value: 'price', desc: '価格順' },
                            ].map((opt) => (
                                <Link
                                    key={opt.value}
                                    href={`/${category}/${id}?page=1&sort=${opt.value}`}
                                    className={`group relative px-6 py-3 rounded-sm text-[10px] font-black transition-all border ${
                                        currentSort === opt.value 
                                            ? 'bg-[#e94560] border-[#e94560] text-white shadow-[0_15px_30px_rgba(233,69,96,0.3)]' 
                                            : 'bg-[#1a1a35] border-white/10 text-gray-500 hover:border-[#e94560]/50 hover:text-white'
                                    }`}
                                >
                                    <span className="block">{opt.label}</span>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{opt.desc}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* メイン・グリッド */}
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-14">
                                {products.map((product: any) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                    />
                                ))}
                            </div>

                            {/* 💡 ページネーション・ハブ (sharedパーツを正しく統合) */}
                            <div className="mt-32 pt-16 border-t border-white/[0.05]">
                                <Pagination 
                                    currentPage={currentPageNum} 
                                    totalPages={totalPages} 
                                    baseUrl={`/${category}/${id}`}
                                    searchParams={resolvedSearchParams} 
                                />
                                <div className="text-center mt-8">
                                    <p className="text-[9px] font-black text-gray-700 tracking-[0.5em] uppercase">
                                        End of Stream Offset: {offset} - {offset + products.length}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* 💡 データ不在時の404ステート */
                        <div className="py-48 text-center bg-gradient-to-b from-[#16162d]/40 to-transparent rounded-[4rem] border border-dashed border-white/5 backdrop-blur-md">
                            <div className="relative inline-block mb-12">
                                <div className="text-8xl opacity-[0.05] grayscale select-none">🛸</div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-black text-[#e94560] tracking-widest animate-pulse">EMPTY_SIGNAL</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">Database Connection Lost</h3>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-loose mb-12">
                                指定されたノード「{id}」から有効なデータパケットを検出できませんでした。
                            </p>
                            <Link href="/" className="inline-flex items-center gap-4 px-14 py-6 rounded-full bg-[#e94560] text-white text-[12px] font-black uppercase tracking-[0.3em] hover:scale-105 hover:shadow-[0_20px_50px_rgba(233,69,96,0.4)] transition-all">
                                <span>Return to Mainframe</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </Link>
                        </div>
                    )}
                </main>
            </div>
            
            {/* フッター装飾用ボトムバー */}
            <div className="mt-32 h-[1px] w-full bg-gradient-to-r from-transparent via-[#e94560]/20 to-transparent"></div>
        </div>
    );
}