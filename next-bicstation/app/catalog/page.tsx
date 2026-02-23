/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// /home/maya/dev/shin-vps/next-bicstation/app/catalog/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Pagination from '@shared/common/Pagination';
import ProductCard from '@shared/cards/ProductCard';

// APIインポート先を役割ごとに分離
import { fetchPCProducts } from '@shared/lib/api/django/pc';

import styles from './CatalogPage.module.css';

/**
 * ✅ 修正ポイント: 動的レンダリングを強制
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
 * ✅ Next.js 15 対策: ページ全体を Suspense でラップ
 */
export default function CatalogPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-slate-500 animate-spin mb-4 rounded-full"></div>
                Fetching_PC_Database...
            </div>
        }>
            <CatalogPageContent {...props} />
        </Suspense>
    );
}

/**
 * 実際のページロジック
 */
async function CatalogPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // パラメータ取得
    const currentPage = Number(sParams.page) || 1;
    const limit = 40;
    const searchQuery = (Array.isArray(sParams.q) ? sParams.q[0] : sParams.q) || '';
    const maker = (Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker) || '';
    const attribute = (Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute) || '';
    
    // Offset計算
    const currentOffset = sParams.offset ? parseInt(sParams.offset) : (currentPage - 1) * limit;

    // 🛡️ APIガード
    async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
        try {
            return (await promise) || fallback;
        } catch (e) {
            console.error("[Catalog API Error]:", e);
            return fallback;
        }
    }

    // データの取得
    const [pcData] = await Promise.all([
        safeFetch(fetchPCProducts(searchQuery, currentOffset, limit, attribute || maker), { results: [], count: 0 }),
    ]);

    return (
        <div className={styles.fullWidthWrapper}>
            <main className={styles.fullMain}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.mainTitle}>PC製品カタログ</h1>
                    <p className={styles.subDescription}>
                        全 {pcData.count.toLocaleString()} 件のPCデータベースから、あなたに最適な1台を見つけましょう。
                    </p>
                </header>

                {/* 🔍 検索セクション - 全幅に合わせて配置を最適化 */}
                <section className={styles.searchSection}>
                    <form action="/catalog" method="GET" className={styles.searchForm}>
                        <input 
                            type="text" 
                            name="q" 
                            defaultValue={searchQuery}
                            placeholder="型番、CPU、GPU、製品名で検索..." 
                            className={styles.searchInput}
                        />
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
                    <div className={styles.gridHeader}>
                        <h2 className={styles.productGridTitle}>
                            <span className={styles.titleIndicator}></span>
                            {searchQuery ? `「${searchQuery}」の検索結果` : '製品一覧'}
                        </h2>
                    </div>

                    <div className={styles.productGrid}>
                        {pcData.results.length > 0 ? (
                            pcData.results.map((product: any) => (
                                <ProductCard key={product.unique_id || product.id} product={product} />
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-500 w-full bg-slate-900/50 rounded-xl border border-white/5">
                                <p>該当する製品が見つかりませんでした。</p>
                                <p className="text-xs mt-2">条件を変えて再度お試しください。</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.paginationWrapper}>
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