/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - Category Listing Page (Matrix Edition)
 * ==============================================================================
 * Next.js 15 Async Params / Django REST / WordPress Hybrid Architecture
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
 * 💡 SEOメタデータ生成 (Next.js 15 Async Params 対応)
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    
    if (!category || !id) return constructMetadata("Error", "Missing Identifier");

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
        `TIPER AIが解析した、${categoryLabel}「ID:${id}」に関連する高品質なアダルトコンテンツ一覧です。`,
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

    // 3. データフェッチ (並列実行でパフォーマンスを最大化)
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

    // 4. 表示用カテゴリ名称の抽出 (各アイテムのメタデータから逆引き)
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
            console.warn("Display name extraction failed", e);
        }
    }

    return (
        <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white">
            
            {/* 🌌 セクション1: ダイナミック・ヒーローヘッダー */}
            <header className="relative py-28 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-[#0d0d1f]">
                {/* 背景装飾 */}
                <div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.08),transparent_70%)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0a14] to-transparent"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
                        <span className="text-[10px] font-black tracking-[0.6em] text-[#e94560] uppercase">
                            Archive_Node / {category}
                        </span>
                        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white italic uppercase leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {categoryDisplayName || `ID: ${id}`}
                    </h1>
                    
                    <div className="mt-12 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-5">
                            <span className="text-[10px] font-bold text-gray-500 tracking-[0.4em] uppercase opacity-60">Total Capacity</span>
                            <span className="text-3xl font-black text-white tabular-nums italic">
                                {totalCount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-[#00d1b2] tracking-[0.4em] uppercase">Packets</span>
                        </div>
                        <div className="w-64 h-[2px] bg-gradient-to-r from-transparent via-[#3d3d66] to-transparent"></div>
                    </div>
                </div>
            </header>

            {/* 🏗️ セクション2: メイン・グリッド・システム */}
            <div className="max-w-[1600px] mx-auto px-[5%] flex flex-col lg:flex-row gap-12 xl:gap-20 mt-24">
                
                {/* 💡 左翼: 高機能サイドバー */}
                <aside className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0">
                    <div className="lg:sticky lg:top-28 space-y-12">
                        <Sidebar 
                            makers={makers} 
                            recentPosts={latestPosts.map((p: any) => ({
                                id: p.id.toString(),
                                title: p.title.rendered,
                                slug: p.slug
                            }))} 
                        />
                    </div>
                </aside>

                {/* 💡 中央: コンテンツストリーム */}
                <main className="flex-grow min-w-0">
                    
                    {/* ツールバー (ソートアルゴリズム) */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b border-white/[0.05]">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sort_Logic</h3>
                            <div className="text-lg font-black text-white italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#e94560] animate-pulse"></span>
                                ARCHIVE_SYNC_ACTIVE
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { label: 'NEW_RELEASE', value: '-created_at', desc: '最新順' },
                                { label: 'POPULARITY', value: '-views', desc: '人気順' },
                                { label: 'PRICE_UNIT', value: 'price', desc: '価格順' },
                            ].map((opt) => (
                                <Link
                                    key={opt.value}
                                    href={`/${category}/${id}?page=1&sort=${opt.value}`}
                                    className={`group relative px-6 py-4 rounded-sm text-[10px] font-black transition-all border ${
                                        currentSort === opt.value 
                                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                            : 'bg-[#16162d] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    <span className="relative z-10">{opt.label}</span>
                                    {currentSort === opt.value && (
                                        <div className="absolute -inset-0.5 bg-white blur-sm opacity-20"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* メイン・グリッド */}
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-x-8 gap-y-16">
                                {products.map((product: any) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                    />
                                ))}
                            </div>

                            {/* 💡 ページネーション・コントロール */}
                            <div className="mt-32 pt-20 border-t border-white/[0.05]">
                                <Pagination 
                                    currentPage={currentPageNum} 
                                    totalPages={totalPages} 
                                    baseUrl={`/${category}/${id}`}
                                />
                                <div className="text-center mt-12">
                                    <div className="inline-block px-6 py-2 border border-white/5 rounded-full">
                                        <p className="text-[9px] font-black text-gray-600 tracking-[0.5em] uppercase">
                                            Stream_Offset: {offset.toLocaleString()} / {totalCount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* 💡 404/Empty ステート */
                        <div className="py-40 text-center bg-[#111125]/50 rounded-[3rem] border border-white/5 backdrop-blur-xl">
                            <div className="mb-10 text-6xl opacity-20 grayscale">📡</div>
                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Signal Lost</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] max-w-xs mx-auto mb-12 leading-relaxed">
                                ノード「{id}」からのデータ受信に失敗しました。アーカイブが未生成か、移動された可能性があります。
                            </p>
                            <Link href="/" className="inline-flex items-center gap-4 px-12 py-5 rounded-sm bg-[#e94560] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#ff5e78] transition-colors">
                                <span>Reboot System</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </Link>
                        </div>
                    )}
                </main>
            </div>
            
            {/* 装飾用ボトムライン */}
            <div className="mt-40 h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
    );
}