/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - Category Listing Page (Unified Stability Edition)
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation'; 
import { Metadata } from 'next';

// ✅ 共通コンポーネント
import ProductCard from '@shared/cards/AdultProductCard';
// 💡 統合版サイドバー (マーケット分析対応版)
import UnifiedSidebar from '@shared/layout/Sidebar/AdultSidebar';
import Pagination from '@shared/common/Pagination';

// ✅ 内部ロジック・API
import { fetchMakers, getAdultProducts, fetchGenres } from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

/**
 * 💡 表示用ラベルマップ
 */
const CATEGORY_LABEL_MAP: Record<string, string> = {
    'genre': 'ジャンル',
    'actress': '出演女優',
    'maker': 'メーカー',
    'brand': 'ブランド',
    'series': 'シリーズ',
    'director': '監督',
    'author': '著者',
    'label': 'レーベル',
};

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

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    const decodedId = decodeURIComponent(id);
    const categoryLabel = CATEGORY_LABEL_MAP[category] || category.toUpperCase();

    return constructMetadata(
        `${decodedId} の${categoryLabel}アーカイブ | TIPER`,
        `AI解析による、${categoryLabel}「${decodedId}」に関連する最新の統合作品データ一覧です。`,
        undefined,
        `/${category}/${id}`
    );
}

/**
 * 🎬 カテゴリ別一覧ページ
 */
