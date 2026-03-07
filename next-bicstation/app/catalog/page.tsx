/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 💻 BICSTATION PC製品カタログ (Catalog Hub)
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * 物理パス: app/catalog/page.tsx
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ 修正ポイント 1: 物理構造リストに基づいたインポートパスの修正
import Pagination from '@/shared/components/molecules/Pagination';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

// ✅ 修正ポイント 2: API関数のパス修正 (shared/lib/api/django/pc.ts)
import { fetchPCProducts } from '@/shared/lib/api/django/pc';

import styles from './CatalogPage.module.css';

// ✅ 動的レンダリングを強制し、検索結果の即時性を担保
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'PC製品カタログ一覧 | BICSTATION',
    description: '最新のゲーミングPCからクリエイター向けノートPCまで。スペック、価格、AIスコアで比較・検索が可能な日本最大級のPCデータベース。',
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
 * ✅ エントリポイント: Next.js 15推奨のSuspense構造
 */
export default async function CatalogPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-10 h-10 border-t-2 border-blue-500 animate-spin mb-6 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                Initializing_Database_Connection...
            </div>
        }>
            <CatalogPageContent {...props} />
        </Suspense>
    );
}

/**
 * 💡 実際のコンテンツ（Server Component）
 */
async function CatalogPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // 1. パラメータの正規化
    const limit = 40;
    const searchQuery = (Array.isArray(sParams.q) ? sParams.q[0] : sParams.q) || '';
    const maker = (Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker) || '';
    const attribute = (Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute) || '';
    
    // pageとoffsetの管理を正規化
    const currentOffset = sParams.offset 
        ? parseInt(sParams.offset) 
        : (Math.max(1, Number(sParams.page) || 1) - 1) * limit;

    // 2. APIフェッチ（堅牢なガード付き）
    const pcData = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        attribute || maker
    ).catch((e) => {
        console.error("[Catalog API Fatal Error]:", e);
        return { results: [], count: 0 };
    });

    // countの安全な抽出
    const totalCount = pcData?.count || 0;

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

                {/* 🔍 検索バー */}
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

                {/* 🏷️ アクティブなフィルタ */}
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
                            {searchQuery ? `検索結果: ${searchQuery}` : '最新登録製品'}
                        </h2>
                    </div>

                    {/* 📦 製品グリッド */}
                    {pcData.results && pcData.results.length > 0 ? (
                        <div className={styles.productGrid}>
                            {pcData.results.map((product: any) => (
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
                            <p className={styles.noDataSub}>条件を緩和するか、別のキーワードをお試しください。</p>
                        </div>
                    )}

                    {/* 🔢 ページネーション */}
                    {totalCount > limit && (
                        <div className={styles.paginationWrapper}>
                            <Pagination 
                                currentOffset={currentOffset}
                                limit={limit}
                                totalCount={totalCount}
                                baseUrl="/catalog"
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}