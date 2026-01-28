/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import Sidebar from "@/components/layout/Sidebar";
import { fetchPCProducts, fetchMakers, fetchPostList } from "@/lib/api";
import { COLORS } from "@/constants";
import styles from "./BrandPage.module.css";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; attribute?: string }>;
}

/**
 * 💡 属性スラッグから日本語表示名を取得するマッピング
 */
function getAttributeDisplayName(slug: string) {
    const mapping: { [key: string]: string } = {
        // CPU
        'intel-core-ultra-9': 'Core Ultra 9', 'intel-core-ultra-7': 'Core Ultra 7', 'intel-core-ultra-5': 'Core Ultra 5',
        'intel-core-i9': 'Core i9', 'intel-core-i7': 'Core i7', 'intel-core-i5': 'Core i5', 'intel-core-i3': 'Core i3',
        'intel-low-end': 'Celeron / Pentium', 'amd-ryzen-ai-300': 'Ryzen AI 300', 'amd-ryzen-9': 'Ryzen 9',
        'amd-ryzen-7': 'Ryzen 7', 'amd-ryzen-5': 'Ryzen 5', 'amd-ryzen-3': 'Ryzen 3', 'amd-threadripper': 'Ryzen Threadripper',
        'intel-14th-gen': '最新第14世代インテル', 'intel-13th-gen': '最新第13世代インテル', 'amd-ryzen-9000': 'Ryzen 9000シリーズ',
        'intel-xeon': 'Intel Xeon', 'amd-ryzen-pro': 'Ryzen PRO',
        // AI / NPU
        'feature-npu-ai': 'NPU搭載 (AI PC)', 'npu-all': 'AIプロセッサ(NPU)',
        // GPU
        'gpu-rtx-5090': 'GeForce RTX 5090', 'gpu-rtx-5080': 'GeForce RTX 5080', 'gpu-rtx-5070-ti': 'GeForce RTX 5070 Ti',
        'gpu-rtx-5070': 'GeForce RTX 5070', 'gpu-rtx-50-series': 'GeForce RTX 50シリーズ', 'gpu-rtx-4070-ti': 'GeForce RTX 4070 Ti',
        'gpu-rtx-4060-ti': 'GeForce RTX 4060 Ti', 'gpu-rtx-4060': 'GeForce RTX 4060', 'gpu-rtx-4050': 'GeForce RTX 4050',
        'gpu-rtx-40-series': 'GeForce RTX 40シリーズ', 'gpu-radeon-ai-pro': 'Radeon AI PRO', 'gpu-intel-arc': 'Intel Arc Graphics',
        'gpu-laptop': 'ノートPC用GPU', 'gpu-desktop': 'デスクトップ用GPU', 'vram-16gb-plus': 'ビデオメモリ 16GB以上',
        'vram-8gb-plus': 'ビデオメモリ 8GB', 'vram-6gb-plus': 'ビデオメモリ 6GB', 'gpu-professional': 'プロ向け (NVIDIA RTX / Quadro)',
        'gpu-intel-graphics': 'Intel Graphics (内蔵)', 'gpu-amd-graphics': 'AMD Radeon Graphics (内蔵)',
        // Display / Size
        'size-mobile': '14インチ以下 (モバイル)', 'size-standard': '24-25インチ (標準)', 'size-large': '27インチ (大画面)',
        'size-huge': '32インチ以上 (特大)', 'res-wqhd': 'WQHD', 'res-4k': '4K', 'high-refresh': '高速 (144Hz-165Hz)',
        'extreme-refresh': '超高速 (240Hz+)', 'panel-oled': '有機EL', 'panel-ips': 'IPSパネル', 'curved-wide': '湾曲・ウルトラワイド',
        'spatial-labs': '裸眼立体視', 'portable-monitor': 'モバイルモニター',
        // Memory / Storage / OS
        'mem-16gb': 'メモリ 16GB', 'mem-32gb': 'メモリ 32GB', 'ssd-512gb': 'SSD 512GB', 'win-11-pro': 'Windows 11 Pro',
        // Usage
        'usage-gaming': 'ゲーミング', 'gaming-pc': 'ゲーミングモデル', 'usage-business': 'ビジネス', 'usage-creative': 'クリエイター向け',
        'feature-power-efficient': '省電力モデル',
    };

    if (mapping[slug]) return mapping[slug];
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ attribute?: string }> }) {
    try {
        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        const sParams = await searchParams;
        const makers = await fetchMakers();
        const makerObj = makers.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug) as any;
        const brandName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
        const attrName = sParams.attribute ? getAttributeDisplayName(sParams.attribute) : "";
        const titleText = attrName ? `${brandName} × ${attrName} PC一覧` : `${brandName} 最新PCスペック比較・最安価格一覧`;

        return {
            title: `${titleText} | BICSTATION`,
            description: `${brandName}${attrName ? `の${attrName}対応モデル` : 'のノートPC・デスクトップ'}をリアルタイム比較。`,
        };
    } catch (e) {
        return { title: "製品一覧 | BICSTATION" };
    }
}

