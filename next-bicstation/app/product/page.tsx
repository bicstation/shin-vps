/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Product Listing)
 * 🛡️ Maya's Logic: 物理構造 v11.1 / Next.js 15 対応版
 * 物理パス: app/product/page.tsx
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link'; // ✅ 重要: インポート漏れを修正

// ✅ インポートパスを最新の物理構造に同期
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';

// ✅ 共通API定義から取得 (fetchPCProducts)
import { fetchPCProducts } from '@/shared/lib/api/django/pc/products';

import styles from './ProductsPage.module.css';

export const metadata: Metadata = {
    title: 'PC製品一覧 | BICSTATION',
    description: 'メーカー別・ソート別で探す最新PC製品データベース。AIスコアに基づいた最適な製品比較が可能です。',
};

// Next.js 15推奨の動的設定
export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
        offset?: string;
    }>;
}

/**
 * ✅ エントリポイント: Suspenseによる非同期レンダリング
 */
export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-slate-500">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                LOADING_PRODUCT_CATALOG_V11.1...
            </div>
        }>
            <ProductsPageContent {...props} />
        </Suspense>
    );
}

/**
 * 💡 実際のコンテンツ（Server Component）
 */
async function ProductsPageContent({ searchParams }: PageProps) {
    // 1. Next.js 15 では searchParams は await が必須
    const sParams = await searchParams;
    
    // 🌐 ホスト名取得の安定化（Nginx / Proxy環境対応）
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";

    // 2. パラメータの正規化
    const limit = 20;
    const currentPage = sParams.page ? Math.max(1, parseInt(sParams.page)) : 1;
    const currentOffset = sParams.offset 
        ? parseInt(sParams.offset) 
        : (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';
    
    // 3. APIフェッチ
    // 引数順序: query, offset, limit, maker, host, sort
    const response = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        currentMaker, 
        host,
        currentSort
    ).catch((e) => {
        console.error("🚨 [Product List API Fatal Error]:", e);
        return { results: [], count: 0 };
    });

    // 🛡️ APIレスポンス構造の正規化ガード
    const results = response?.results || (Array.isArray(response) ? response : []);
    const count = response?.count || (Array.isArray(response) ? response.length : 0);

    return (
        <main className={styles.container}>
            {/* 🏷️ 見出し・統計エリア */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>
                        {currentMaker ? `${currentMaker.toUpperCase()} 製品一覧` : '全PC製品ラインナップ'}
                    </h1>
                    <p className={styles.countText}>
                        全 <span className={styles.hitCount}>{count.toLocaleString()}</span> 件のAI査定済みデータ
                    </p>
                </div>

                {/* 🛠️ ソート切り替えツールバー */}
                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            {/* 📋 商品カードグリッド */}
            <section className={styles.gridArea}>
                {results.length > 0 ? (
                    <div className={styles.grid}>
                        {results.map((product: any) => (
                            <ProductCard 
                                key={product.unique_id || product.id || `pc-${Math.random()}`} 
                                product={product} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noData}>
                        <div className="text-4xl mb-4 opacity-20">🔍</div>
                        <p className="font-bold text-slate-300">該当する製品が見つかりませんでした。</p>
                        <span className="text-sm text-slate-500 font-mono mt-2">
                            QUERY: {searchQuery || 'NONE'} | NODE: {host}
                        </span>
                        <div className="mt-6">
                            <Link href="/product" className="text-blue-400 hover:underline text-sm">
                                全ての製品を表示し直す
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* 📑 フッター・ページネーション */}
            {count > limit && (
                <footer className={styles.footer}>
                    <Pagination 
                        currentOffset={currentOffset}
                        limit={limit}
                        totalCount={count}
                        // 💡 修正: ページ移動時も現在のソート、メーカー、検索クエリをすべてURLに引き継ぐ
                        baseUrl={`/product?sort=${currentSort}&maker=${currentMaker}&q=${encodeURIComponent(searchQuery)}`}
                    />
                </footer>
            )}
        </main>
    );
}