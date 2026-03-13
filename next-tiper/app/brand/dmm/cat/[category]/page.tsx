/* /app/brand/[source]/cat/[category]/page.tsx */
'use client'; 

import React, { useEffect, use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * ✅ 修正: エイリアスを @/shared に統一し、物理構造に準拠
 */
import { 
    fetchAdultTaxonomyIndex, 
    fetchMakers, 
    fetchGenres, 
    fetchActresses,
    fetchSeries,
    fetchDirectors,
    fetchAuthors,
    fetchLabels,
    getFanzaDynamicMenu 
} from '@/shared/lib/api/django/adult';

// ✅ Django Bridge 経由
import { getWpPostsFromBridge } from '@/shared/lib/api/django-bridge';

/**
 * ✅ 修正: 物理構造 shared/layout/Sidebar/AdultSidebar.tsx に合わせる
 */
import AdultSidebar from '@/shared/layout/Sidebar/AdultSidebar';
import styles from '@/app/brand/Archive.module.css';

export default function CategoryListPage({ params: paramsPromise }: any) {
    const params = use(paramsPromise) as any;
    const { category, source: brand } = params;
    
    const [data, setData] = useState<any>(null);
    const VALID_CATEGORIES = ['actress', 'genre', 'series', 'maker', 'director', 'author', 'label'];

    /**
     * 🚨 LAYOUT_HACK_PROTOCOL
     * 既存のグローバルサイドバーを一時的に非表示にし、専用レイアウトを強制適用
     */
    useEffect(() => {
        const restoreTargets: any[] = [];
        const mainTags = document.querySelectorAll('main');
        
        mainTags.forEach((main) => {
            if (!main.className.includes('Archive_mainContent')) {
                const parent = main.parentElement;
                const aside = main.previousElementSibling;
                if (parent && aside && aside.tagName === 'ASIDE') {
                    const asideHtml = aside as HTMLElement;
                    restoreTargets.push({
                        parent,
                        aside: asideHtml,
                        originalDisplay: parent.style.display,
                        originalGrid: parent.style.gridTemplateColumns,
                    });
                    parent.style.display = 'block';
                    parent.style.gridTemplateColumns = 'none';
                    asideHtml.style.display = 'none';
                }
            }
        });

        return () => {
            restoreTargets.forEach((t) => {
                t.parent.style.display = t.originalDisplay;
                t.parent.style.gridTemplateColumns = t.originalGrid;
                t.aside.style.display = '';
            });
        };
    }, []);

    /**
     * 📡 Parallel Data Fetching (Bridge 統合版)
     */
    useEffect(() => {
        async function load() {
            if (!VALID_CATEGORIES.includes(category)) return;
            
            const taxType = category === 'actress' ? 'actresses' : `${category}s`;
            
            try {
                const [taxRes, dynamicMenu, bridgeCms, m, g, act, ser, dir, aut, lab] = await Promise.all([
                    fetchAdultTaxonomyIndex(taxType, { api_source: brand, limit: 120, ordering: '-product_count' }),
                    getFanzaDynamicMenu().catch(() => ({})),
                    getWpPostsFromBridge({ limit: 8, brand: brand }).catch(() => ({ results: [] })),
                    fetchMakers({ limit: 12, api_source: brand }).catch(() => []),
                    fetchGenres({ limit: 20, api_source: brand }).catch(() => []),
                    fetchActresses({ limit: 12, api_source: brand }).catch(() => []),
                    fetchSeries({ limit: 10, api_source: brand }).catch(() => []),
                    fetchDirectors({ limit: 8, api_source: brand }).catch(() => []),
                    fetchAuthors({ limit: 8, api_source: brand }).catch(() => []),
                    fetchLabels({ limit: 8, api_source: brand }).catch(() => [])
                ]);

                setData({ 
                    items: taxRes?.results || [], 
                    dynamicMenu, 
                    bridgeCms, 
                    m, g, act, ser, dir, aut, lab 
                });
            } catch (err) {
                console.error("INDEX_FETCH_ERROR:", err);
            }
        }
        load();
    }, [category, brand]);

    if (!data) return <div className="min-h-screen bg-[#050505] animate-pulse" />;
    if (!VALID_CATEGORIES.includes(category)) notFound();

    const accentColor = brand === 'fanza' ? '#ff3366' : brand === 'dmm' ? '#ff9900' : '#e94560';

    return (
        <div className={styles.pageWrapper} style={{ '--accent': accentColor } as any}>
            <div className={styles.ambientGlow} />
            <div className={styles.container}>
                
                {/* 🛰️ SIDEBAR */}
                <aside className={styles.sidebarWrapper}>
                    <div className={styles.stickySidebar}>
                        <AdultSidebar 
                            officialHierarchy={data.dynamicMenu}
                            makers={data.m?.results || data.m || []}
                            genres={data.g?.results || data.g || []}
                            actresses={data.act?.results || data.act || []}
                            series={data.ser?.results || data.ser || []}
                            directors={data.dir?.results || data.dir || []}
                            authors={data.aut?.results || data.aut || []}
                            labels={data.lab?.results || data.lab || []}
                            recentPosts={(data.bridgeCms?.results || []).map((p: any) => ({
                                id: p.id,
                                title: p.title,
                                slug: p.slug,
                                date: p.date
                            }))}
                        />
                    </div>
                </aside>

                {/* 🚀 MAIN CONTENT */}
                <main className={`${styles.mainContent} Archive_mainContent`}>
                    <nav className={styles.breadcrumb}>
                        <Link href="/" className={styles.bcLink}>ROOT</Link>
                        <span className={styles.bcDivider}>/</span>
                        <Link href={`/brand/${brand}`} className={styles.bcLink}>{brand.toUpperCase()}</Link>
                        <span className={styles.bcDivider}>/</span>
                        <span className={styles.bcActive}>{category.toUpperCase()} INDEX</span>
                    </nav>

                    <header className={styles.headerSection}>
                        <div className={styles.titleGroup}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                                <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase">
                                    Archive Source: {brand}
                                </span>
                            </div>
                            <h1 className={styles.titleMain}>{category.toUpperCase()} INDEX</h1>
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>RECORDS_IN_INDEX:</span>
                                <span className={styles.statusValue}>{data.items.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* 🔳 INDEX GRID */}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-10">
                        {data.items.map((item: any) => (
                            <Link 
                                key={item.id} 
                                href={`/brand/${brand}/cat/${category}/${item.slug || item.id}`}
                                className="group bg-white/5 border border-white/10 p-4 hover:border-[var(--accent)] transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1 h-1 bg-[var(--accent)] rounded-full"></div>
                                </div>
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <span className="text-[8px] font-mono text-gray-600 block mb-1">DATA_ID: {item.id}</span>
                                        <h3 className="text-white text-sm font-bold group-hover:text-[var(--accent)] transition-colors leading-tight">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-lg font-black font-mono text-white/80">{item.product_count || 0}</span>
                                        <span className="text-[8px] text-gray-500 font-mono tracking-tighter">UNITS</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}