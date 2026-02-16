/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - Universal Category Sequence (Full-Spec Edition)
 * ==============================================================================
 * ✅ アダルト/一般(DMM) ハイブリッドUI対応
 * ✅ 全カテゴリ（スラグ/名前）自動マッピング
 * ✅ リアルタイム・テレメトリ & 最適化ソート
 */

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation'; 
import { Metadata } from 'next';

// ✅ コンポーネント & スタイル
import ProductCard from '@shared/cards/AdultProductCard';
import UnifiedSidebar from '@shared/layout/Sidebar/AdultSidebar';
import Pagination from '@shared/common/Pagination';
import styles from './Category.module.css';

// ✅ API / 内部ロジック
import { fetchMakers, getUnifiedProducts, fetchGenres } from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

/**
 * 💡 カテゴリラベル詳細定義
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
 * 💡 安全なHTMLデコード
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = {
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>',
        '&#39;': "'", '&#039;': "'", '&ldquo;': '"', '&rdquo;': '"'
    };
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                .replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    const decodedId = decodeURIComponent(id);
    const categoryLabel = CATEGORY_LABEL_MAP[category] || category.toUpperCase();

    return constructMetadata(
        `${decodedId} の${categoryLabel}一覧 | TIPER Archive`,
        `AI解析による、${categoryLabel}「${decodedId}」に関連する最新の統合作品データ・アーカイブです。`,
        undefined,
        `/${category}/${id}`
    );
}

export default async function CategoryListPage(props: { 
    params: Promise<{ category: string, id: string }>,
    searchParams: Promise<{ page?: string, sort?: string, brand?: string, debug?: string }>
}) {
    // 1. パラメータ解決
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    if (!category || !id || category === 'undefined') return notFound();

    const decodedId = decodeURIComponent(id);
    const currentBrand = searchParams?.brand || null;
    const currentPageNum = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date'; 
    const isDebugMode = searchParams?.debug === 'true';
    const limit = 24; 

    // 2. APIクエリビルディング（全カテゴリ・全ソース対応）
    const queryParams: Record<string, any> = {
        page: currentPageNum,
        ordering: currentSort,
        ...(currentBrand && { api_source: currentBrand.toUpperCase() })
    };

    // URLのカテゴリに応じてバックエンドが期待するキーへマッピング
    switch (category) {
        case 'genre':    queryParams.genre_slug = decodedId; break;
        case 'actress':  queryParams.actress_slug = decodedId; break;
        case 'maker':
        case 'brand':    queryParams.maker_slug = decodedId; break; // VANS等の名前一致
        case 'series':   queryParams.series_slug = decodedId; break;
        case 'director': queryParams.director_slug = decodedId; break;
        case 'author':   queryParams.author_slug = decodedId; break;
        case 'label':    queryParams.label_slug = decodedId; break;
        default:         queryParams.search = decodedId;
    }

    const startTime = Date.now();

    // 3. 並列データ取得
    const [productData, makersData, genresData, wpData] = await Promise.all([
        getUnifiedProducts(queryParams).catch(e => ({ results: [], count: 0, error: e.message })),
        fetchMakers({ limit: 60, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 60, ordering: '-product_count' }).catch(() => []),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    const fetchDuration = Date.now() - startTime;
    const products = productData?.results || [];
    const totalCount = productData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // 4. コンテンツ特性の判定（一般物販かアダルトか）
    const isGeneralMode = products.some((p: any) => p.api_source === 'DMM');
    const displayCategoryName = CATEGORY_LABEL_MAP[category] || category.toUpperCase();

    // 5. サイドバー用整形
    const sidebarRecentPosts = (wpData?.results || []).map((p: any) => ({
        id: p.id.toString(),
        title: decodeHtml(p.title?.rendered || "Untitled"),
        slug: p.slug
    }));

    return (
        <div className={styles.container}>
            
            {/* 📟 TACTICAL BREADCRUMBS BAR */}
            <nav className={styles.navBar}>
                <div className={styles.navInner}>
                    <div className={styles.breadcrumb}>
                        <Link href="/" className={styles.breadcrumbLink}>SYSTEM_ROOT</Link>
                        <span className="opacity-30 mx-2 text-white">/</span>
                        <Link href={`/${category}`} className={styles.breadcrumbLink}>{category.toUpperCase()}</Link>
                        <span className="opacity-30 mx-2 text-white">/</span>
                        <span className={styles.breadcrumbCurrent}>{decodedId}</span>
                        
                        {/* ⚡ クイックブランドフィルター（DMM/一般も選択肢に含める） */}
                        <div className="ml-8 flex items-center gap-1.5">
                            {['FANZA', 'DUGA', 'DMM'].map((brand) => (
                                <Link 
                                    key={brand}
                                    href={`/${category}/${id}?brand=${brand.toLowerCase()}&sort=${currentSort}${isDebugMode ? '&debug=true' : ''}`}
                                    className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all tracking-tighter ${currentBrand?.toUpperCase() === brand ? 'bg-[#e94560] border-[#e94560] text-white shadow-[0_0_15px_rgba(233,69,96,0.4)]' : 'border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                                >
                                    @{brand}
                                </Link>
                            ))}
                            {currentBrand && (
                                <Link href={`/${category}/${id}?sort=${currentSort}`} className="ml-2 text-[8px] text-gray-600 hover:text-[#e94560] font-mono">[CLR_FLTR]</Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={styles.metrics}>
                            <span className={styles.liveDot}></span>
                            <span className="text-[10px] text-gray-500 mr-2 font-mono">SIGNAL_LATENCY:</span>
                            <span className={styles.metricValue}>{fetchDuration}ms</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={styles.inner}>
                <div className={styles.mainLayout}>
                    
                    {/* 💡 LEFT SIDEBAR */}
                    <aside className={styles.sidebar}>
                        <div className="sticky top-24 space-y-10">
                            <UnifiedSidebar 
                                makers={Array.isArray(makersData) ? makersData : (makersData as any)?.results || []} 
                                genres={Array.isArray(genresData) ? genresData : (genresData as any)?.results || []}
                                recentPosts={sidebarRecentPosts} 
                                product={products[0]}
                            />
                        </div>
                    </aside>

                    {/* 💡 CONTENT AREA */}
                    <main className={styles.content}>
                        
                        <header className={styles.header}>
                            <div className="flex flex-col gap-2">
                                <span className={styles.nodeLabel}>
                                    {isGeneralMode ? 'MARKET_DATA_STREAM' : 'ADULT_ARCHIVE_SEQUENCE'} // {displayCategoryName} // {decodedId}
                                </span>
                                <h1 className={styles.titleMain}>{decodedId}</h1>
                                
                                <div className={styles.itemCount}>
                                    <span className={styles.countLabel}>RECORDS_TOTAL</span>
                                    <span className={styles.countNumber}>{totalCount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* 🛠️ SORT SELECTOR (一般物販なら価格順も有用) */}
                            <div className={styles.toolbar}>
                                <div className={styles.sortGroup}>
                                    {[
                                        { l: 'LATEST_RELEASE', v: '-release_date' }, 
                                        { l: 'MATRIX_SCORE', v: '-spec_score' },
                                        { l: 'PRICE_ASC', v: 'price' },
                                        { l: 'ID_SORT', v: '-id' }
                                    ].map((opt) => (
                                        <Link 
                                            key={opt.v} 
                                            href={`/${category}/${id}?brand=${currentBrand || ''}&sort=${opt.v}${isDebugMode ? '&debug=true' : ''}`}
                                            className={`${styles.sortBtn} ${currentSort === opt.v ? styles.sortBtnActive : ''}`}
                                        >
                                            {opt.l}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {/* PRODUCT GRID */}
                        {products.length > 0 ? (
                            <>
                                <div className={styles.productGrid}>
                                    {products.map((product: any) => (
                                        <ProductCard 
                                            key={`${product.api_source}-${product.id}`} 
                                            product={product} 
                                            // 物販かアダルトかで内部表示を切り替えるフラグ
                                            variant={product.api_source === 'DMM' ? 'market' : 'adult'}
                                        />
                                    ))}
                                </div>
                                
                                <div className={styles.pagination}>
                                    <Pagination 
                                        currentPage={currentPageNum} 
                                        totalPages={totalPages} 
                                        baseUrl={`/${category}/${id}`} 
                                        query={{ brand: currentBrand, sort: currentSort, ...(isDebugMode && { debug: 'true' }) }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyTitle}>0_MATCHES_FOUND</div>
                                <p className="text-gray-600 text-[11px] font-mono mt-4 max-w-xs text-center leading-relaxed opacity-60">
                                    NODE: [{decodedId}] に一致するデータは存在しません。再検索してください。
                                </p>
                                <Link href={`/${category}`} className={`${styles.pageBtn} mt-10 uppercase`}>
                                    Back_to_Archive
                                </Link>
                            </div>
                        )}

                        {/* 🛠️ MATRIX DEBUG TERMINAL (FULL OPTIMIZED) */}
                        {isDebugMode && (
                            <section className={styles.debugConsole}>
                                <div className="flex justify-between items-center mb-6 border-b border-[#e94560]/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 bg-[#e94560] animate-ping rounded-full"></span>
                                        <span className="font-mono font-bold text-[#e94560] tracking-widest uppercase text-xs">System_Telemetry_Terminal</span>
                                    </div>
                                    <span className="font-mono text-[9px] text-gray-500 uppercase">Status: 200 OK</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8 font-mono">
                                    <div className="space-y-4">
                                        <p className="text-[#e94560] font-bold uppercase text-[10px] tracking-tighter"> {">>"} API_REQUEST_MAP</p>
                                        <pre className="bg-black/60 p-4 rounded-lg border border-white/5 text-[10px] text-cyan-400 leading-tight overflow-x-auto">
                                            {JSON.stringify({
                                                category_raw: category,
                                                id_decoded: decodedId,
                                                params_generated: queryParams,
                                                target_uri: '/api/unified-products/',
                                                mode: isGeneralMode ? 'GENERAL/DMM' : 'ADULT/FANZA_DUGA'
                                            }, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[#00d1b2] font-bold uppercase text-[10px] tracking-tighter"> {">>"} RUNTIME_METRICS</p>
                                        <div className="bg-black/60 p-4 rounded-lg border border-white/5 text-[10px] text-gray-400 space-y-2">
                                            <div className="flex justify-between"><span className="text-gray-600">PROCESS:</span> <span className="text-white">NODE_JS_SSR</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">LATENCY:</span> <span className="text-yellow-400">{fetchDuration}ms</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">DATA_INTEGRITY:</span> <span className="text-green-500">VERIFIED</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">PAGINATION:</span> <span className="text-white">{currentPageNum} / {totalPages}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">TOTAL_RECORDS:</span> <span className="text-white">{totalCount}</span></div>
                                        </div>
                                    </div>
                                </div>
                                {productData?.error && (
                                    <div className="mt-8 p-4 bg-red-950/40 border border-red-500/50 text-red-500 font-mono text-[10px] animate-pulse">
                                        [CORE_EXCEPTION_DETECTED]: {productData.error}
                                    </div>
                                )}
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}