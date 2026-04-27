/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 💻 BICSTATION PC製品カタログ (Catalog Hub)
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

import Pagination from '@/shared/components/molecules/Pagination';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import { fetchPCProducts } from '@/shared/lib/api/django/pc/products';

import styles from './CatalogPage.module.css';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'PC製品カタログ一覧 | BICSTATION',
    description: '最新のゲーミングPCからクリエイター向けノートPCまで。スペック、価格、AIスコアで比較・検索が可能なデータベース。',
};

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        q?: string; 
        maker?: string; 
        attribute?: string;
        offset?: string;
    }>;
}

export default async function CatalogPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-10 h-10 border-t-2 border-blue-500 animate-spin mb-6 rounded-full"></div>
                FETCHING_CATALOG_DATA...
            </div>
        }>
            <CatalogPageContent {...props} />
        </Suspense>
    );
}

async function CatalogPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;

    // ✅ headers削除 → 固定
    const host = "bicstation.com";

    const limit = 40;
    const searchQuery = sParams.q || '';
    const maker = sParams.maker || '';
    const attribute = sParams.attribute || '';
    
    const currentPage = sParams.page 
        ? Math.max(1, parseInt(sParams.page)) 
        : (sParams.offset ? Math.floor(parseInt(sParams.offset) / limit) + 1 : 1);
    
    const currentOffset = (currentPage - 1) * limit;

    const pcData = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        attribute || maker,
        host
    ).catch((e) => {
        console.error("[Catalog API Error]:", e);
        return { results: [], count: 0 };
    });

    const totalCount = pcData?.count || 0;
    const products = pcData?.results || [];
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className={styles.fullWidthWrapper}>
            <main className={styles.fullMain}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerDeco}></div>
                    <h1 className={styles.mainTitle}>PC製品カタログ</h1>
                    <p className={styles.subDescription}>
                        <span className={styles.highlight}>{totalCount.toLocaleString()}</span> 件のデータベースから最適な1台を抽出
                    </p>
                </header>

                <section className={styles.searchSection}>
                    <form action="/catalog" method="GET" className={styles.searchForm}>
                        <div className={styles.inputGroup}>
                            <input 
                                type="text" 
                                name="q" 
                                defaultValue={searchQuery}
                                placeholder="モデル名、CPU、GPUなどを入力..." 
                                className={styles.searchInput}
                            />

                            {maker && <input type="hidden" name="maker" value={maker} />}
                            {attribute && <input type="hidden" name="attribute" value={attribute} />}
                            
                            <button type="submit" className={styles.searchButton}>
                                🔍 データベース検索
                            </button>
                        </div>
                    </form>
                </section>

                {(searchQuery || maker || attribute) && (
                    <div className={styles.activeFilters}>
                        <span className={styles.filterLabel}>現在の条件:</span>
                        {searchQuery && <span className={styles.filterBadge}>"{searchQuery}"</span>}
                        {maker && <span className={styles.filterBadge}>メーカー: {maker}</span>}
                        {attribute && <span className={styles.filterBadge}>属性: {attribute}</span>}
                        <Link href="/catalog" className={styles.clearFilter}>リセット</Link>
                    </div>
                )}

                <section className={styles.productSection}>
                    <div className={styles.gridHeader}>
                        <h2 className={styles.productGridTitle}>
                            {searchQuery ? `検索結果: ${searchQuery}` : '製品ライブラリ'}
                        </h2>
                    </div>

                    {products.length > 0 ? (
                        <div className={styles.productGrid}>
                            {products.map((product: any) => (
                                <ProductCard 
                                    key={product.unique_id || product.id} 
                                    product={product} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noData}>
                            <div className={styles.noDataIcon}>⚠️</div>
                            <p>該当する製品は見つかりませんでした。</p>
                        </div>
                    )}

                    {totalCount > limit && (
                        <div className={styles.paginationWrapper}>
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/catalog"
                                query={{
                                    q: searchQuery || undefined,
                                    maker: maker || undefined,
                                    attribute: attribute || undefined
                                }}
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}