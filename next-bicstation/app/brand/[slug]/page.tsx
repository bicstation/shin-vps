/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Metadata } from 'next';
import ProductCard from "@shared/cards/ProductCard";
import Sidebar from "@shared/layout/Sidebar";
import { fetchPCProducts, fetchMakers, fetchPostList } from '@shared/lib/api';
import { COLORS } from "@shared/styles/constants";
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
        'intel-14th-gen': '第14世代インテル', 'intel-13th-gen': '第13世代インテル', 'amd-ryzen-9000': 'Ryzen 9000',
        'intel-xeon': 'Intel Xeon', 'amd-ryzen-pro': 'Ryzen PRO',
        // AI / NPU
        'feature-npu-ai': 'NPU搭載 (AI PC)', 'npu-all': 'AIプロセッサ(NPU)',
        // GPU
        'gpu-rtx-5090': 'RTX 5090', 'gpu-rtx-5080': 'RTX 5080', 'gpu-rtx-5070': 'RTX 5070',
        'gpu-rtx-4070-ti': 'RTX 4070 Ti', 'gpu-rtx-4060': 'RTX 4060', 'gpu-rtx-40-series': 'RTX 40シリーズ',
        'gpu-intel-arc': 'Intel Arc', 'vram-16gb-plus': 'VRAM 16GB以上',
        // Display / Usage
        'usage-gaming': 'ゲーミング', 'usage-business': 'ビジネス', 'usage-creative': 'クリエイター',
        'panel-oled': '有機EL', 'res-4k': '4K',
    };

    if (mapping[slug]) return mapping[slug];
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * 文字列デコード・サニタイズ
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

/**
 * 💡 SEOメタデータの動的生成
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const [{ slug }, sParams] = await Promise.all([params, searchParams]);
    const decodedSlug = decodeURIComponent(slug);
    
    try {
        const makers = await fetchMakers();
        const makerObj = makers.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug);
        const brandName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
        const attrName = sParams.attribute ? getAttributeDisplayName(sParams.attribute) : "";
        
        const titleText = attrName ? `${brandName} × ${attrName} PC一覧` : `${brandName} 最新PCスペック比較・最安価格一覧`;

        return {
            title: `${titleText} | BICSTATION`,
            description: `${brandName}${attrName ? `の${attrName}搭載モデル` : 'の最新PC'}をスペック・価格で徹底比較。`,
        };
    } catch (e) {
        return { title: "製品一覧 | BICSTATION" };
    }
}

/**
 * メインコンポーネント
 */
export default async function BrandPage({ params, searchParams }: PageProps) {
    // Next.js 15: params と searchParams を await
    const [{ slug }, sParams] = await Promise.all([params, searchParams]);
    const decodedSlug = decodeURIComponent(slug);
    
    const currentPage = Math.max(1, Number(sParams.page) || 1);
    const attributeSlug = sParams.attribute || "";
    const limit = 12; 
    const offset = (currentPage - 1) * limit;

    // データの並列フェッチ
    let pcData, makersData, wpData;
    try {
        [pcData, makersData, wpData] = await Promise.all([
            fetchPCProducts(decodedSlug, offset, limit, attributeSlug),
            fetchMakers(),
            fetchPostList(5) 
        ]);
    } catch (error) {
        console.error("[API Error]:", error);
        pcData = { results: [], count: 0 };
        makersData = [];
        wpData = { results: [] };
    }

    const makerObj = makersData.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug);
    const brandDisplayName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
    const attrDisplayName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";
    
    const pageTitle = attrDisplayName 
        ? `${brandDisplayName} 【${attrDisplayName}】 搭載モデル` 
        : `${brandDisplayName} の最新PC比較・一覧`;

    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';
    const totalCount = pcData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const startRange = totalCount > 0 ? offset + 1 : 0;
    const endRange = Math.min(offset + limit, totalCount);

    // 🚀 JSON-LD 構造化データ
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": (pcData?.results || []).map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": offset + index + 1,
                "url": `https://bicstation.com/product/${product.unique_id || product.id}`,
                "name": product.name,
            }))
        }
    };

    return (
        <div className={styles.pageContainer}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ヘッダーセクション */}
            <div className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {pageTitle}
                    </h1>
                    <p className={styles.lead}>
                        {brandDisplayName} {attrDisplayName && `の「${attrDisplayName}」関連モデル`} をスペック順に比較。
                        {totalCount > 0 && `現在 ${totalCount} 件の製品が登録されています。`}
                    </p>
                </div>
            </div>

            <div className={styles.wrapper}>
                {/* サイドバー */}
                <aside className={styles.sidebarSection}>
                    <Sidebar 
                        activeMenu={decodedSlug} 
                        makers={makersData} 
                        recentPosts={(wpData?.results || []).map((p: any) => ({
                            id: p.id,
                            title: decodeHtml(p.title.rendered),
                            slug: p.slug
                        }))}
                    />
                </aside>

                {/* メインコンテンツ */}
                <main className={styles.main}>
                    <section className={styles.productSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.productGridTitle}>
                                <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                                {brandDisplayName} 製品一覧
                                {totalCount > 0 && (
                                    <span className={styles.countDetail}>
                                        ({startRange}～{endRange} 件 / 全 {totalCount} 件)
                                    </span>
                                )}
                            </h2>
                        </div>

                        {/* 製品グリッド */}
                        {!pcData?.results || pcData.results.length === 0 ? (
                            <div className={styles.noDataLarge}>
                                <p>現在、該当する製品データがありません。</p>
                                <Link href={`/product/maker/${decodedSlug}`} className={styles.resetLink}>
                                    {brandDisplayName} の全モデルを表示
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* ページネーション */}
                                {totalPages > 1 && (
                                    <nav className={styles.paginationWrapper} aria-label="ページ送り">
                                        <div className={styles.pagination}>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                                const query: Record<string, string> = { page: String(p) };
                                                if (attributeSlug) query.attribute = attributeSlug;
                                                const queryString = new URLSearchParams(query).toString();

                                                return (
                                                    <Link
                                                        key={p}
                                                        href={`/product/maker/${decodedSlug}?${queryString}`}
                                                        className={p === currentPage ? styles.pageActive : styles.pageLink}
                                                        aria-current={p === currentPage ? "page" : undefined}
                                                    >
                                                        {p}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}