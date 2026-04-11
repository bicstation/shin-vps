// /app/product/page.tsx
import React from 'react';
import { headers } from 'next/headers'; // 🚀 追加: ホスト名取得用
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';
import { fetchPCProducts } from '@/shared/lib/api/django/pc/products'; // 🚀 追加: 共通パイプライン
import styles from './ProductsPage.module.css';

/**
 * 🛠️ 修正ポイント:
 * 1. 古い API_BASE (8083) のハードコードを完全に撤廃。
 * 2. getProducts 関数を fetchPCProducts 共通関数に統合。
 * 3. headers() を使用して、SSR時でも正しいドメイン（bicstation.com等）をAPIに伝達。
 */

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 1. クエリパラメータの抽出とバリデーション
    const currentPage = Number(searchParams.page) || 1;
    const currentMaker = typeof searchParams.maker === 'string' ? searchParams.maker : undefined;
    const currentSort = typeof searchParams.sort === 'string' ? searchParams.sort : '-created_at';

    // 🌐 現在のホスト名を取得（VPSの8000番かローカルの8083番かを自動判別する材料）
    const host = headers().get('host') || '';
    
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    // 2. 共通パイプラインを使って製品データを取得
    // これにより、内部で site=bicstation の付与やポート解決が自動で行われます
    const { results, count } = await fetchPCProducts(
        currentMaker,
        offset,
        limit,
        currentSort,
        host
    );

    const totalPages = Math.ceil(count / limit);

    return (
        <main className={styles.container}>
            {/* 🏷️ 見出し・統計エリア */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>
                        {currentMaker ? `${currentMaker.toUpperCase()} 製品一覧` : '全PC製品ラインナップ'}
                    </h1>
                    <p className={styles.countText}>
                        全 <span className={styles.hitCount}>{count}</span> 件のAI査定済みデータ
                    </p>
                </div>

                {/* 🛠️ ソート切り替えツールバー (Client Component) */}
                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            {/* 📋 商品カードグリッド */}
            <section className={styles.gridArea}>
                {results && results.length > 0 ? (
                    <div className={styles.grid}>
                        {results.map((product: any) => (
                            <ProductCard key={product.id || product.unique_id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noData}>
                        <p>該当する製品が見つかりませんでした。</p>
                        <span>条件を変えて検索してみてください。</span>
                    </div>
                )}
            </section>

            {/* 📑 フッター・ページネーション */}
            <footer className={styles.footer}>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/product"
                    query={{
                        maker: currentMaker,
                        sort: currentSort
                    }}
                />
            </footer>
        </main>
    );
}