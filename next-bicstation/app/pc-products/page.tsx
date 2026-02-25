/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// /home/maya/dev/shin-vps/next-bicstation/app/pc-products/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProductCard from '@shared/cards/ProductCard';
import Pagination from '@shared/common/Pagination';

// APIインポート
import { fetchPCProducts, fetchMakers } from '@shared/lib/api/django/pc';
import { COLORS } from "@/shared/styles/constants";
import styles from './BrandPage.module.css';

/**
 * ✅ 修正ポイント: 動的レンダリングを強制
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 属性スラッグから日本語表示名を取得するマッピング
 */
function getAttributeDisplayName(slug: string) {
    const mapping: { [key: string]: string } = {
        'intel-core-ultra-9': 'Core Ultra 9', 'intel-core-ultra-7': 'Core Ultra 7', 'intel-core-ultra-5': 'Core Ultra 5',
        'intel-core-i9': 'Core i9', 'intel-core-i7': 'Core i7', 'intel-core-i5': 'Core i5', 'intel-core-i3': 'Core i3',
        'intel-low-end': 'Celeron / Pentium', 'amd-ryzen-ai-300': 'Ryzen AI 300', 'amd-ryzen-9': 'Ryzen 9',
        'amd-ryzen-7': 'Ryzen 7', 'amd-ryzen-5': 'Ryzen 5', 'amd-ryzen-3': 'Ryzen 3', 'amd-threadripper': 'Ryzen Threadripper',
        'intel-14th-gen': '最新第14世代インテル', 'intel-13th-gen': '最新第13世代インテル', 'amd-ryzen-9000': 'Ryzen 9000シリーズ',
        'feature-npu-ai': 'NPU搭載 (AI PC)', 'feature-power-efficient': '省電力モデル', 'intel-xeon': 'Intel Xeon', 'amd-ryzen-pro': 'Ryzen PRO',
        'gpu-rtx-5090': 'GeForce RTX 5090', 'gpu-rtx-5080': 'GeForce RTX 5080', 'gpu-rtx-5070-ti': 'GeForce RTX 5070 Ti',
        'gpu-rtx-5070': 'GeForce RTX 5070', 'gpu-rtx-50-series': 'GeForce RTX 50シリーズ', 'gpu-rtx-4070-ti': 'GeForce RTX 4070 Ti',
        'gpu-rtx-4060-ti': 'GeForce RTX 4060 Ti', 'gpu-rtx-4060': 'GeForce RTX 4060', 'gpu-rtx-4050': 'GeForce RTX 4050',
        'gpu-rtx-40-series': 'GeForce RTX 40シリーズ', 'gpu-radeon-ai-pro': 'Radeon AI PRO', 'gpu-intel-arc': 'Intel Arc Graphics',
        'gpu-laptop': 'ノートPC用GPU', 'gpu-desktop': 'デスクトップ用GPU', 'vram-16gb-plus': 'ビデオメモリ 16GB以上',
        'vram-8gb-plus': 'ビデオメモリ 8GB', 'vram-6gb-plus': 'ビデオメモリ 6GB', 'gpu-professional': 'プロ向け (NVIDIA RTX / Quadro)',
        'gpu-intel-graphics': 'Intel Graphics (内蔵)', 'gpu-amd-graphics': 'AMD Radeon Graphics (内蔵)',
        'size-mobile': '14インチ以下 (モバイル)', 'size-standard': '24-25インチ (標準)', 'size-large': '27インチ (大画面)',
        'size-huge': '32インチ以上 (特大)', 'res-wqhd': 'WQHD', 'res-4k': '4K', 'high-refresh': '高速 (144Hz-165Hz)',
        'extreme-refresh': '超高速 (240Hz+)', 'panel-oled': '有機EL', 'panel-ips': 'IPSパネル', 'curved-wide': '湾曲・ウルトラワイド',
        'spatial-labs': '裸眼立体視', 'mem-16gb': 'メモリ 16GB', 'mem-32gb': 'メモリ 32GB', 'npu-all': 'AIプロセッサ(NPU)',
        'win-11-pro': 'Windows 11 Pro', 'gaming-pc': 'ゲーミングモデル', 'portable-monitor': 'モバイルモニター', 'ssd-512gb': 'SSD 512GB',
    };
    return mapping[slug] || "";
}

interface PageProps {
    params: Promise<{ slug?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PCProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full"></div>
                Loading_Product_Database...
            </div>
        }>
            <PCProductsContent {...props} />
        </Suspense>
    );
}

async function PCProductsContent(props: PageProps) {
    const sParams = await props.searchParams;
    
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attributeSlug = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const makerSlug = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    // データの並列取得
    const [pcData, makersData] = await Promise.all([
        fetchPCProducts(makerSlug || '', currentOffset, limit, attributeSlug || '').catch(() => ({ results: [], count: 0 })),
        fetchMakers().catch(() => [])
    ]);

    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    const makerObj = makerSlug ? (makersData.find((m: any) => m.slug === makerSlug) as any) : null;
    const makerName = makerObj ? (makerObj.name || makerObj.maker) : (makerSlug ? makerSlug.toUpperCase() : "");
    const attrName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";

    let pageTitle = "";
    if (makerName && attrName) {
        pageTitle = `${makerName} × ${attrName} 搭載モデル`;
    } else if (makerName) {
        pageTitle = `${makerName} 製品一覧`;
    } else if (attrName) {
        pageTitle = `${attrName} 搭載モデル一覧`;
    } else {
        pageTitle = "すべてのPC製品一覧";
    }

    const totalCount = pcData.count || 0;
    const startRange = totalCount > 0 ? currentOffset + 1 : 0;
    const endRange = Math.min(currentOffset + limit, totalCount);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "description": `${pageTitle}のスペック・価格を比較。BICSTATIONが厳選した最新モデルを網羅。`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": (pcData.results || []).slice(0, 10).map((p: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": p.affiliate_url || p.url,
                "name": p.name,
                "image": p.image_url
            }))
        }
    };

    return (
        <div className={styles.pageContainer}>           
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
                        最新の {pageTitle} スペック・価格をリアルタイム比較。
                        {totalCount > 0 && `現在、${totalCount}件のモデルが掲載中です。`}
                    </p>
                </div>
            </div>

            <div className={styles.wrapper}>
                {/* ✅ 修正ポイント: 
                  RootLayout 側の PCSidebar と重複するため、ここにあったサイドバー領域を削除。
                  main コンテンツが styles.wrapper 内で適切に配置されます。
                */}
                <main className={styles.main}>
                    <section className={styles.productSection}>
                        <div className={styles.productGridTitle}>
                            <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                            製品ラインナップ
                            {totalCount > 0 && (
                                <span className={styles.countDetail}>
                                    全 <strong>{totalCount}</strong> 件中 {startRange}～{endRange} 件を表示
                                </span>
                            )}
                        </div>

                        {!pcData.results || pcData.results.length === 0 ? (
                            <div className={styles.noDataLarge}>
                                <p>該当する製品データが見つかりませんでした。</p>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                                    条件を変更して再度お試しください。
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid} style={{ minHeight: '400px' }}>
                                    {pcData.results.map((product: any) => (
                                        <ProductCard key={product.id || product.unique_id} product={product} />
                                    ))}
                                </div>

                                <div className={styles.paginationWrapper}>
                                    <Suspense fallback={<div className="h-10 w-full bg-slate-900 animate-pulse rounded" />}>
                                        <Pagination 
                                            currentOffset={currentOffset}
                                            limit={limit}
                                            totalCount={totalCount}
                                            baseUrl={`/pc-products`} 
                                        />
                                    </Suspense>
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}