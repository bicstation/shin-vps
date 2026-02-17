'use client';

import React from 'react';
import Link from 'next/link';
import styles from './DmmFloorList.module.css'; 
import AdultProductCard from '@shared/cards/AdultProductCard';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';
import Pagination from '@shared/common/Pagination';

/**
 * 🛰️ DMM_NODE_VIEWER (RE-ESTABLISHED)
 * DMMの特定のサービス・フロアに特化した一覧表示コンポーネント
 */
export default function DmmFloorListView({ 
    service, 
    floor, 
    sort, 
    currentOffset, 
    limit, 
    dataRes, 
    officialHierarchy, 
    mRes, 
    gRes, 
    wRes 
}: any) {
    const products = (dataRes?.results || []) as any[];
    const totalCount = Number(dataRes?.count) || 0;

    // --- 🚀 DMM専用の階層メニューを強制抽出 ---
    const dmmHierarchy = React.useMemo(() => {
        if (!officialHierarchy) return null;
        // 1枚目の画像で成功していた構造 (dmmキー) を最優先で抽出
        return officialHierarchy.dmm || officialHierarchy; 
    }, [officialHierarchy]);

    // --- サイドバー用データ整形 ---
    const rawMakers = Array.isArray(mRes) ? mRes : mRes?.results || [];
    const topMakers = rawMakers.slice(0, 20).map((m: any) => ({
        id: m.id, 
        name: m.name, 
        slug: m.slug || m.id.toString(), 
        product_count: m.product_count || 0
    }));

    const rawGenres = Array.isArray(gRes) ? gRes : gRes?.results || [];
    const topGenres = rawGenres.slice(0, 20).map((g: any) => ({
        id: g.id, 
        name: g.name, 
        slug: g.slug || g.id.toString(), 
        product_count: g.product_count || 0
    }));

    const wpPosts = (wRes?.results || []).map((p: any) => ({
        id: p.id?.toString(), 
        title: p.title?.rendered || "Untitled", 
        slug: p.slug || ""
    }));

    // --- データ不在時のフォールバック UI ---
    if (products.length === 0 && currentOffset === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📡</div>
                <h1 className={styles.emptyTitle}>DMM_NODE_NOT_FOUND</h1>
                <p className={styles.emptyText}>DMM / {service.toUpperCase()} / {floor.toUpperCase()} のセクターに有効なデータが検出されませんでした。</p>
                <Link href="/brand/dmm" className={styles.backBtn}>RETURN TO DMM_BASE</Link>
            </div>
        );
    }

    const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
    const displayTotalPages = Math.ceil(totalCount / limit) || 1;

    return (
        <div className={styles.pageWrapper}>
            {/* 🛰️ SYSTEM TOP OVERLAY (DMM BLUE SPEC) */}
            <div className="bg-[#0a0a0c] border-b border-blue-500/30 px-4 py-2 font-mono text-[10px] text-blue-400 flex flex-wrap gap-x-6">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> 
                    NETWORK_STATUS: DMM_LINK_ESTABLISHED
                </span>
                <span>[SERVICE: {service.toUpperCase()}]</span>
                <span>[FLOOR: {floor.toUpperCase()}]</span>
                <span>[DATABASE_NODES: {totalCount.toLocaleString()}]</span>
                <span className="ml-auto opacity-50">LOCATION: /brand/dmm/svc/{service}/{floor}</span>
            </div>

            {/* 🟦 HEADER SECTION */}
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
                        <h1 className={`${styles.titleMain} !text-blue-500`}>
                            {floor.toUpperCase()} <span className={styles.floorSub}>FLOOR</span>
                        </h1>
                        <div className={styles.itemCount}>
                            <span className={styles.countNum}>{totalCount.toLocaleString()}</span> NODE_CAPTURED
                        </div>
                    </div>

                    {/* ⚙️ TOOLBAR: SORTING (青ボタンの巨大化を!text-[10px]で抑制) */}
                    <div className={styles.toolbar}>
                        <div className={styles.sortGroup}>
                            {[
                                { id: 'recent', label: 'LATEST_RELEASE', val: '-release_date' },
                                { id: 'popular', label: 'MOST_REVIEWED', val: '-review_count' },
                                { id: 'score', label: 'SPEC_SCORE', val: '-spec_score' },
                                { id: 'price', label: 'PRICE_DESC', val: '-price' },
                            ].map((s) => (
                                <Link 
                                    key={s.id} 
                                    href={`/brand/dmm/svc/${service}/${floor}?offset=0&sort=${s.val}`} 
                                    className={`${sort === s.val ? "!bg-blue-600 !text-white" : styles.sortBtn} !text-[10px] !px-3 !py-1`}
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* 🧬 MAIN LAYOUT */}
            <div className={styles.layoutContainer}>
                
                {/* 🛡️ SIDEBAR NAVIGATION */}
                <aside className={styles.sidebarWrapper}>
                    {/* プラットフォーム切り替え */}
                    <div className="mb-4 flex gap-1 p-2 bg-white/5 rounded border border-white/10">
                        <Link href="/brand/dmm" className="flex-1 text-center py-2 text-[10px] font-black bg-blue-600 text-white rounded shadow-[0_0_10px_rgba(37,99,235,0.5)]">DMM</Link>
                        <Link href="/brand/fanza" className="flex-1 text-center py-2 text-[10px] font-black bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">FANZA</Link>
                    </div>

                    {/* 💡 AdultSidebarをDMMモードに強制固定 */}
                    <AdultSidebar 
                        brand="dmm" 
                        officialHierarchy={dmmHierarchy} 
                        makers={topMakers} 
                        genres={[]} // 🚨 DMMページではFANZAジャンルを表示させないよう空にする
                        recentPosts={wpPosts} 
                        product={products[0]}
                        showPlatformMatrix={true}
                    />
                </aside>

                {/* 🔳 PRODUCT GRID */}
                <main className={styles.mainContent}>
                    <div className={styles.grid}>
                        {products.map((product: any) => (
                            <AdultProductCard 
                                key={`${product.api_source}-${product.id}`} 
                                product={product} 
                            />
                        ))}
                    </div>

                    {/* 🔢 PAGINATION */}
                    {totalCount > limit && (
                        <div className={styles.paginationWrapper}>
                            <Pagination 
                                currentOffset={currentOffset} 
                                limit={limit}
                                totalCount={totalCount}
                                basePath={`/brand/dmm/svc/${service}/${floor}`}
                                extraParams={{ sort }}
                            />
                            <div className={styles.streamStatus}>
                                DATA_STREAM: PAGE {displayCurrentPage} / {displayTotalPages}
                                <span className="ml-4 opacity-40">[{currentOffset} - {Math.min(currentOffset + limit, totalCount)} OF {totalCount}]</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* 🛠️ FOOTER STATUS BAR */}
            <footer className="mt-8 border-t border-white/5 py-4 text-center">
                <div className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">
                    End of Node List // Data Source: DMM_WEB_API_v3_UNIFIED
                </div>
            </footer>
        </div>
    );
}