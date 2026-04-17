/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📋 BICSTATION PC製品一覧 (Ultimate Full Version v13.2)
 * 🛰️ Target API: /api/general/pc-products/
 * 🛡️ 役割: 
 * - 統合: ページネーション、メーカー、属性、ソートの全パラメータを同期
 * - 修正: fetchPCProducts v12.2 の引数順序（sort独立化）に対応
 * - 監視: 実際に叩いている API URL をデバッグレイヤーで正確に表示
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

/** 🔍 SEO: 全ての引数から最適なタイトルと説明を自動生成 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const maker = sParams.maker ? sParams.maker.toUpperCase() : '';
    // 全ての可能性のある属性キーをチェック
    const attrRaw = sParams.attribute || sParams.gpu || sParams.cpu || sParams.os || sParams.memory || sParams.feature || '';
    const attrLabel = attrRaw.replace(/-/g, ' ').toUpperCase();
    const query = sParams.q || '';
    
    return {
        title: `${maker || attrLabel || query || '製品一覧'} | PC製品カタログ | BICSTATION`,
        description: `${maker || attrLabel || '最新'}のPC製品をAIスコアや性能順でリアルタイム比較。スペック詳細と最適価格を確認できます。`,
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

/** ✅ ローディング境界: ストリーミングレンダリングを有効化 */
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
    const currentOffset = (currentPage - 1) * limit;

    const currentMaker = sParams.maker || '';
    const currentSort = sParams.sort || '-created_at';
    const searchQuery = sParams.q || '';

    /**
     * 🚩 【引数統合ロジック】
     * 複数の入口属性を currentAttr に集約
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

    /** * 📡 APIフェッチ実行: v12.2 仕様
     * 引数順序: (q, offset, limit, maker, host, sort, attribute)
     */
    const response = await fetchPCProducts(
        searchQuery,      // 1: q
        currentOffset,    // 2: offset
        limit,            // 3: limit
        currentMaker,     // 4: maker
        host,             // 5: host
        currentSort,      // 6: sort (独立引数として送信)
        currentAttr       // 7: attribute
    ).catch((e) => {
        console.error("🚨 [API Error]:", e);
        return { results: [], count: 0 };
    });

    const results = response?.results || [];
    const count = response?.count || 0;
    const totalPages = Math.ceil(count / limit);

    // 3. デバッグ用URL生成 (API側の ordering パラメータ名を反映)
    const debugUrl = `http://api-bicstation-host:8083/api/general/pc-products/?ordering=${currentSort}&attribute=${currentAttr}&maker=${currentMaker}&search=${searchQuery}&offset=${currentOffset}`;

    // 4. 表示タイトルの生成
    const getDynamicTitle = () => {
        if (searchQuery) return `RESULT: "${searchQuery}"`;
        if (currentMaker && currentMaker !== 'all') return `${currentMaker.toUpperCase()} LINEUP`;
        if (currentAttr) return `${currentAttr.split('-').join(' ').toUpperCase()} SPEC`;
        return 'ALL PRODUCTS';
    };

    return (
        <main className={styles.container}>
            {/* 🛠️ デバッグレイヤー: 通信の「入口」と「出口」を監視 */}
            <div className="bg-black/90 text-[10px] p-2 font-mono text-cyan-400 border-b border-cyan-900/50">
                <span className="text-yellow-500 font-bold">[DEBUG_MONITOR_v13.2]</span><br />
                API_ENDPOINT: <span className="text-white underline">{debugUrl}</span><br />
                ACTIVE_FILTERS: {JSON.stringify({ maker: currentMaker, attr: currentAttr, sort: currentSort })}
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
                    {/* ソート選択時も現在のフィルタ(maker, attribute)を維持 */}
                    <ProductSortSelector 
                        currentSort={currentSort} 
                    />
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
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/product"
                                query={{
                                    sort: currentSort,
                                    maker: currentMaker,
                                    attribute: currentAttr,
                                    q: searchQuery || undefined
                                }}
                            />
                        </footer>
                    </>
                ) : (
                    <div className={styles.noData}>
                        <div className={styles.noDataIcon}>∅</div>
                        <h2 className="text-xl font-bold text-white mb-2">NO_MATCHING_DATA</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            条件「{currentAttr || 'なし'}」に一致する製品は、現在DB内に存在しないか、API側で非表示設定されています。
                        </p>
                        <Link href="/product" className={styles.resetButton}>RESET_ALL_FILTERS</Link>
                    </div>
                )}
            </section>
        </main>
    );
}