/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React, { Suspense } from 'react';
import { Metadata } from 'next';

// ✅ 修正: 物理構造に基づいたインポートパス
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

// ✅ 修正: 共通ロジック & 定数 (エイリアスを @/shared に統一)
import { fetchPCProducts, fetchMakers } from '@/shared/lib/api/django/pc';
import { COLORS } from "@/shared/styles/constants";
import styles from './BrandPage.module.css';

/**
 * =============================================================================
 * 🛠️ ユーティリティ: 属性表示名の変換
 * =============================================================================
 */
function getAttributeDisplayName(slug: string) {
    const mapping: { [key: string]: string } = {
        'intel-core-ultra-9': 'Core Ultra 9', 'intel-core-ultra-7': 'Core Ultra 7', 'intel-core-ultra-5': 'Core Ultra 5',
        'intel-core-i9': 'Core i9', 'intel-core-i7': 'Core i7', 'intel-core-i5': 'Core i5', 'intel-core-i3': 'Core i3',
        'intel-low-end': 'Celeron / Pentium', 'amd-ryzen-ai-300': 'Ryzen AI 300', 'amd-ryzen-9': 'Ryzen 9',
        'amd-ryzen-7': 'Ryzen 7', 'amd-ryzen-5': 'Ryzen 5', 'amd-ryzen-3': 'Ryzen 3', 'amd-threadripper': 'Ryzen Threadripper',
        'intel-14th-gen': '第14世代インテル', 'intel-13th-gen': '第13世代インテル', 'amd-ryzen-9000': 'Ryzen 9000',
        'feature-npu-ai': 'NPU搭載 (AI PC)', 'feature-power-efficient': '省電力モデル', 'intel-xeon': 'Intel Xeon',
        'gpu-rtx-5090': 'RTX 5090', 'gpu-rtx-5080': 'RTX 5080', 'gpu-rtx-4070-ti': 'RTX 4070 Ti',
        'gpu-rtx-4060': 'RTX 4060', 'gpu-intel-arc': 'Intel Arc', 'panel-oled': '有機EL搭載',
    };
    return mapping[slug] || slug;
}

/**
 * =============================================================================
 * 📈 サーバーセクション (Metadata & Configuration)
 * =============================================================================
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ slug?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const makerSlug = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    const attrSlug = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    const makerPart = makerSlug ? makerSlug.toUpperCase() : "";
    const attrPart = attrSlug ? getAttributeDisplayName(attrSlug) : "";
    const title = `${makerPart}${makerPart && attrPart ? ' × ' : ''}${attrPart} PC製品一覧 | BICSTATION`;

    return {
        title,
        description: `${title}のスペック・価格を比較。最新モデルの情報をリアルタイムで更新中。`,
    };
}

/**
 * =============================================================================
 * 🏗️ ページエントリポイント
 * =============================================================================
 */
export default function PCProductsPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                Initializing_Product_Archive...
            </div>
        }>
            <PCProductsContent {...props} />
        </Suspense>
    );
}

/**
 * =============================================================================
 * 📄 コンテンツ描画 (Server Component)
 * =============================================================================
 */
async function PCProductsContent(props: PageProps) {
    const sParams = await props.searchParams;
    
    // クエリパラメータの正規化
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attributeSlug = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    const makerSlug = Array.isArray(sParams.maker) ? sParams.maker[0] : sParams.maker;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 20;

    // API並列取得
    const [pcData, makersData] = await Promise.all([
        fetchPCProducts(makerSlug || '', currentOffset, limit, attributeSlug || '').catch(() => ({ results: [], count: 0 })),
        fetchMakers().catch(() => [])
    ]);

    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    // 表示用タイトルの構築
    const makerObj = makerSlug ? (makersData.find((m: any) => m.slug === makerSlug) as any) : null;
    const makerName = makerObj ? (makerObj.name || makerObj.maker) : (makerSlug ? makerSlug.toUpperCase() : "");
    const attrName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";

    const pageTitle = (makerName && attrName) ? `${makerName} × ${attrName} 搭載モデル` 
                    : makerName ? `${makerName} 製品一覧`
                    : attrName ? `${attrName} 搭載モデル一覧`
                    : "すべてのPC製品一覧";

    const totalCount = pcData.count || 0;
    const startRange = totalCount > 0 ? currentOffset + 1 : 0;
    const endRange = Math.min(currentOffset + limit, totalCount);

    // 構造化データ (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": (pcData.results || []).slice(0, 10).map((p: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": p.name,
                "url": p.affiliate_url || p.url
            }))
        }
    };

    return (
        <div className={styles.pageContainer}>           
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ヒーローヘッダー */}
            <div className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {pageTitle}
                    </h1>
                    <p className={styles.lead}>
                        最新のスペックと市場価格をリアルタイムに同期。
                        {totalCount > 0 && <span>現在 <strong>{totalCount}</strong> 件の構成をアーカイブ済み。</span>}
                    </p>
                </div>
            </div>

            <div className={styles.wrapper}>
                <main className={styles.main}>
                    <section className={styles.productSection}>
                        <div className={styles.productGridTitle}>
                            <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                            PRODUCT_LINEUP
                            {totalCount > 0 && (
                                <span className={styles.countDetail}>
                                    Showing {startRange}–{endRange} of {totalCount}
                                </span>
                            )}
                        </div>

                        {!pcData.results || pcData.results.length === 0 ? (
                            <div className={styles.noDataLarge}>
                                <div className={styles.noDataIcon}>🔍</div>
                                <p>条件に一致する製品が見つかりませんでした。</p>
                                <p className={styles.noDataSub}>フィルター設定を緩和して再度お試しください。</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((product: any) => (
                                        <ProductCard key={product.id || product.unique_id} product={product} />
                                    ))}
                                </div>

                                <div className={styles.paginationWrapper}>
                                    <Pagination 
                                        currentOffset={currentOffset}
                                        limit={limit}
                                        totalCount={totalCount}
                                        baseUrl={`/pc-products`} 
                                    />
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}