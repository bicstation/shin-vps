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

// ✅ 共通コンポーネント
import ProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar';
import Pagination from '@shared/common/Pagination';

// ✅ 内部ロジック・API
import { fetchMakers, getFanzaProducts } from '@shared/lib/api/django';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

/**
 * 💡 SEOメタデータ生成 (Next.js 15 Async Params 対応)
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    
    if (!category || !id) return constructMetadata("Error", "Missing Identifier");

    const labelMap: Record<string, string> = {
        'genre': 'ジャンル',
        'actress': '出演女優',
        'maker': 'メーカー',
        'brand': 'ブランド',
        'series': 'シリーズ',
        'director': '監督',
        'label': 'レーベル',
        'author': '著者',
    };
    
    const decodedId = decodeURIComponent(id);
    const categoryLabel = labelMap[category] || category.toUpperCase();

    return constructMetadata(
        `${categoryLabel}: ${decodedId} - プレミアム解析アーカイブ | TIPER Live`,
        `TIPER AIが解析した、${categoryLabel}「${decodedId}」に関連する高品質なコンテンツ一覧です。`,
        undefined,
        `/${category}/${id}`
    );
}

export default async function CategoryListPage(props: { 
    params: Promise<{ category: string, id: string }>,
    searchParams: Promise<{ page?: string, sort?: string }>
}) {
    // 1. 非同期パラメータの安全な解決
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    
    const { category, id } = resolvedParams;

    // パラメータが不正な場合は即座に 404
    if (!category || !id || category === 'undefined' || id === 'undefined') {
        return notFound(); 
    }

    const decodedId = decodeURIComponent(id);
    const currentPageNum = Number(resolvedSearchParams?.page) || 1;
    const currentSort = resolvedSearchParams?.sort || '-release_date'; 
    const limit = 24; 
    const offset = (currentPageNum - 1) * limit;

    /**
     * 💡 2. Django API キーマッピング
     */
    const categoryMap: Record<string, string> = {
        'genre': 'genres',
        'actress': 'actresses',
        'maker': 'maker',
        'series': 'series',
        'director': 'director',
        'author': 'authors',
    };
    
    const queryKey = categoryMap[category] || category;

    // 3. データフェッチ (エラーハンドリングを強化)
    const [productData, makersData, wpData] = await Promise.all([
        getFanzaProducts({
            [queryKey]: decodedId,
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
    const makers = Array.isArray(makersData) ? makersData : (makersData as any)?.results || [];
    const latestPosts = wpData?.results || [];

    // 4. 正確なカテゴリ表示名の取得ロジック (Nullガード徹底)
    let categoryDisplayName = decodedId; 
    if (products.length > 0) {
        const first = products[0];
        try {
            const findNameInList = (list: any[]) => {
                if (!Array.isArray(list)) return null;
                const target = list.find((x: any) => String(x.id) === decodedId || x.slug === decodedId);
                return target ? target.name : null;
            };

            if (category === 'genre') {
                categoryDisplayName = findNameInList(first.genres) || categoryDisplayName;
            } else if (category === 'actress') {
                categoryDisplayName = findNameInList(first.actresses) || categoryDisplayName;
            } else if (category === 'maker' && first.maker) {
                if (String(first.maker.id) === decodedId || first.maker.slug === decodedId) {
                    categoryDisplayName = first.maker.name;
                }
            } else if (category === 'author') {
                categoryDisplayName = findNameInList(first.authors) || categoryDisplayName;
            }
        } catch (e) {
            console.warn("Display name extraction failed", e);
        }
    }

    return (
        <div className="pb-24 bg-[#0a0a14] min-h-screen text-gray-100">
            {/* 🌌 セクション1: ヒーローヘッダー */}
            <header className="relative py-28 px-[5%] text-center overflow-hidden bg-[#0d0d1f]">
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <span className="h-[1px] w-12 bg-[#e94560]"></span>
                        <span className="text-[10px] font-black tracking-[0.6em] text-[#e94560] uppercase">
                            Archive_Node / {category}
                        </span>
                        <span className="h-[1px] w-12 bg-[#e94560]"></span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white italic uppercase leading-none">
                        {categoryDisplayName}
                    </h1>
                    
                    <div className="mt-12 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-5">
                            <span className="text-[10px] font-bold text-gray-500 tracking-[0.4em] uppercase">Total Items</span>
                            <span className="text-3xl font-black text-white tabular-nums italic">
                                {totalCount.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-64 h-[2px] bg-gradient-to-r from-transparent via-[#3d3d66] to-transparent"></div>
                    </div>
                </div>
                {/* 装飾用背景文字 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] select-none z-0 italic">
                    {category.toUpperCase()}
                </div>
            </header>

            {/* 🏗️ セクション2: グリッドシステム */}
            <div className="max-w-[1600px] mx-auto px-[5%] flex flex-col lg:flex-row gap-12 mt-24">
                {/* 💡 サイドバー */}
                <aside className="w-full lg:w-[320px] flex-shrink-0">
                    <div className="lg:sticky lg:top-28 space-y-12">
                        <Sidebar 
                            makers={makers} 
                            recentPosts={latestPosts.map((p: any) => ({
                                id: p.id.toString(),
                                title: p.title?.rendered || "Untitled",
                                slug: p.slug
                            }))} 
                        />
                    </div>
                </aside>

                {/* 💡 メインコンテンツ */}
                <main className="flex-grow min-w-0">
                    {/* ソートツールバー */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b border-white/[0.05]">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sort_Logic</h3>
                            <div className="text-lg font-black text-[#00d1b2] italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#00d1b2] animate-pulse"></span>
                                READY_TO_STREAM
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { label: 'NEW_RELEASE', value: '-release_date' },
                                { label: 'LOW_PRICE', value: 'price' },
                                { label: 'HIGH_SCORE', value: '-score_visual' },
                            ].map((opt) => (
                                <Link
                                    key={opt.value}
                                    href={`/${category}/${id}?page=1&sort=${opt.value}`}
                                    className={`px-6 py-4 text-[10px] font-black border transition-all ${
                                        currentSort === opt.value 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-[#16162d] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {opt.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* メイン・グリッド */}
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                                {products.map((product: any) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                    />
                                ))}
                            </div>

                            <div className="mt-32 pt-20 border-t border-white/[0.05]">
                                <Pagination 
                                    currentPage={currentPageNum} 
                                    totalPages={totalPages} 
                                    baseUrl={`/${category}/${id}`}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="py-40 text-center bg-[#111125]/50 rounded-[3rem] border border-white/5">
                            <h3 className="text-4xl font-black text-white uppercase italic mb-4">No Data found</h3>
                            <p className="text-gray-500 text-xs tracking-[0.3em] mb-12">
                                指定されたカテゴリ「{decodedId}」のデータが見つかりません。
                            </p>
                            <Link href="/" className="px-12 py-5 bg-[#e94560] text-white text-[11px] font-black uppercase hover:bg-[#ff4d6d] transition-colors">
                                Return to Archive
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}