export default async function BrandPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const sParams = await searchParams;
    
    const currentPage = Number(sParams.page) || 1;
    const attributeSlug = sParams.attribute || "";
    const limit = 12; 
    const offset = (currentPage - 1) * limit;

    let pcData: any = { results: [], count: 0 };
    let makersData: any[] = [];
    let wpData: any = { results: [] };

    // 🚩 デバッグ用のURL構築ログ
    const debugApiUrl = `process.env.NEXT_PUBLIC_API_URL/pc-products/?maker=${decodedSlug}&offset=${offset}&limit=${limit}&attribute=${attributeSlug}`;
    console.log(`[Next.js Debug]: Fetching BrandPage Data...`);
    console.log(`[Next.js Debug]: PC API URL -> ${debugApiUrl}`);

    try {
        const [pcRes, makersRes, wpRes] = await Promise.all([
            fetchPCProducts(decodedSlug, offset, limit, attributeSlug),
            fetchMakers(),
            fetchPostList(5) 
        ]);
        
        pcData = pcRes;
        makersData = makersRes;
        wpData = wpRes;

        // 🚩 データ取得後の件数ログ
        console.log(`[Next.js Debug]: Success! Found ${pcData?.count || 0} products.`);
    } catch (error) {
        console.error(`[Next.js API Error]: Failed to fetch data for ${decodedSlug}`);
        console.error(`[Next.js API Error]: Target URL was -> ${debugApiUrl}`);
        console.error(error);
    }

    const makerObj = makersData.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug) as any;
    const brandDisplayName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug;
    const attrDisplayName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";
    const pageTitle = attrDisplayName 
        ? `${brandDisplayName} 【${attrDisplayName}】 搭載モデル` 
        : `${brandDisplayName} の最新PC比較・一覧`;

    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';
    const totalCount = pcData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const startRange = totalCount > 0 ? offset + 1 : 0;
    const endRange = Math.min(offset + limit, totalCount);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": pcData?.results?.map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": offset + index + 1,
                "url": `https://bicstation.com/product/${product.unique_id || product.id}`,
                "name": product.name,
            })) || []
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* ブラウザのコンソールにもURLを表示するための隠しデバッグタグ（開発用） */}
            <script dangerouslySetInnerHTML={{ __html: `console.log("🚀 Client-side Debug: API URL used was ${debugApiUrl}");` }} />
            
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {pageTitle}
                    </h1>
                    <p className={styles.lead}>
                        {brandDisplayName} {attrDisplayName && `の「${attrDisplayName}」関連モデル`} をリアルタイム集計。
                        {totalCount > 0 ? `現在、該当する製品は ${totalCount} 件見つかりました。` : '条件に一致する製品を探しています。'}
                    </p>
                </div>
            </div>

            <div className={styles.wrapper}>
                <aside className={styles.sidebarSection}>
                    <Sidebar 
                        activeMenu={decodedSlug} 
                        makers={makersData} 
                        recentPosts={wpData.results.map((p: any) => ({
                            id: p.id,
                            title: decodeHtml(p.title.rendered),
                            slug: p.slug
                        }))}
                    />
                </aside>

                <main className={styles.main}>
                    <section className={styles.productSection}>
                        <h2 className={styles.productGridTitle}>
                            <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                            {brandDisplayName} {attrDisplayName ? `× ${attrDisplayName}` : '製品一覧'}
                            {totalCount > 0 && (
                                <span className={styles.countDetail}>
                                    全 <strong>{totalCount}</strong> 件中 {startRange}～{endRange} 件を表示
                                </span>
                            )}
                        </h2>

                        {!pcData || !pcData.results || pcData.results.length === 0 ? (
                            <div className={styles.noDataLarge}>
                                <p>現在、{brandDisplayName} <strong>{attrDisplayName}</strong> の該当する製品データがありません。</p>
                                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>Debug URL: {debugApiUrl}</p>
                                <Link href={`/brand/${decodedSlug}`} className={styles.resetLink} style={{ color: primaryColor, marginTop: '15px', display: 'inline-block' }}>
                                    {brandDisplayName} の全製品を見る
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className={styles.paginationWrapper}>
                                        <nav className={styles.pagination} aria-label="ページ送り">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                                const query: any = { page: p };
                                                if (attributeSlug) query.attribute = attributeSlug;
                                                const queryString = new URLSearchParams(query).toString();

                                                return (
                                                    <Link
                                                        key={p}
                                                        href={`/brand/${decodedSlug}?${queryString}`}
                                                        className={p === currentPage ? styles.pageActive : styles.pageLink}
                                                    >
                                                        {p}
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}