/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Metadata } from "next";
import ProductCard from "@shared/cards/AdultProductCard"; 
import Sidebar from "@shared/layout/Sidebar";
import Pagination from "@shared/common/Pagination"; 
import * as DjangoAPI from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import styles from "./BrandPage.module.css";
import Link from "next/link";

/**
 * 3. SEOメタデータの動的生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const slug = decodeURIComponent(params.slug);
    const title = `${slug.toUpperCase()} | アーカイブ解析ノード | TIPER`;
    
    return {
        title: title,
        description: `${slug}の最新作品情報を5軸解析データと共にストリーミング。`,
        openGraph: {
            title: title,
            type: "website",
        },
    };
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandPage(props: PageProps) {
    // --- 1. パラメータ解決 ---
    const resolvedParams = await props.params;
    const resolvedSearchParams = await props.searchParams;
    
    const slug = resolvedParams?.slug || "";
    const decodedSlug = decodeURIComponent(slug);
    const lowerSlug = decodedSlug.toLowerCase();
    const isMainPlatform = ['duga', 'fanza', 'dmm'].includes(lowerSlug);

    // --- 2. ページングとソートの補正 ---
    const limit = 24;
    const currentOffset = Number(resolvedSearchParams.offset || 0);
    
    // DjangoのPageNumberPagination (?page=X) への変換
    const currentPage = Math.floor(currentOffset / limit) + 1;
    
    // 4. ソートの連動
    const currentSort = (Array.isArray(resolvedSearchParams.sort) 
        ? resolvedSearchParams.sort[0] 
        : (resolvedSearchParams.sort || "-release_date"));

    // --- 3. APIパラメータの構築 ---
    const apiParams: any = {
        page: currentPage,
        page_size: limit,
        ordering: currentSort,
    };

    if (isMainPlatform) {
        apiParams.api_source = lowerSlug.toUpperCase();
    } else {
        apiParams.maker__slug = decodedSlug;
        if (decodedSlug.toLowerCase().includes('duga')) apiParams.api_source = 'DUGA';
    }

    // --- 4. データフェッチ (並列実行) ---
    const fetchFunc = (DjangoAPI as any).getAdultProducts;
    
    const [pcData, mRes, wRes] = await Promise.all([
        typeof fetchFunc === 'function' ? fetchFunc(apiParams).catch(() => null) : null,
        DjangoAPI.fetchMakers().catch(() => []),
        fetchPostList(5).catch(() => ({ results: [] }))
    ]);

    const products = pcData?.results || [];
    const totalCount = pcData?.count || 0;
    const makersData = Array.isArray(mRes) ? mRes : (mRes as any)?.results || [];
    const wpPosts = Array.isArray(wRes) ? wRes : (wRes as any)?.results || [];

    const makerObj = makersData.find((m: any) => m.slug === decodedSlug);
    const brandDisplayName = isMainPlatform ? lowerSlug.toUpperCase() : (makerObj?.name || decodedSlug);

    return (
        <div className={styles.pageContainer}>
            {/* ヘッダーエリア */}
            <header className={styles.fullWidthHeader} data-platform={isMainPlatform ? lowerSlug : "maker"}>
                <div className={styles.headerGlow} />
                <div className={styles.headerInner}>
                    <div className={styles.titleArea}>
                        <div className={styles.label}>
                            <span className={styles.pulseDot} />
                            {isMainPlatform ? "SYSTEM_PLATFORM" : "MAKER_DATABASE"}
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
                {/* サイドバー */}
                <aside className={styles.sidebar}>
                    <div className={styles.brandNav}>
                        <h3>NETWORK_SELECT</h3>
                        <div className={styles.brandButtons}>
                            {['FANZA', 'DMM', 'DUGA'].map((b) => (
                                <Link 
                                    key={b} 
                                    href={`/brand/${b.toLowerCase()}`}
                                    className={`${styles.brandBtn} ${lowerSlug === b.toLowerCase() ? styles.active : ""}`}
                                >
                                    {b}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Sidebar 
                        makers={makersData} 
                        recentPosts={wpPosts.map((p: any) => ({
                            id: p.id?.toString() || Math.random().toString(),
                            title: p.title?.rendered || p.title || "Untitled",
                            slug: p.slug || ""
                        }))} 
                    />
                </aside>

                {/* メイングリッド */}
                <main className={styles.main}>
                    <div className={styles.toolbar}>
                        <div className={styles.sortInfo}>
                            STREAM_RANGE: {currentOffset + 1} - {Math.min(currentOffset + limit, totalCount)}
                        </div>
                        <div className={styles.sortActions}>
                            {/* ソートボタン例 (クライアント側処理が必要な場合は別コンポーネント化) */}
                            <div className={styles.currentSortLabel}>SORT: {currentSort.replace('-', '').toUpperCase()}</div>
                        </div>
                    </div>

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

                            <div className={styles.paginationArea}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={totalCount}
                                    basePath={`/brand/${decodedSlug}`}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noDataLarge}>
                            <div className={styles.errorIcon}>⚠️</div>
                            <h3>ERROR: NULL_RESPONSE</h3>
                            <p>ノード「{brandDisplayName}」のデータストリームが途絶えています。</p>
                            <Link href="/" className={styles.backBtn}>REBOOT_SYSTEM</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}