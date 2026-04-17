/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Product Listing - Optimized v11.2)
 * 🛡️ Maya's Logic: フィルタ・属性・検索の完全同期
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

/** 🔍 メタデータの動的生成 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = sParams.maker ? sParams.maker.toUpperCase() : '';
    const query = sParams.q || '';
    
    return {
        title: `${maker || query || '製品一覧'} | PC製品カタログ | BICSTATION`,
        description: `${maker}の最新PC製品からAIスコア順で最適な一台を探せます。`,
    };
}

// Next.js 15推奨設定
export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
        offset?: string;
        attribute?: string; // 💡 属性フィルタ対応
    }>;
}

/**
 * ✅ エントリポイント: スケルトンローディングによる Suspense
 */
export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono">
                <div className={styles.loadingPulse}></div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/60 mt-6 animate-pulse">
                    INITIALIZING_PRODUCT_DATABASE_CONNECT...
                </p>
            </div>
        }>
            <ProductsPageContent {...props} />
        </Suspense>
    );
}

/**
 * 💡 実装本体
 */
async function ProductsPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // 🌐 ホスト・サイトコンテクスト解析
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";

    // 🛠️ パラメータの正規化
    const limit = 20;
    const currentPage = parseInt(sParams.page || '1');
    const currentOffset = sParams.offset ? parseInt(sParams.offset) : (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-updated_at'; // 最新更新順をデフォルトに
    const searchQuery = sParams.q || '';
    const currentAttr = sParams.attribute || '';

    // 📡 APIフェッチ (属性フィルタ attribute を引数に追加)
    // 注意: fetchPCProductsの引数定義に合わせて順序を確認してください
    const response = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        currentMaker, 
        host,
        currentSort,
        currentAttr
    ).catch((e) => {
        console.error("🚨 [Product List API Error]:", e);
        return { results: [], count: 0 };
    });

    const results = response?.results || (Array.isArray(response) ? response : []);
    const count = response?.count || (Array.isArray(response) ? response.length : 0);

    // 🏷️ タイトルの動的最適化ロジック
    const getDynamicTitle = () => {
        if (searchQuery) return `検索結果: "${searchQuery}"`;
        if (currentMaker) return `${currentMaker.toUpperCase()} 製品一覧`;
        if (currentAttr) return `${currentAttr.split('-').join(' ').toUpperCase()} 関連製品`;
        return 'PC製品カタログ';
    };

    return (
        <main className={styles.container}>
            {/* 🛸 ヘッダーユニット: 統計とコントロール */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">HOME</Link> / <span>PRODUCT</span>
                    </div>
                    <h1 className={styles.title}>{getDynamicTitle()}</h1>
                    <div className={styles.statsBadge}>
                        <span className={styles.statusLight}></span>
                        <span className={styles.hitCount}>{count.toLocaleString()}</span> 
                        <span className={styles.unit}>PRODUCTS_DETECTED</span>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            {/* 📋 メイングリッドエリア */}
            <section className={styles.gridArea}>
                {results.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {results.map((product: any, index: number) => (
                                <ProductCard 
                                    key={product.unique_id || product.id} 
                                    product={product} 
                                    priority={index < 4} // 最初の4枚はLCP最適化
                                />
                            ))}
                        </div>

                        {/* 📑 ページネーション: すべてのフィルタ条件を baseUrl に凝縮 */}
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
                    /* 🔍 ゼロマッチ時のフォールバック */
                    <div className={styles.noData}>
                        <div className={styles.noDataIcon}>NOT_FOUND</div>
                        <h2 className="text-xl font-bold text-white mb-2">製品が見つかりませんでした</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            条件を緩和するか、別のキーワードでお試しください。
                        </p>
                        <Link href="/product" className={styles.resetButton}>
                            条件をクリアして全件表示
                        </Link>
                        <div className={styles.debugInfo}>
                            NODE: {host} | SIG: {currentMaker || 'ALL'} / {currentAttr || 'ALL'}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}