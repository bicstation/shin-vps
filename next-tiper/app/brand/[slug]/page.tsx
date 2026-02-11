/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@shared/cards/AdultProductCard"; 
import Sidebar from "@shared/layout/Sidebar";
import Pagination from "@shared/common/Pagination"; 
// getUnifiedProducts を含む最新のDjango APIクライアント
import { getUnifiedProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import styles from "./BrandPage.module.css";

/**
 * 💡 1. SEOメタデータの動的生成
 */
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const slug = decodeURIComponent(params.slug);
    const brandName = slug.toUpperCase();
    const title = `${brandName} | アーカイブ解析ノード | TIPER LIVE`;
    
    return {
        title: title,
        description: `${brandName}の最新作品情報を5軸AI解析データと共にストリーミング。`,
        openGraph: {
            title: title,
            type: "website",
        },
    };
}

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1分キャッシュ

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 💡 2. メインブランドページコンポーネント
 */
export default async function BrandPage(props: PageProps) {
    // --- A. パラメータ解決 ---
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    
    const slug = resolvedParams?.slug || "";
    const decodedSlug = decodeURIComponent(slug);
    const lowerSlug = decodedSlug.toLowerCase();
    
    // プラットフォーム判定
    const isMainPlatform = ['duga', 'fanza', 'dmm'].includes(lowerSlug);

    // --- B. ページングと高度なソートロジック ---
    const limit = 24;
    const currentOffset = Number(resolvedSearchParams.offset || 0);
    
    // ソートオプションの定義
    const sortOptions = [
        { label: 'LATEST', value: '-release_date' },
        { label: 'POPULAR', value: '-review_count' },
        { label: 'AI_SCORE', value: '-spec_score' },
        { label: 'PRICE_DESC', value: '-price' },
        { label: 'PRICE_ASC', value: 'price' },
    ];

    // 現在のソート順を取得（デフォルトは新着順）
    const currentSort = (Array.isArray(resolvedSearchParams.sort) 
        ? resolvedSearchParams.sort[0] 
        : (resolvedSearchParams.sort || "-release_date"));

    // --- C. データフェッチ (Unified Viewの利用) ---
    const [pcData, mRes, wRes] = await Promise.all([
        getUnifiedProducts({
            limit: limit,
            offset: currentOffset,
            ordering: currentSort,
            // プラットフォームなら api_source、メーカーなら maker__slug を指定
            api_source: isMainPlatform ? lowerSlug.toUpperCase() : "",
            maker_slug: isMainPlatform ? "" : decodedSlug
        }).catch(() => null),
        fetchMakers().catch(() => []),
        fetchPostList(5).catch(() => ({ results: [] }))
    ]);

    const products = pcData?.results || [];
    const totalCount = pcData?.count || 0;
    const makersData = Array.isArray(mRes) ? mRes : (mRes as any)?.results || [];
    const wpPosts = Array.isArray(wRes) ? wRes : (wRes as any)?.results || [];

    // 表示名決定
    const makerObj = makersData.find((m: any) => m.slug === decodedSlug);
    const brandDisplayName = isMainPlatform ? lowerSlug.toUpperCase() : (makerObj?.name || decodedSlug);

    return (
        <div className={styles.pageContainer}>
            {/* 🌌 1. サイバーパンク・ヘッダーエリア */}
            <header className={styles.fullWidthHeader} data-platform={isMainPlatform ? lowerSlug : "maker"}>
                <div className={styles.headerGlow} />
                <div className={styles.headerInner}>
                    <div className={styles.titleArea}>
                        <div className={styles.label}>
                            <span className={styles.pulseDot} />
                            {isMainPlatform ? "SYSTEM_PLATFORM_NODE" : "MAKER_DATABASE_NODE"}
                        </div>
                        <h1 className={styles.title}>
                            {brandDisplayName} <span className={styles.titleThin}>/DATA_LINK</span>
                        </h1>
                    </div>
                    
                    <div className={styles.stats}>
                        <div className={styles.statsLabel}>RECORDS_FOUND</div>
                        <div className={styles.statsValue}>
                            <span className={styles.countNum}>{totalCount.toLocaleString()}</span>
                            <span className={styles.countUnit}>UNITS</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.wrapper}>
                {/* 💡 2. サイドバー */}
                <aside className={styles.sidebar}>
                    <div className={styles.brandNav}>
                        <h3 className={styles.sidebarTitle}>NETWORK_SELECT</h3>
                        <div className={styles.brandButtons}>
                            {['FANZA', 'DMM', 'DUGA'].map((b) => {
                                const bLower = b.toLowerCase();
                                const isActive = lowerSlug === bLower;
                                return (
                                    <Link 
                                        key={b} 
                                        href={`/brand/${bLower}`}
                                        className={`${styles.brandBtn} ${isActive ? styles.active : ""}`}
                                    >
                                        <span className={styles.btnText}>{b}</span>
                                        {isActive && <span className={styles.activeIndicator} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.sidebarBase}>
                        <Sidebar 
                            makers={makersData} 
                            recentPosts={wpPosts.map((p: any) => ({
                                id: p.id?.toString() || Math.random().toString(),
                                title: p.title?.rendered || p.title || "Untitled",
                                slug: p.slug || ""
                            }))} 
                        />
                    </div>
                </aside>

                {/* 💡 3. メインコンテンツエリア */}
                <main className={styles.main}>
                    {/* 🛠️ 高度なツールバー (ソート機能実装) */}
                    <div className={styles.toolbar}>
                        <div className={styles.sortInfo}>
                            <span className={styles.terminalIcon}>&gt;</span> 
                            STREAM_RANGE: {currentOffset + 1} - {Math.min(currentOffset + limit, totalCount)}
                        </div>
                        
                        <div className={styles.sortActions}>
                            <div className={styles.sortButtonGroup}>
                                {sortOptions.map((opt) => (
                                    <Link
                                        key={opt.value}
                                        href={{
                                            pathname: `/brand/${decodedSlug}`,
                                            query: { ...resolvedSearchParams, sort: opt.value, offset: 0 }
                                        }}
                                        className={`${styles.sortBtn} ${currentSort === opt.value ? styles.sortBtnActive : ""}`}
                                    >
                                        {opt.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 商品グリッド */}
                    {products.length > 0 ? (
                        <div className={styles.contentFadeIn}>
                            <div className={styles.productGrid}>
                                {products.map((item: any) => (
                                    <ProductCard 
                                        key={item.id || item.product_id_unique} 
                                        product={item} 
                                    />
                                ))}
                            </div>

                            {/* ページネーション (ソート条件を完全維持) */}
                            <div className={styles.paginationArea}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={totalCount}
                                    basePath={`/brand/${decodedSlug}`}
                                    extraParams={{ sort: currentSort }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noDataLarge}>
                            <div className={styles.errorIcon}>⚠️</div>
                            <h3>ERROR: NULL_RESPONSE</h3>
                            <p>ノード「{brandDisplayName}」のデータストリームが空、または途絶えています。</p>
                            <Link href="/videos" className={styles.backBtn}>RETURN_TO_ARCHIVE</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}