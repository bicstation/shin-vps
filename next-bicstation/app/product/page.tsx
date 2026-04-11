// /app/product/page.tsx
import React from 'react';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';
import styles from './ProductsPage.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://api-bicstation-host:8083';

/**
 * 🛰️ サーバーサイドでのデータ取得
 * @param page ページ番号
 * @param maker メーカーフィルタ (任意)
 * @param ordering ソート順 (任意)
 */
async function getProducts(page: number, maker?: string, ordering?: string) {
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ordering: ordering || '-created_at' // デフォルトは新着順
    });

    if (maker) params.append('maker', maker);

    const url = `${API_BASE}/api/general/pc-products/?${params.toString()}`;

    // リアルタイム性を重視し、キャッシュは使用せずサーバーサイドで常に最新を取得
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    
    return res.json();
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 1. クエリパラメータの抽出とバリデーション
    const currentPage = Number(searchParams.page) || 1;
    const currentMaker = typeof searchParams.maker === 'string' ? searchParams.maker : undefined;
    const currentSort = typeof searchParams.sort === 'string' ? searchParams.sort : '-created_at';

    // 2. APIから製品データを取得
    const data = await getProducts(currentPage, currentMaker, currentSort);
    const totalPages = Math.ceil(data.count / 20);

    return (
        <main className={styles.container}>
            {/* 🏷️ 見出し・統計エリア */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>
                        {currentMaker ? `${currentMaker.toUpperCase()} 製品一覧` : '全PC製品ラインナップ'}
                    </h1>
                    <p className={styles.countText}>
                        全 <span className={styles.hitCount}>{data.count}</span> 件のAI査定済みデータ
                    </p>
                </div>

                {/* 🛠️ ソート切り替えツールバー (Client Component) */}
                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            {/* 📋 商品カードグリッド */}
            <section className={styles.gridArea}>
                {data.results.length > 0 ? (
                    <div className={styles.grid}>
                        {data.results.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
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