export default async function CategoryListPage(props: { 
    params: Promise<{ category: string, id: string }>,
    searchParams: Promise<{ page?: string, sort?: string, site_group?: string }>
}) {
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    const { category, id } = resolvedParams;

    // 基本バリデーション
    if (!category || !id || category === 'undefined') return notFound();

    const decodedId = decodeURIComponent(id);
    const currentPageNum = Number(resolvedSearchParams?.page) || 1;
    const currentSort = resolvedSearchParams?.sort || '-release_date'; 
    const limit = 24; 
    const offset = (currentPageNum - 1) * limit;

    /**
     * 🚀 重要：Django API へのクエリパラメータ最適化
     * 全文検索(search)は重く、ジャンル名がタイトルに含まれる場合にノイズが入ります。
     * categoryに応じて、Djangoの正確なFilterBackend用キーに割り振ります。
     */
    const queryParams: Record<string, any> = {
        offset: offset,
        limit: limit,
        ordering: currentSort,
    };

    // フィルタリングの厳密化 (API側の filterset_fields に準拠)
    if (category === 'genre') {
        queryParams.genre_name = decodedId;
    } else if (category === 'actress') {
        queryParams.actress_name = decodedId;
    } else if (category === 'maker' || category === 'brand') {
        queryParams.maker_name = decodedId;
    } else if (category === 'series') {
        queryParams.series_name = decodedId;
    } else {
        // 想定外のカテゴリは全文検索にフォールバック
        queryParams.search = decodedId;
    }

    const TARGET_ENDPOINT = '/unified-adult-products/';

    // 1. 並列データフェッチ (パフォーマンス最大化)
    const [productData, makersData, genresData, wpData] = await Promise.all([
        getAdultProducts(queryParams, TARGET_ENDPOINT).catch((e) => {
            console.error("API Error [Products]:", e);
            return { results: [], count: 0 };
        }),
        fetchMakers({ limit: 100, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 100, ordering: '-product_count' }).catch(() => []),
        getSiteMainPosts(0, 6).catch(() => ({ results: [] }))
    ]);

    const products = productData?.results || [];
    const totalCount = productData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

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

    // WordPress記事の整形 (サイドバー用)
    const sidebarRecentPosts = (wpData?.results || []).map((p: any) => ({
        id: p.id.toString(),
        title: decodeHtml(p.title?.rendered || "Untitled"),
        slug: p.slug
    }));

    /**
     * 💡 表示名の確定
     * 取得した products の中から、APIが返した正式な名称（表記揺れ対策）を取得
     */
    let categoryDisplayName = decodedId; 
    if (products.length > 0) {
        const first = products[0];
        const findActualName = () => {
            if ((category === 'maker' || category === 'brand') && first.maker) return first.maker.name;
            const listKey = category === 'genre' ? 'genres' : (category === 'actress' ? 'actresses' : null);
            if (listKey && Array.isArray(first[listKey])) {
                const target = first[listKey].find((x: any) => x.name === decodedId || x.slug === decodedId);
                return target?.name;
            }
            return null;
        };
        categoryDisplayName = findActualName() || decodedId;
    }

    return (
        <div className="pb-24 bg-[#08080c] min-h-screen text-gray-100 selection:bg-[#e94560]/30 selection:text-white font-sans overflow-x-hidden">
            
            {/* 📟 SYSTEM MONITOR: デバッグを容易にするためのステータス表示 */}
            <div className="bg-[#1a1a2e] border-b border-[#e94560]/30 px-4 py-2 font-mono text-[10px] text-[#e94560] flex flex-wrap gap-x-6">
                <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${products.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> 
                    STREAM_STATUS: {products.length > 0 ? 'ACTIVE' : 'NO_DATA'}
                </span>
                <span>[FILTER: {category.toUpperCase()}]</span>
                <span>[TARGET: {decodedId}]</span>
                <span>[NODES: {totalCount}]</span>
            </div>

            <header className="relative py-32 px-[5%] text-center overflow-hidden border-b border-white/[0.03] bg-gradient-to-b from-[#11111d] to-[#08080c]">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,69,96,0.1),transparent_70%)]"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#e94560]"></span>
                        <span className="text-[10px] font-black tracking-[0.4em] text-[#e94560] uppercase">
                            Archive_Registry / {CATEGORY_LABEL_MAP[category] || category}
                        </span>
                        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#e94560]"></span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-[0_0_30px_rgba(233,69,96,0.1)]">
                        {categoryDisplayName}
                    </h1>
                </div>
            </header>

            <div className="w-full max-w-[1800px] mx-auto px-[4%] flex flex-col lg:flex-row gap-12 xl:gap-16 mt-16">

                {/* 💡 左翼: サイドバーエリア */}
                <aside className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
                    <div className="lg:sticky lg:top-24 space-y-8">
                        
                        {/* プラットフォーム・クイック・セレクター (明示的に配置) */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { name: 'DUGA', path: '/brand/duga', color: 'hover:bg-[#00d1b2] hover:border-[#00d1b2]' },
                                { name: 'FANZA', path: '/brand/fanza', color: 'hover:bg-[#e94560] hover:border-[#e94560]' },
                                { name: 'DMM', path: '/brand/dmm', color: 'hover:bg-[#f59e0b] hover:border-[#f59e0b]' }
                            ].map((site) => (
                                <Link key={site.name} href={site.path} className="block">
                                    <div className={`py-3 text-center border border-white/5 bg-white/[0.02] rounded-sm text-[9px] font-black text-gray-500 hover:text-white transition-all cursor-pointer uppercase tracking-tighter ${site.color}`}>
                                        {site.name}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* 💡 統合サイドバーの呼び出し */}
                        <UnifiedSidebar 
                            makers={topMakers} 
                            genres={topGenres}
                            recentPosts={sidebarRecentPosts} 
                            product={products[0]} // 作品を渡してマーケット分析を連動
                        />
                    </div>
                </aside>

                {/* 💡 中央: メインストリーム */}
                <main className="flex-grow min-w-0">
                    
                    {/* ソートバー */}
                    <div className="flex justify-between items-end mb-12 border-b border-white/[0.05] pb-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                            Captured <span className="text-[#e94560]">Sequence</span>
                        </h2>
                        <div className="flex gap-2">
                            {[{ l: 'NEW', v: '-release_date' }, { l: 'SCORE', v: '-spec_score' }].map((opt) => (
                                <Link key={opt.v} href={`/${category}/${id}?page=1&sort=${opt.v}`}
                                    className={`px-4 py-2 text-[10px] font-black border transition-all ${currentSort === opt.v ? 'bg-white text-black border-white' : 'bg-[#16162d] border-white/5 text-gray-500 hover:text-white'}`}>
                                    {opt.l}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 商品グリッド */}
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                {products.map((product: any) => (
                                    <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
                                ))}
                            </div>
                            
                            {/* ページネーション */}
                            <div className="mt-24">
                                <Pagination 
                                    currentPage={currentPageNum} 
                                    totalPages={totalPages} 
                                    baseUrl={`/${category}/${id}`} 
                                />
                            </div>
                        </>
                    ) : (
                        /* データの取得に失敗または該当なしの場合 */
                        <div className="py-40 text-center border border-dashed border-[#e94560]/20 bg-[#e94560]/5 rounded-sm">
                            <p className="text-[#e94560] font-black tracking-[0.3em] text-[10px] uppercase mb-4 animate-pulse">
                                [!] NO_RECORDS_FOUND_IN_THE_UNIFIED_REGISTRY
                            </p>
                            <p className="text-gray-600 text-[10px] font-mono mb-8">
                                Query: {decodedId} | Category: {category}
                            </p>
                            <Link href="/" className="px-8 py-3 bg-[#e94560] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                                Return to Main Terminal
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}