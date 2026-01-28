import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import ProductCard from '@/components/product/ProductCard';
import { fetchPCProducts, fetchMakers, fetchPostList } from '@/lib/api';
import styles from './CatalogPage.module.css';

export const metadata: Metadata = {
    title: 'PC製品カタログ一覧 | BICSTATION',
    description: '最新のゲーミングPCからノートPCまで。スペック、価格、AIスコアで絞り込み検索が可能なPCデータベース。',
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

export default async function CatalogPage({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // パラメータ取得
    const currentPage = Number(sParams.page) || 1;
    const limit = 40;
    const searchQuery = (Array.isArray(sParams.q) ? sParams.q[0] : sParams.q) || '';
    const maker = (Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker) || '';
    const attribute = (Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute) || '';
    
    // Offset計算（検索時は1ページ目に戻るのが一般的）
    const currentOffset = sParams.offset ? parseInt(sParams.offset) : (currentPage - 1) * limit;

    // データの取得（検索クエリ q を含めて API を叩く）
    const [pcData, makersData, wpData] = await Promise.all([
        fetchPCProducts(searchQuery, currentOffset, limit, attribute || maker),
        fetchMakers(),
        fetchPostList(10)
    ]);

    const allPosts = wpData.results || [];
    const safeDecode = (str: string) => {
        if (!str) return '';
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={allPosts.map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.mainTitle}>PC製品カタログ</h1>
                    <p className={styles.subDescription}>
                        全 {pcData.count.toLocaleString()} 件のPCデータベースから、あなたに最適な1台を見つけましょう。
                    </p>
                </header>

                {/* 🔍 検索セクション */}
                <section className={styles.searchSection}>
                    <form action="/catalog" method="GET" className={styles.searchForm}>
                        <input 
                            type="text" 
                            name="q" 
                            defaultValue={searchQuery}
                            placeholder="型番、CPU、GPU、製品名で検索..." 
                            className={styles.searchInput}
                        />
                        {/* メーカーや属性が選択されている場合、hiddenで引き継ぐ */}
                        {maker && <input type="hidden" name="maker" value={maker} />}
                        {attribute && <input type="hidden" name="attribute" value={attribute} />}
                        <button type="submit" className={styles.searchButton}>検索</button>
                    </form>
                </section>

                {/* 🏷️ アクティブなフィルタ表示 */}
                {(searchQuery || maker || attribute) && (
                    <div className={styles.activeFilters}>
                        {searchQuery && <span className={styles.filterBadge}>キーワード: {searchQuery}</span>}
                        {maker && <span className={styles.filterBadge}>メーカー: {maker}</span>}
                        {attribute && <span className={styles.filterBadge}>条件: {attribute}</span>}
                        <Link href="/catalog" className={styles.clearFilter}>リセット ×</Link>
                    </div>
                )}

                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        {searchQuery ? `「${searchQuery}」の検索結果` : '製品一覧'}
                    </h2>

                    <div className={styles.productGrid}>
                        {pcData.results.length > 0 ? (
                            pcData.results.map((product: any) => (
                                <ProductCard key={product.unique_id} product={product} />
                            ))
                        ) : (
                            <p className="py-20 text-center text-gray-500 w-full">該当する製品が見つかりませんでした。</p>
                        )}
                    </div>

                    <div className={styles.paginationWrapper}>
                        <Pagination 
                            currentOffset={currentOffset}
                            limit={limit}
                            totalCount={pcData.count}
                            baseUrl="/catalog" 
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}