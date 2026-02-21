/* /app/brand/fanza/cat/[category]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
    fetchMakers, 
    fetchGenres, 
    fetchActresses, 
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    getFanzaDynamicMenu 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';
import styles from '@/app/brand/Archive.module.css'; // 既存のスタイルを再利用

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: Record<string, { label: string; fetcher: any }> = {
    actress: { label: 'ACTRESS', fetcher: fetchActresses },
    genre: { label: 'GENRE', fetcher: fetchGenres },
    series: { label: 'SERIES', fetcher: fetchSeries },
    maker: { label: 'MAKER', fetcher: fetchMakers },
    director: { label: 'DIRECTOR', fetcher: fetchDirectors },
    author: { label: 'AUTHOR', fetcher: fetchAuthors },
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const label = VALID_CATEGORIES[category]?.label || 'CATEGORY';
    return {
        title: `FANZA ${label} LIST | ARCHIVE SCAN`,
        description: `FANZAの${label}別アーカイブ一覧ページ。`,
    };
}

export default async function FanzaCategoryListPage(props: { 
    params: Promise<{ category: string }> 
}) {
    const { category } = await props.params;

    // 1. カテゴリの検証
    const config = VALID_CATEGORIES[category];
    if (!config) notFound();

    // 2. データ並列取得
    const [
        itemsRes,
        dynamicMenu,
        wpData,
        // サイドバー用のミニマスタ
        sideMakers,
        sideGenres
    ] = await Promise.all([
        config.fetcher({ limit: 500, api_source: 'fanza', ordering: '-product_count' }).catch(() => []),
        getFanzaDynamicMenu().catch(() => ({})), 
        getSiteMainPosts(0, 8).catch(() => ({ results: [] })),
        fetchMakers({ limit: 40, api_source: 'fanza' }).catch(() => []),
        fetchGenres({ limit: 40, api_source: 'fanza' }).catch(() => [])
    ]);

    const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.results || []);

    // 3. サイドバー用階層データの整理
    const fanzaHierarchy = Object.entries(dynamicMenu).map(([serviceName, content]: [string, any]) => {
        const floorItems = (content.floors || []).map((f: any) => ({
            id: f.code,
            name: f.name,
            floor_name: f.name,
            floor_code: f.code,
            href: `/brand/fanza/svc/${content.code}/${f.code}`,
        }));
        return {
            id: content.code,
            name: serviceName,
            service_code: content.code,
            floors: floorItems,
        };
    }).filter(item => item.floors.length > 0);

    const accentColor = '#ff3366'; // FANZA PINK

    return (
        <div 
            className={styles.pageWrapper} 
            style={{ '--accent': accentColor } as any}
        >
            <div className={styles.ambientGlow} />

            <div className={styles.container}>
                {/* --- 🛰️ SIDEBAR AREA (FANZA共通) --- */}
                <aside className={styles.sidebarWrapper}>
                    <div className={styles.stickySidebar}>
                        <AdultSidebar 
                            officialHierarchy={fanzaHierarchy}
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
                        <Link href="/brand/fanza" className={styles.bcLink}>FANZA</Link>
                        <span className={styles.bcDivider}>/</span>
                        <span className={styles.bcActive}>{config.label}</span>
                    </nav>

                    <header className={styles.headerSection}>
                        <div className={styles.titleGroup}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                                <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase">
                                    Index Scan: {category}
                                </span>
                            </div>
                            <h1 className={styles.titleMain}>{config.label} LIST</h1>
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>NODES_COUNT:</span>
                                <span className={styles.statusValue}>{items.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* 🔳 カテゴリグリッド */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                        {items.length > 0 ? (
                            items.map((item: any) => (
                                <Link 
                                    key={item.id} 
                                    href={`/brand/fanza/cat/${category}/${item.slug || item.id}`}
                                    className="group relative bg-black/40 border border-white/10 p-4 hover:border-[var(--accent)] transition-all duration-300"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-400 text-[10px] font-mono group-hover:text-[var(--accent)] transition-colors">
                                            #{item.id}
                                        </span>
                                        <span className="text-white font-bold text-sm leading-tight">
                                            {item.name}
                                        </span>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[var(--accent)] text-[10px] font-mono">
                                                {item.product_count || 0} ITEMS
                                            </span>
                                            <span className="text-white/20 group-hover:text-[var(--accent)] transition-colors">→</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border border-dashed border-white/10">
                                <p className="text-gray-500 font-mono italic">NO_DATA_STREAM_AVAILABLE</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}