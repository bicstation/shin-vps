/* /app/brand/fanza/svc/[service]/[floor]/FanzaFloorListView.tsx */
'use client';

import React from 'react';
import Link from 'next/link';
import styles from './FanzaFloorList.module.css';
import AdultProductCard from '@shared/cards/AdultProductCard';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';
import Pagination from '@shared/common/Pagination';

export default function FanzaFloorListView({ 
    service, floor, sort, currentOffset, limit, dataRes, officialHierarchy, mRes, gRes, wRes 
}: any) {
    const products = dataRes?.results || [];
    const totalCount = dataRes?.count || 0;

    // --- 🛡️ サイドバー用の階層データ整形 (FANZAトップと同じロジック) ---
    const formattedHierarchy = Object.entries(officialHierarchy || {}).map(([sName, content]: [string, any]) => ({
        service_name: sName,
        service_code: content.code,
        floors: (content.floors || []).map((f: any) => ({
            floor_name: f.name,
            floor_code: f.code,
        }))
    }));

    const safeExtract = (data: any) => Array.isArray(data) ? data : (data?.results || []);

    return (
        <div className={styles.pageWrapper}>
            {/* 🚨 SYSTEM STATUS BAR */}
            <div className="bg-[#120508] border-b border-[#e94560]/30 px-4 py-2 font-mono text-[10px] text-[#e94560] flex flex-wrap gap-x-6">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e94560] animate-pulse"></span> 
                    FANZA_CORE_LINK: ACTIVE
                </span>
                <span>[SV: {service.toUpperCase()}]</span>
                <span>[FL: {floor.toUpperCase()}]</span>
                <span>[NODES_COUNT: {totalCount.toLocaleString()}]</span>
            </div>

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.pathInfo}>
                        <span className={styles.root}>ARCHIVE</span>
                        <span className={styles.sep}>/</span>
                        <span className={styles.provider}>FANZA</span>
                        <span className={styles.sep}>/</span>
                        <span className={styles.service}>{service.toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.titleWrapper}>
                        <h1 className={styles.titleMain}>
                            {floor.toUpperCase()} <span className={styles.floorSub}>SECTOR</span>
                        </h1>
                        <div className={styles.itemCount}>
                            <span className={styles.countNum}>{totalCount.toLocaleString()}</span> NODES_SYNCHRONIZED
                        </div>
                    </div>

                    {/* ⚙️ SORTING TOOLBAR */}
                    <div className={styles.toolbar}>
                        <div className={styles.sortGroup}>
                            {[
                                { id: 'recent', label: 'NEW_RELEASE', val: '-release_date' },
                                { id: 'rank', label: 'MOST_REVIEWED', val: '-review_count' },
                                { id: 'score', label: 'AI_SCORE', val: '-spec_score' },
                            ].map((s) => (
                                <Link 
                                    key={s.id} 
                                    href={`/brand/fanza/svc/${service}/${floor}?sort=${s.val}`} 
                                    className={sort === s.val ? styles.sortActive : styles.sortBtn}
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.layoutContainer}>
                {/* 🛡️ SIDEBAR: 階層データを注入 */}
                <aside className={styles.sidebarWrapper}>
                    <AdultSidebar 
                        officialHierarchy={formattedHierarchy} 
                        makers={safeExtract(mRes)} 
                        genres={safeExtract(gRes)}
                        recentPosts={safeExtract(wRes).map((p: any) => ({
                            id: p.id,
                            title: p.title?.rendered,
                            slug: p.slug
                        }))}
                    />
                </aside>

                {/* 🔳 PRODUCT GRID */}
                <main className={styles.mainContent}>
                    {products.length > 0 ? (
                        <>
                            <div className={styles.grid}>
                                {products.map((product: any) => (
                                    <AdultProductCard 
                                        key={`fanza-${product.id}`} 
                                        product={{...product, api_source: 'fanza'}} 
                                    />
                                ))}
                            </div>
                            <div className={styles.paginationWrapper}>
                                <Pagination 
                                    currentOffset={currentOffset} 
                                    limit={limit}
                                    totalCount={totalCount}
                                    basePath={`/brand/fanza/svc/${service}/${floor}`}
                                    extraParams={{ sort }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyContainer}>
                            <p>NO DATA SYNCHRONIZED FOR THIS SECTOR.</p>
                        </div>
                    )}
                </main>
            </div>

            <footer className="mt-12 border-t border-[#e94560]/10 py-6 text-center">
                <div className="text-[10px] text-zinc-700 font-mono tracking-[0.2em] uppercase">
                    Data Stream Terminal // Source: FANZA_INTELLIGENCE_UNIT
                </div>
            </footer>
        </div>
    );
}