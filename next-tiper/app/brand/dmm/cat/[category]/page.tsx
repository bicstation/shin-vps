/* /app/brand/[source]/cat/[category]/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// 🚀 修正: 正しいインポートパス (@shared エイリアスを使用)
import { 
    fetchAdultTaxonomyIndex, 
    fetchMakers, 
    fetchGenres, 
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

// スタイルは共通の Archive.module.css を利用
import styles from '@/app/brand/Archive.module.css';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['actress', 'genre', 'series', 'maker', 'director', 'author', 'label'];

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string, source: string }> }): Promise<Metadata> {
    const { category, source } = await params;
    const label = category.toUpperCase();
    const brand = source.toUpperCase();
    return {
        title: `${brand} : ${label} LIST | ARCHIVE_SCAN`,
        description: `${brand}の${label}別データインデックス一覧。`,
    };
}

/**
 * 🔳 CATEGORY_LIST_PAGE (共通)
 */
export default async function CategoryListPage(props: { 
    params: Promise<{ category: string; source: string }> 
}) {
    const { category, source: brand } = await props.params;

    // 1. カテゴリのバリデーション
    if (!VALID_CATEGORIES.includes(category)) {
        notFound();
    }

    // 2. データ並列取得
    // taxonomy type の決定 (actress -> actresses, others -> +s)
    const taxType = category === 'actress' ? 'actresses' : `${category}s`;

    const [
        taxRes,
        dynamicMenu,
        wpData,
        sideMakers,
        sideGenres
    ] = await Promise.all([
        fetchAdultTaxonomyIndex(taxType, {
            api_source: brand,
            limit: 200, // 一覧なので多めに取得
            ordering: '-product_count'
        }).catch(() => ({ results: [] })),
        
        getFanzaDynamicMenu().catch(() => ({})), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] })),
        
        // サイドバー用の補助マスタ
        fetchMakers({ limit: 40, api_source: brand }).catch(() => []),
        fetchGenres({ limit: 40, api_source: brand }).catch(() => [])
    ]);

    const items = taxRes.results || [];

    // 3. サイドバー用データの整理
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/${brand}/svc/${content.code}/${f.code}`,
        }));
        return {
            id: content.code,
            name: serviceName,
            service_code: content.code,
            floors: floorItems,
        };
    }).filter(item => item.floors.length > 0);

    // ブランドカラーの設定
    const accentColor = brand === 'fanza' ? '#ff3366' : brand === 'dmm' ? '#ff9900' : '#e94560';

    return (
        <div 
            className={styles.pageWrapper} 
            style={{ '--accent': accentColor } as any}
        >
            <div className={styles.ambientGlow} />

            <div className={styles.container}>
                {/* --- 🛰️ SIDEBAR AREA --- */}
                <aside className={styles.sidebarWrapper}>
                    <div className={styles.stickySidebar}>
                        <AdultSidebar 
                            officialHierarchy={brand === 'fanza' ? fanzaHierarchy : []}
                            makers={Array.isArray(sideMakers) ? sideMakers : sideMakers.results} 
                            genres={Array.isArray(sideGenres) ? sideGenres : sideGenres.results}
                            recentPosts={Array.isArray(wpData) ? wpData : wpData.results}
                        />
                    </div>
                </aside>

                {/* --- 🚀 MAIN CONTENT AREA --- */}
                <main className={styles.mainContent}>
                    <nav className={styles.breadcrumb}>
                        <Link href="/" className={styles.bcLink}>ROOT</Link>
                        <span className={styles.bcDivider}>/</span>
                        <Link href={`/brand/${brand}`} className={styles.bcLink}>{brand.toUpperCase()}</Link>
                        <span className={styles.bcDivider}>/</span>
                        <span className={styles.bcActive}>{category.toUpperCase()}</span>
                    </nav>

                    <header className={styles.headerSection}>
                        <div className={styles.titleGroup}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                                <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase">
                                    Archive Index: {brand}
                                </span>
                            </div>
                            <h1 className={styles.titleMain}>{category.toUpperCase()} LIST</h1>
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>RECORDS_DETECTED:</span>
                                <span className={styles.statusValue}>{items.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* 🔳 インデックスグリッド */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                        {items.length > 0 ? (
                            items.map((item: any) => (
                                <Link 
                                    key={item.id} 
                                    href={`/brand/${brand}/cat/${category}/${item.slug || item.id}`}
                                    className="group relative bg-black/40 border border-white/10 p-4 hover:border-[var(--accent)] transition-all duration-300"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-500 text-[9px] font-mono">
                                                ID: {item.id}
                                            </span>
                                        </div>
                                        <span className="text-white font-bold text-sm leading-tight group-hover:text-[var(--accent)] transition-colors">
                                            {item.name}
                                        </span>
                                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                                            <span className="text-[var(--accent)] text-[10px] font-mono font-bold">
                                                {item.product_count?.toLocaleString()} <span className="opacity-60 font-normal">NODES</span>
                                            </span>
                                            <span className="text-white/10 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                    {/* ホバー時の発光エフェクト */}
                                    <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-lg">
                                <p className="text-gray-500 font-mono tracking-widest uppercase text-xs">
                                    [!] No_Data_Nodes_Synchronized
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}