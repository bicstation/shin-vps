/* /app/brand/[source]/cat/[category]/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'; // 🚨 物理ハック(useEffect)を使うため client component に変更

import React, { useEffect } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// 🚀 正しいインポートパス
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
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';

// スタイルは共通の Archive.module.css を利用
import styles from '@/app/brand/Archive.module.css';

// 💡 サーバーサイドでのデータ取得用に関数を分離（Client Component内で直接awaitはできないため、本来はServer Componentで取得して渡すのが理想ですが、今回はこれまでの流れに沿って構成します）
// ※もしエラーが出る場合は、このファイルを Server Component のままにし、ハック部分だけを別コンポーネントに切り出す必要があります。

export default function CategoryListPage({ params: paramsPromise }: any) {
    // 状態管理
    const [data, setData] = React.useState<any>(null);
    const params = React.use(paramsPromise) as any;
    const { category, source: brand } = params;

    const VALID_CATEGORIES = ['actress', 'genre', 'series', 'maker', 'director', 'author', 'label'];

    // ---------------------------------------------------------------------------
    // 🚨 LAYOUT_HACK_PROTOCOL: 二重サイドバーを抹殺し、離れる時に復元する
    // ---------------------------------------------------------------------------
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

    // 📡 データフェッチ (本来は Server Component 推奨ですが、現状の構造を維持)
    useEffect(() => {
        async function load() {
            if (!VALID_CATEGORIES.includes(category)) return;
            const taxType = category === 'actress' ? 'actresses' : `${category}s`;
            
            const [taxRes, dynamicMenu, wpData, m, g, act, ser, dir, aut, lab] = await Promise.all([
                fetchAdultTaxonomyIndex(taxType, { api_source: brand, limit: 200, ordering: '-product_count' }),
                getFanzaDynamicMenu(),
                getSiteMainPosts(0, 8),
                fetchMakers({ limit: 20 }),
                fetchGenres({ limit: 30 }),
                fetchActresses({ limit: 20 }),
                fetchSeries({ limit: 15 }),
                fetchDirectors({ limit: 10 }),
                fetchAuthors({ limit: 10 }),
                fetchLabels({ limit: 10 })
            ]);

            setData({ items: taxRes.results, dynamicMenu, wpData, m, g, act, ser, dir, aut, lab });
        }
        load();
    }, [category, brand]);

    if (!data) return <div className="min-h-screen bg-black" />;
    if (!VALID_CATEGORIES.includes(category)) notFound();

    const accentColor = brand === 'fanza' ? '#ff3366' : brand === 'dmm' ? '#ff9900' : '#e94560';

    return (
        <div className={styles.pageWrapper} style={{ '--accent': accentColor } as any}>
            <div className={styles.ambientGlow} />
            <div className={styles.container}>
                
                {/* --- 🛰️ SIDEBAR AREA (自前) --- */}
                <aside className={styles.sidebarWrapper}>
                    <div className={styles.stickySidebar}>
                        <AdultSidebar 
                            officialHierarchy={data.dynamicMenu}
                            makers={data.m?.results || []}
                            genres={data.g?.results || []}
                            actresses={data.act?.results || []}
                            series={data.ser?.results || []}
                            directors={data.dir?.results || []}
                            authors={data.aut?.results || []}
                            labels={data.lab?.results || []}
                            recentPosts={data.wpData?.results || []}
                        />
                    </div>
                </aside>

                {/* --- 🚀 MAIN CONTENT AREA --- */}
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
                                    Archive Index: {brand}
                                </span>
                            </div>
                            <h1 className={styles.titleMain}>{category.toUpperCase()} LIST</h1>
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>RECORDS_DETECTED:</span>
                                <span className={styles.statusValue}>{data.items.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* 🔳 インデックスグリッド */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                        {data.items.map((item: any) => (
                            <Link 
                                key={item.id} 
                                href={`/brand/${brand}/cat/${category}/${item.slug || item.id}`}
                                className="group relative bg-black/40 border border-white/10 p-4 hover:border-[var(--accent)] transition-all duration-300"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-[9px] font-mono">ID: {item.id}</span>
                                    <span className="text-white font-bold text-sm group-hover:text-[var(--accent)] transition-colors">
                                        {item.name}
                                    </span>
                                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                                        <span className="text-[var(--accent)] text-[10px] font-mono font-bold">
                                            {item.product_count?.toLocaleString()} <span className="opacity-60">NODES</span>
                                        </span>
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