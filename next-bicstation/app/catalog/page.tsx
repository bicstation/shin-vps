import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Sidebar from '@shared/layout/Sidebar';
import Pagination from '@shared/common/Pagination';

/**
 * ✅ 修正ポイント: インポートパスの変更
 */
import ProductCard from '@shared/cards/ProductCard';

import { fetchPCProducts, fetchMakers, fetchPostList } from '@shared/lib/api';
import styles from './CatalogPage.module.css';

/**
 * ✅ 修正ポイント: Next.js 15 でのビルドエラー（Missing Suspense boundary）を強制回避
 * このページはクエリパラメータに依存するため、静的生成をスキップして動的レンダリングを強制します。
 */
export const dynamic = "force-dynamic";

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

/**
 * ✅ Next.js 15 ビルドエラー対策:
 * 子コンポーネント（Pagination等）で useSearchParams が使われている可能性があるため、
 * ページ全体を Suspense でラップします。
 */
export default function CatalogPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-slate-500 animate-spin mb-4 rounded-full"></div>
                Loading Catalog Data...
            </div>
        }>
            <CatalogPageContent {...props} />
        </Suspense>
    );
}

/**
 * 実際のページロジックを async 関数として保持
 */
async function CatalogPageContent({ searchParams }: PageProps) {
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
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                {/* Sidebar内で useSearchParams を使っている可能性があるため、
                   コンポーネント単位でも Suspense を適用して安全性を高めます 
                */}
                <Suspense fallback={<div className="h-40 animate-pulse bg-slate-900 rounded-lg" />}>
                    <Sidebar 
                        activeMenu="all" 
                        makers={makersData} 
                        recentPosts={allPosts.map((p: any) => ({
                            id: p.id,
                            title: safeDecode(p.title.rendered),
                            slug: p.slug
                        }))}
                    />
                </Suspense>
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
                                <ProductCard key={product.unique_id || product.id} product={product} />
                            ))
                        ) : (
                            <p className="py-20 text-center text-gray-500 w-full">該当する製品が見つかりませんでした。</p>
                        )}
                    </div>

                    <div className={styles.paginationWrapper}>
                        {/* ✅ 修正ポイント: Pagination を個別に Suspense でラップ
                           ビルド時の useSearchParams() bailout を防ぐための最も強力な対策です。
                        */}
                        <Suspense fallback={<div className="h-10 w-full bg-slate-900 animate-pulse rounded" />}>
                            <Pagination 
                                currentOffset={currentOffset}
                                limit={limit}
                                totalCount={pcData.count}
                                baseUrl="/catalog" 
                            />
                        </Suspense>
                    </div>
                </section>
            </main>
        </div>
    );
}