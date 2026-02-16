/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation'; 
import { Metadata } from 'next';

import ProductCard from '@shared/cards/AdultProductCard';
import UnifiedSidebar from '@shared/layout/Sidebar/AdultSidebar';
import SystemDiagnosticHero from '@shared/debug/SystemDiagnosticHero'; 
import Pagination from '@shared/common/Pagination';
import styles from './Category.module.css';

import { 
    fetchMakers, 
    getUnifiedProducts, 
    fetchGenres,
    fetchSeries,    
    fetchDirectors, 
    fetchAuthors    
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import { constructMetadata } from '@shared/lib/metadata';

/** --- ユーティリティ --- */
const CATEGORY_LABEL_MAP: Record<string, string> = {
    'genre': 'ジャンル', 'actress': '出演女優', 'maker': 'メーカー',
    'brand': 'ブランド', 'series': 'シリーズ', 'director': '監督',
    'author': '著者', 'label': 'レーベル',
};

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = {
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>',
        '&#39;': "'", '&#039;': "'", '&ldquo;': '"', '&rdquo;': '"'
    };
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                .replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

const ensureArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    return [];
};

/** --- SEO --- */
export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
    const { category, id } = await params;
    const decodedId = decodeURIComponent(id);
    const categoryLabel = CATEGORY_LABEL_MAP[category] || category.toUpperCase();
    return constructMetadata(
        `${decodedId} の${categoryLabel}一覧 | TIPER Archive`,
        `AI解析による最新アーカイブ：${categoryLabel}「${decodedId}」に関連する統合データ。`,
        undefined,
        `/${category}/${id}`
    );
}

export default async function CategoryListPage(props: { 
    params: Promise<{ category: string, id: string }>,
    searchParams: Promise<{ page?: string, sort?: string, brand?: string, debug?: string }>
}) {
    const { category, id } = await props.params;
    const searchParams = await props.searchParams;

    if (!category || !id || category === 'undefined') return notFound();

    const decodedId = decodeURIComponent(id);
    const currentBrand = searchParams?.brand || null;
    const currentPageNum = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date'; 
    const isDebugMode = searchParams?.debug === 'true';
    const limit = 24; // 1ページあたりの件数

    const mainQueryParams: Record<string, any> = {
        page: currentPageNum,
        ordering: currentSort,
        ...(currentBrand && { api_source: currentBrand.toUpperCase() })
    };

    // カテゴリに応じた絞り込みパラメータの設定
    switch (category) {
        case 'genre':    mainQueryParams.genre_slug = decodedId; break;
        case 'actress':  mainQueryParams.actress_slug = decodedId; break;
        case 'maker':
        case 'brand':    mainQueryParams.maker_slug = decodedId; break;
        case 'series':   mainQueryParams.series_slug = decodedId; break;
        case 'director': mainQueryParams.director_slug = decodedId; break;
        case 'author':   mainQueryParams.author_slug = decodedId; break;
        case 'label':    mainQueryParams.label_slug = decodedId; break;
        default:         mainQueryParams.search = decodedId;
    }

    const startTime = Date.now();

    // 並列データ取得
    const [productData, makersRaw, genresRaw, seriesRaw, directorsRaw, authorsRaw, wpData] = await Promise.all([
        getUnifiedProducts(mainQueryParams).catch(() => ({ results: [], count: 0 })),
        fetchMakers({ limit: 15, ordering: '-product_count' }).catch(() => []), 
        fetchGenres({ limit: 15, ordering: '-product_count' }).catch(() => []),
        fetchSeries({ limit: 10, ordering: '-product_count' }).catch(() => []),
        fetchDirectors({ limit: 10, ordering: '-product_count' }).catch(() => []),
        fetchAuthors({ limit: 10, ordering: '-product_count' }).catch(() => []),
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    const products = productData?.results || [];
    const totalCount = productData?.count || 0;

    const sidebarProps = {
        makers: ensureArray(makersRaw),
        genres: ensureArray(genresRaw),
        series: ensureArray(seriesRaw),
        directors: ensureArray(directorsRaw),
        authors: ensureArray(authorsRaw),
        recentPosts: (wpData?.results || []).map((p: any) => ({
            id: p.id.toString(),
            title: decodeHtml(p.title?.rendered || "Untitled"),
            slug: p.slug
        })),
        product: products[0] || null
    };

    return (
        <div className={styles.container}>
            <SystemDiagnosticHero 
                id={decodedId} 
                source={category.toUpperCase()} 
                data={productData} 
                params={{ category, id, ...searchParams }} 
            />

            <nav className={styles.navBar}>
                <div className={styles.navInner}>
                    <div className={styles.breadcrumb}>
                        <Link href="/" className={styles.breadcrumbLink}>ROOT</Link>
                        <span className="opacity-30 mx-2 text-white">/</span>
                        <Link href={`/${category}`} className={styles.breadcrumbLink}>{category.toUpperCase()}</Link>
                        <span className="opacity-30 mx-2 text-white">/</span>
                        <span className={styles.breadcrumbCurrent}>{decodedId}</span>
                    </div>
                    <div className={styles.metrics}>
                        <span className={styles.liveDot}></span>
                        <span className={styles.metricValue}>{Date.now() - startTime}ms</span>
                    </div>
                </div>
            </nav>

            <div className={styles.inner}>
                <div className={styles.mainLayout}>
                    <aside className={styles.sidebar}>
                        <div className="sticky top-24 space-y-10">
                            <UnifiedSidebar {...sidebarProps} />
                        </div>
                    </aside>

                    <main className={styles.content}>
                        <header className={styles.header}>
                            <div className="flex flex-col gap-2">
                                <span className={styles.nodeLabel}>ARCHIVE_SEQUENCE // {decodedId}</span>
                                <h1 className={styles.titleMain}>{decodedId}</h1>
                                <div className={styles.itemCount}>
                                    <span className={styles.countNumber}>{totalCount.toLocaleString()}</span>
                                    <span className={styles.countLabel}>RECORDS FOUND</span>
                                </div>
                            </div>

                            <div className={styles.toolbar}>
                                <div className={styles.sortGroup}>
                                    {[
                                        { l: 'LATEST', v: '-release_date' }, 
                                        { l: 'SCORE', v: '-spec_score' },
                                        { l: 'PRICE', v: 'price' },
                                        { l: 'ID', v: '-id' }
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

                        {products.length > 0 ? (
                            <>
                                <div className={styles.productGrid}>
                                    {products.map((p: any) => (
                                        <ProductCard 
                                            key={`${p.api_source}-${p.id}`} 
                                            product={p} 
                                            variant={p.api_source === 'DMM' ? 'market' : 'adult'} 
                                        />
                                    ))}
                                </div>
                                {/* 🚀 ページングの配置 */}
                                <div className={styles.paginationSection}>
                                    <Pagination 
                                        currentPage={currentPageNum} 
                                        totalPages={Math.ceil(totalCount / limit)} 
                                        baseUrl={`/${category}/${id}`} 
                                        query={{ 
                                            sort: currentSort, 
                                            brand: currentBrand, 
                                            ...(isDebugMode && { debug: 'true' }) 
                                        }} 
                                    />
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyTitle}>0_MATCHES_FOUND</div>
                                <p className="text-gray-600 text-[11px] font-mono mt-4 opacity-60">
                                    NODE: [{decodedId}] に一致するデータは存在しません。
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}