/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Product Listing)
 * 🛡️ Maya's Logic: 物理構造 v3.3 / Next.js 15 対応版 [Fixed: Sort Pipeline]
 * 物理パス: app/product/page.tsx
 * =====================================================================
 */
// next-bicstation/app/product/page.tsx

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';

// ✅ インポートパスを物理構造に合わせる
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';

// ✅ API関数のパス
import { fetchPCProducts } from '@/shared/lib/api/django/pc';

import styles from './ProductsPage.module.css';

// メタデータの設定
export const metadata: Metadata = {
    title: 'PC製品一覧 | BICSTATION',
    description: 'メーカー別・ソート別で探す最新PC製品データベース。',
};

// Next.js 15推奨の動的設定
export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
    }>;
}

/**
 * ✅ エントリポイント: Next.js 15 の searchParams 処理
 */
export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-slate-500">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full"></div>
                Loading_Product_Catalog...
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
    
    // パラメータの正規化
    const currentPage = Math.max(1, Number(sParams.page) || 1);
    const currentMaker = sParams.maker || undefined;
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';
    
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    // 🌐 ホスト名を取得
    const headerList = await headers();
    const host = headerList.get('host') || '';

    // 2. 【修正点】fetchPCProducts に currentSort を渡す
    // ※ API側の定義に合わせて引数の順番を確認してください
    const { results, count } = await fetchPCProducts(
        searchQuery, 
        offset, 
        limit, 
        currentMaker || '', 
        host,
        currentSort // 🔥 ここが抜けていたためソートが反映されませんでした
    ).catch((e) => {
        console.error("[Product List API Error]:", e);
        return { results: [], count: 0 };
    });

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
                {results && results.length > 0 ? (
                    <div className={styles.grid}>
                        {results.map((product: any) => (
                            <ProductCard 
                                key={product.unique_id || product.id} 
                                product={product} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noData}>
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="font-bold">該当する製品が見つかりませんでした。</p>
                        <span className="text-sm text-slate-400">条件を変えて検索してみてください。</span>
                    </div>
                )}
            </section>

            {/* 📑 フッター・ページネーション */}
            <footer className={styles.footer}>
                <Pagination 
                    currentOffset={offset}
                    limit={limit}
                    totalCount={count}
                    baseUrl="/product"
                />
            </footer>
        </main>
    );
}