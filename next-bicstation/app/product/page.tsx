/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Product Listing - Full Integrated v11.8)
 * 🛡️ 修正内容: サイドバー個別引数(gpu, cpu等)を attribute フィルタに統合
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ コンポーネント・APIインポート
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';
import { fetchPCProducts } from '@/shared/lib/api/django/pc/products';

import styles from './ProductsPage.module.css';

/** 🔍 SEO: 条件に基づいた動的メタデータ */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = sParams.maker ? sParams.maker.toUpperCase() : '';
    // 個別引数も含めた表示用ラベルの抽出
    const attrLabel = (sParams.attribute || sParams.gpu || sParams.cpu || sParams.feature || '').toUpperCase();
    const query = sParams.q || '';
    
    return {
        title: `${maker || attrLabel || query || '製品一覧'} | PC製品カタログ | BICSTATION`,
        description: `最新のPC製品をAIスコアや性能順で比較。最適な一台が見つかります。`,
    };
}

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
        offset?: string;
        // 🚩 サイドバー(PCSidebar.tsx)の個別引数を受け取る定義
        attribute?: string; 
        gpu?: string;
        cpu?: string;
        os?: string;
        memory?: string;
        feature?: string;
    }>;
}

/** ✅ ローディング境界 */
export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono">
                <div className={styles.loadingPulse}></div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/60 mt-6 animate-pulse">
                    SYNCING_PC_DATABASE_V11.8...
                </p>
            </div>
        }>
            <ProductsPageContent {...props} />
        </Suspense>
    );
}

/** 💡 メインロジック (Server Component) */
async function ProductsPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // 1. 基本パラメータ解析
    const limit = 20;
    const currentPage = parseInt(sParams.page || '1');
    const currentOffset = sParams.offset ? parseInt(sParams.offset) : (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';

    /**
     * 🚩 【最重要：引数統合ロジック】
     * サイドバーが ?gpu=gpu-rtx-50-series のように送ってきても、
     * Djangoの attribute フィルタに一本化して流し込みます。
     */
    const currentAttr = 
        sParams.attribute || 
        sParams.gpu || 
        sParams.cpu || 
        sParams.os || 
        sParams.memory || 
        sParams.feature || 
        '';

    // 2. ネットワーク環境の特定
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";

    /** 📡 APIフェッチ */
    const response = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        currentMaker, 
        host,
        currentSort, // Djangoの 'ordering' に紐付け
        currentAttr  // 🚩 個別引数を統合した 'attribute' を渡す
    ).catch((e) => {
        console.error("🚨 [Product List API Error]:", e);
        return { results: [], count: 0 };
    });

    const results = response?.results || (Array.isArray(response) ? response : []);
    const count = response?.count || (Array.isArray(response) ? response.length : 0);

    // 3. 表示タイトルの生成
    const getDynamicTitle = () => {
        if (searchQuery) return `RESULT: "${searchQuery}"`;
        if (currentMaker && currentMaker !== 'all') return `${currentMaker.toUpperCase()} LINEUP`;
        if (currentAttr) return `${currentAttr.split('-').join(' ').toUpperCase()} SPEC`;
        return 'ALL PRODUCTS';
    };

    return (
        <main className={styles.container}>
            {/* 🛸 ヘッダーエリア */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">HOME</Link> / <span>PRODUCT</span>
                    </div>
                    <h1 className={styles.title}>{getDynamicTitle()}</h1>
                    <div className={styles.statsBadge}>
                        <span className={styles.statusLight}></span>
                        <span className={styles.hitCount}>{count.toLocaleString()}</span> 
                        <span className={styles.unit}>UNITS_IN_DB</span>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            {/* 📋 商品一覧グリッド */}
            <section className={styles.gridArea}>
                {results.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {results.map((product: any, index: number) => (
                                <ProductCard 
                                    key={product.unique_id || product.id || `pc-${index}`} 
                                    product={product} 
                                    priority={index < 4}
                                />
                            ))}
                        </div>

                        {/* 📑 ページネーション (統合後の attribute パラメータを保持) */}
                        {count > limit && (
                            <footer className={styles.footer}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={count}
                                    baseUrl={`/product?sort=${currentSort}&maker=${currentMaker}&attribute=${currentAttr}&q=${encodeURIComponent(searchQuery)}`}
                                />
                            </footer>
                        )}
                    </>
                ) : (
                    /* 🔍 ゼロマッチ表示 */
                    <div className={styles.noData}>
                        <div className={styles.noDataIcon}>∅</div>
                        <h2 className="text-xl font-bold text-white mb-2">NO_MATCHING_DATA</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            指定されたスペック（{currentAttr || '条件なし'}）に合致する製品が見つかりませんでした。
                        </p>
                        <Link href="/product" className={styles.resetButton}>
                            SYSTEM_RESET (全件表示)
                        </Link>
                        <div className={styles.debugInfo}>
                            INTEGRATED_ATTR: {currentAttr || 'NONE'} | SORT: {currentSort} | HOST: {host}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}