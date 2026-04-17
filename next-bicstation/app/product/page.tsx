/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Ultimate Full Version v13.0)
 * 🛰️ Target API: /api/general/pc-products/
 * 🛡️ 役割: 
 * - 統合: gpu, cpu, os 等を 'attribute' キーに集約
 * - 監視: 実際に叩いている API URL を画面に表示 (デバッグ用)
 * - 継続: ページネーション・ソート時もフィルタを完全保持
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ 必須コンポーネント
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';
import ProductSortSelector from '@/shared/components/molecules/ProductSortSelector';
import { fetchPCProducts } from '@/shared/lib/api/django/pc/products';

import styles from './ProductsPage.module.css';

/** 🔍 SEO: 全ての引数から最適なタイトルを生成 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = sParams.maker ? sParams.maker.toUpperCase() : '';
    const attrRaw = sParams.attribute || sParams.gpu || sParams.cpu || sParams.os || sParams.memory || sParams.feature || '';
    const attrLabel = attrRaw.replace(/-/g, ' ').toUpperCase();
    const query = sParams.q || '';
    
    return {
        title: `${maker || attrLabel || query || '製品一覧'} | PC製品カタログ | BICSTATION`,
        description: `最新のPC製品をAIスコアや性能順で比較。`,
    };
}

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ 
        page?: string; 
        maker?: string; 
        sort?: string;
        q?: string;
        offset?: string;
        attribute?: string; 
        gpu?: string;
        cpu?: string;
        os?: string;
        memory?: string;
        feature?: string;
    }>;
}

/** ✅ ローディング境界 */
export default async function ProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono">
                <div className={styles.loadingPulse}></div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/60 mt-6 animate-pulse">
                    ESTABLISHING_DATA_LINK_V13...
                </p>
            </div>
        }>
            <ProductsPageContent {...props} />
        </Suspense>
    );
}

/** 💡 サーバーコンポーネントメインロジック */
async function ProductsPageContent({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    // 1. パラメータの抽出と統合
    const limit = 20;
    const currentPage = parseInt(sParams.page || '1');
    const currentOffset = sParams.offset ? parseInt(sParams.offset) : (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';

    /**
     * 🚩 【引数統合ロジック】
     * ブラウザのURLがどんな名前でも、`currentAttr` という一つの変数に「中身」を吸い出す。
     */
    const currentAttr = 
        sParams.attribute || 
        sParams.gpu || 
        sParams.cpu || 
        sParams.os || 
        sParams.memory || 
        sParams.feature || 
        '';

    // 2. ネットワーク環境の特定
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";

    /** 📡 APIフェッチ実行 */
    const response = await fetchPCProducts(
        searchQuery, 
        currentOffset, 
        limit, 
        currentMaker, 
        host,
        currentSort, 
        currentAttr
    ).catch((e) => {
        console.error("🚨 [API Error]:", e);
        return { results: [], count: 0 };
    });

    const results = response?.results || [];
    const count = response?.count || 0;

    // 3. デバッグ用URL生成 (fetchPCProducts内部での組み立てを再現)
    const debugUrl = `http://api-bicstation-host:8083/api/general/pc-products/?attribute=${currentAttr}&maker=${currentMaker}&sort=${currentSort}&q=${searchQuery}&offset=${currentOffset}`;

    // 4. 表示タイトルの生成
    const getDynamicTitle = () => {
        if (searchQuery) return `RESULT: "${searchQuery}"`;
        if (currentMaker && currentMaker !== 'all') return `${currentMaker.toUpperCase()} LINEUP`;
        if (currentAttr) return `${currentAttr.split('-').join(' ').toUpperCase()} SPEC`;
        return 'ALL PRODUCTS';
    };

    return (
        <main className={styles.container}>
            {/* 🛠️ デバッグレイヤー: ここを見れば一発で原因が分かります */}
            <div className="bg-black/90 text-[10px] p-2 font-mono text-cyan-400 border-b border-cyan-900/50">
                <span className="text-yellow-500 font-bold">[DEBUG_MONITOR_v13]</span><br />
                REQUEST_TO: <span className="text-white underline">{debugUrl}</span><br />
                RAW_PARAMS: {JSON.stringify({gpu: sParams.gpu, cpu: sParams.cpu, attr: sParams.attribute})}
            </div>

            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">HOME</Link> / <span>PRODUCT</span>
                    </div>
                    <h1 className={styles.title}>{getDynamicTitle()}</h1>
                    <div className={styles.statsBadge}>
                        <span className={styles.statusLight}></span>
                        <span className={styles.hitCount}>{count.toLocaleString()}</span> 
                        <span className={styles.unit}>ITEMS</span>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <ProductSortSelector currentSort={currentSort} />
                </div>
            </header>

            <section className={styles.gridArea}>
                {results.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {results.map((product: any, index: number) => (
                                <ProductCard 
                                    key={product.unique_id || product.id || `pc-${index}`} 
                                    product={product} 
                                    priority={index < 4}
                                />
                            ))}
                        </div>

                        <footer className={styles.footer}>
                            <Pagination 
                                currentOffset={currentOffset}
                                limit={limit}
                                totalCount={count}
                                // 🔗 URLを 'attribute' 形式に強制正規化して引き継ぐ
                                baseUrl={`/product?sort=${currentSort}&maker=${currentMaker}&attribute=${currentAttr}&q=${encodeURIComponent(searchQuery)}`}
                            />
                        </footer>
                    </>
                ) : (
                    <div className={styles.noData}>
                        <div className={styles.noDataIcon}>∅</div>
                        <h2 className="text-xl font-bold text-white mb-2">NO_MATCHING_DATA</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            条件「{currentAttr || 'なし'}」に一致する製品は、現在DB内に存在しないか、API側で無視されています。
                        </p>
                        <Link href="/product" className={styles.resetButton}>RESET_ALL_FILTERS</Link>
                    </div>
                )}
            </section>
        </main>
    );
}