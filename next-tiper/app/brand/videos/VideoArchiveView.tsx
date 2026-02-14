'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import styles from './VideoArchive.module.css';
import ProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import AdultSidebar from '@shared/layout/Sidebar/AdultSidebar';
import { AdultProduct } from '@shared/lib/api/types';

/**
 * 🛰️ SYSTEM_VIDEO_ARCHIVE_VIEW
 * 構造解析：生配列データ(Raw Array)への完全適合 & アダルトフィルタリング
 */

const SORT_OPTIONS = [
    { label: 'LATEST_NODE', value: '-release_date' },
    { label: 'SPEC_SCORE', value: '-spec_score' },
    { label: 'MOST_REVIEWED', value: '-review_count' },
    { label: 'PRICE_DESC', value: '-price' },
];

const SOURCE_OPTIONS = [
    { label: 'ALL_SYSTEMS', value: '' },
    { label: 'FANZA', value: 'FANZA' },
    { label: 'DMM', value: 'DMM' },
    { label: 'DUGA', value: 'DUGA' },
];

export default function VideoArchiveView({ 
    productData, makersRes, postsRes, searchParams, 
    currentOffset, currentOrdering, currentSource, currentMakerSlug, limit 
}: any) {
    const [showDebug, setShowDebug] = useState(true);

    // --- 🧬 データの抽出と正規化 (生配列・オブジェクト両対応) ---

    // 1. プロダクトデータの正規化
    // resultsがあればそれを使用、なければ productData 自体を配列として扱う
    const products = (Array.isArray(productData) ? productData : (productData?.results || [])) as AdultProduct[];
    const totalCount = Number(productData?.count) || products.length || 0;

    // 2. サイドバー用メーカーデータの抽出 & 浄化フィルタリング
    const rawMakers = Array.isArray(makersRes) ? makersRes : (makersRes?.results || []);
    const makersData = rawMakers
        .filter((m: any) => {
            // アダルト向けソース (FANZA, DUGA, DMM) かつ 商品があるメーカーに限定
            const isAdultSource = ['FANZA', 'DUGA', 'DMM'].includes(m.api_source);
            const hasStock = (m.product_count || m.count || 0) > 0;
            return isAdultSource && hasStock;
        })
        .slice(0, 30) // 表示密度を高めるため30件
        .map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug || m.id?.toString(),
            product_count: m.product_count || m.count || 0
        }));

    // 3. お知らせ(WordPress等)の正規化
    const wpPosts = (Array.isArray(postsRes) ? postsRes : (postsRes?.results || []))
        .map((p: any) => ({
            id: p.id?.toString(),
            title: p.title?.rendered || p.title || "Untitled",
            slug: p.slug || ""
        }));

    const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
    const displayTotalPages = Math.ceil(totalCount / limit) || 1;

    return (
        <div className={styles.pageWrapper}>
            {/* 🛠️ NETWORK & API TELEMETRY MONITOR (生データ構造に合わせて更新) */}
            {showDebug && (
                <div style={{ 
                    position: 'sticky', top: 0, zIndex: 10000, background: '#05050a', borderBottom: '2px solid #e94560',
                    padding: '15px', fontFamily: 'monospace', fontSize: '11px', color: '#0ff', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h2 style={{ color: '#e94560', margin: 0, fontSize: '12px' }}>🛰️ SYSTEM_TELEMETRY_MONITOR // DATA_RECONSTRUCTION</h2>
                        <button onClick={() => setShowDebug(false)} style={{ background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold' }}>SHUTDOWN</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                        {/* [01] サイドバー通信ログ */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderLeft: '2px solid #f0f' }}>
                            <h3 style={{ color: '#f0f', marginTop: 0 }}>[01] SIDEBAR_API_STATUS</h3>
                            <div style={{ marginBottom: '5px' }}>
                                RAW_COUNT: {rawMakers.length} <br />
                                <span style={{ color: makersData.length > 0 ? '#0f0' : '#f00' }}>
                                    FILTERED_SUCCESS: {makersData.length} UNITS
                                </span>
                            </div>
                            <div style={{ color: '#888', fontSize: '9px' }}>
                                DETECTED_FORMAT: {Array.isArray(makersRes) ? 'RAW_ARRAY' : 'PAGINATED_OBJECT'}
                            </div>
                        </div>

                        {/* [02] メインプロダクト通信ログ */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderLeft: '2px solid #0ff' }}>
                            <h3 style={{ color: '#0ff', marginTop: 0 }}>[02] MAIN_GRID_STATUS</h3>
                            <div>ENTRIES_FOUND: {totalCount}</div>
                            <div style={{ color: '#aaa', fontSize: '9px' }}>
                                HEAD_PAYLOAD: {products[0] ? `ID: ${products[0].id} / ${products[0].title.substring(0,15)}...` : 'NONE'}
                            </div>
                        </div>

                        {/* [03] プロップス整合性 */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderLeft: '2px solid #fbbf24' }}>
                            <h3 style={{ color: '#fbbf24', marginTop: 0 }}>[03] ROUTE_INTEGRITY</h3>
                            <div style={{ fontSize: '9px' }}>
                                SOURCE: {currentSource || 'GLOBAL'} / OFFSET: {currentOffset} <br />
                                PAGE: {displayCurrentPage} / {displayTotalPages}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.ambientGlow} />

            <div className={styles.container}>
                {/* --- 🛡️ 1. Sidebar Area --- */}
                <aside className={styles.sidebarWrapper}>
                    <div className={styles.stickySidebar}>
                        <AdultSidebar 
                            makers={makersData} 
                            recentPosts={wpPosts}
                            product={currentSource ? { api_source: currentSource.toLowerCase() } : null}
                        />
                    </div>
                </aside>

                {/* --- 🏗️ 2. Main Content Area --- */}
                <main className={styles.mainContent}>
                    
                    <header className={styles.headerSection}>
                        <div className={styles.titleGroup}>
                            <div className={styles.systemLabel}>
                                <span className={styles.pulse} /> System_Archive_Node
                            </div>
                            <h1 className={styles.mainTitle}>
                                {currentSource || 'GLOBAL'} <span className={styles.titleAccent}>/</span> ARCHIVE
                            </h1>
                            <div className={styles.statusInfo}>
                                <span>STATUS: <span className={styles.statusOnline}>ONLINE</span></span>
                                <span>RECORDS: <span className={styles.statusValue}>{totalCount.toLocaleString()} UNITS</span></span>
                                <span>PROTOCOL: <span className={styles.statusValue}>RAW_ADAPTIVE_V3</span></span>
                            </div>
                        </div>

                        <div className={styles.controls}>
                            <nav className={styles.filterNav}>
                                {SOURCE_OPTIONS.map((opt) => (
                                    <Link
                                        key={opt.value}
                                        href={{ pathname: '/videos', query: { ...searchParams, api_source: opt.value, offset: 0 } }}
                                        className={`${styles.navLink} ${currentSource === opt.value ? styles.navLinkActive : ''}`}
                                    >
                                        {opt.label}
                                    </Link>
                                ))}
                            </nav>

                            <nav className={styles.filterNav}>
                                {SORT_OPTIONS.map((opt) => (
                                    <Link
                                        key={opt.value}
                                        href={{ pathname: '/videos', query: { ...searchParams, ordering: opt.value, offset: 0 } }}
                                        className={`${styles.navLink} ${currentOrdering === opt.value ? styles.navLinkSortActive : ''}`}
                                    >
                                        {opt.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </header>

                    {/* 📦 3. Product Grid */}
                    <Suspense fallback={<VideoGridSkeleton />}>
                        <div className={styles.productGrid}>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard 
                                        key={`${product.api_source}-${product.id}`} 
                                        product={product} 
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-40 text-center border border-dashed border-white/5 bg-white/[0.01]">
                                    <p className="text-[#475569] font-black tracking-[0.5em] uppercase text-[10px]">
                                        Signal_Lost: No_Registry_Entries_Found
                                    </p>
                                </div>
                            )}
                        </div>
                    </Suspense>

                    {/* 🔢 4. Pagination Area */}
                    {totalCount > limit && (
                        <div className={styles.paginationArea}>
                            <Pagination
                                currentOffset={currentOffset}
                                limit={limit}
                                totalCount={totalCount}
                                basePath="/videos"
                                extraParams={{ 
                                    ordering: currentOrdering, 
                                    api_source: currentSource, 
                                    maker__slug: currentMakerSlug 
                                }}
                            />
                            <div className={styles.pageStatus}>
                                SYNCHRONIZING_NODE: PAGE {displayCurrentPage} OF {displayTotalPages}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function VideoGridSkeleton() {
    return (
        <div className={styles.productGrid}>
            {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-4 opacity-20">
                    <div className="aspect-[3/4] bg-white/5 border border-white/5 animate-pulse" />
                    <div className="h-4 w-full bg-white/5 animate-pulse" />
                    <div className="h-3 w-2/3 bg-white/5 animate-pulse" />
                </div>
            ))}
        </div>
    );
}