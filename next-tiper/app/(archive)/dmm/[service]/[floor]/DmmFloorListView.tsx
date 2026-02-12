'use client';

import React from 'react';
import Link from 'next/link';
import styles from './FanzaFloorList.module.css';
import AdultProductCard from '@shared/cards/AdultProductCard';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';
import Pagination from '@shared/common/Pagination';

export default function DmmFloorListView({ 
    service, floor, sort, currentOffset, limit, dataRes, mRes, gRes, wRes 
}: any) {
    const products = (dataRes?.results || []) as any[];
    const totalCount = Number(dataRes?.count) || 0;

    // データ整形ロジック
    const rawMakers = Array.isArray(mRes) ? mRes : mRes?.results || [];
    const topMakers = rawMakers.slice(0, 20).map((m: any) => ({
        id: m.id, name: m.name, slug: m.slug || m.id.toString(), product_count: m.product_count || 0
    }));

    const rawGenres = Array.isArray(gRes) ? gRes : gRes?.results || [];
    const topGenres = rawGenres.slice(0, 20).map((g: any) => ({
        id: g.id, name: g.name, slug: g.slug || g.id.toString(), product_count: g.product_count || 0
    }));

    const wpPosts = (wRes?.results || []).map((p: any) => ({
        id: p.id?.toString(), title: p.title?.rendered || "Untitled", slug: p.slug || ""
    }));

    if (products.length === 0 && currentOffset === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📡</div>
                <h1 className={styles.emptyTitle}>DMM_NODE_NOT_FOUND</h1>
                <p className={styles.emptyText}>DMM / {service} / {floor} のセクターにデータが同期されていません。</p>
                <Link href="/brand/dmm" className={styles.backBtn}>RETURN TO DMM_BASE</Link>
            </div>
        );
    }

    const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
    const displayTotalPages = Math.ceil(totalCount / limit) || 1;

    return (
        <div className={styles.pageWrapper}>
            <div className="bg-[#1a1a2e] border-b border-orange-500/30 px-4 py-2 font-mono text-[10px] text-orange-400 flex flex-wrap gap-x-6">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> 
                    DMM_NETWORK_LINK: ESTABLISHED
                </span>
                <span>[SERVICE: {service.toUpperCase()}]</span>
                <span>[FLOOR: {floor.toUpperCase()}]</span>
                <span>[NODES: {totalCount}]</span>
            </div>

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.pathInfo}>
                        <span className={styles.root}>ARCHIVE</span>
                        <span className={styles.sep}>/</span>
                        <span className={styles.provider}>DMM.com</span>
                        <span className={styles.sep}>/</span>
                        <span className={styles.service}>{service.toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.titleWrapper}>
                        <h1 className={styles.titleMain}>
                            {floor.toUpperCase()} <span className={styles.floorSub}>FLOOR</span>
                        </h1>
                        <div className={styles.itemCount}>
                            <span className={styles.countNum}>{totalCount.toLocaleString()}</span> NODE_CAPTURED
                        </div>
                    </div>

                    <div className={styles.toolbar}>
                        <div className={styles.sortGroup}>
                            {[
                                { id: 'recent', label: 'LATEST_RELEASE', val: '-release_date' },
                                { id: 'popular', label: 'MOST_REVIEWED', val: '-review_count' },
                                { id: 'score', label: 'SPEC_SCORE', val: '-spec_score' },
                            ].map((s) => (
                                <Link 
                                    key={s.id} 
                                    href={`/dmm/${service}/${floor}?offset=0&sort=${s.val}`} 
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
                <aside className={styles.sidebar}>
                    <div className={styles.platformNav}>
                        <h3 className={styles.sidebarTitle}>REGISTRY_SWITCH</h3>
                        <div className={styles.platformButtons}>
                            <Link href="/brand/dmm" className={styles.platformBtnActive}>DMM</Link>
                            <Link href="/brand/fanza" className={styles.platformBtn}>FANZA</Link>
                            <Link href="/brand/duga" className={styles.platformBtn}>DUGA</Link>
                        </div>
                    </div>
                    <AdultSidebar 
                        makers={topMakers} 
                        genres={topGenres}
                        recentPosts={wpPosts} 
                        product={products[0]}
                    />
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.grid}>
                        {products.map((product: any) => (
                            <AdultProductCard 
                                key={`${product.api_source}-${product.id}`} 
                                product={product} 
                            />
                        ))}
                    </div>

                    {totalCount > limit && (
                        <div className={styles.paginationWrapper}>
                            <Pagination 
                                currentOffset={currentOffset} 
                                limit={limit}
                                totalCount={totalCount}
                                basePath={`/dmm/${service}/${floor}`}
                                extraParams={{ sort }}
                            />
                            <div className={styles.streamStatus}>
                                DATA_STREAM: PAGE {displayCurrentPage} / {displayTotalPages}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}