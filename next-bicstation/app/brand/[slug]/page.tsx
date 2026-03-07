/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🏷️ BICSTATION ブランド別製品一覧 (Brand Page)
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * 物理パス: app/brand/[slug]/page.tsx
 * =====================================================================
 */

import React from "react";
import { Metadata } from 'next';
import Link from "next/link";

// ✅ 修正ポイント 1: インポートパスを物理構造に合わせる
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { COLORS } from '@/shared/styles/constants';
import { fetchPCProducts, fetchMakers } from '@/shared/lib/api/django/pc';

import styles from "./BrandPage.module.css";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; attribute?: string }>;
}

/**
 * 💡 属性表示名マッピング
 */
function getAttributeDisplayName(slug: string): string {
    const mapping: Record<string, string> = {
        'intel-core-ultra-9': 'Core Ultra 9', 
        'intel-core-ultra-7': 'Core Ultra 7', 
        'intel-core-ultra-5': 'Core Ultra 5',
        'intel-core-i9': 'Core i9', 
        'intel-core-i7': 'Core i7', 
        'intel-core-i5': 'Core i5',
        'feature-npu-ai': 'NPU搭載 (AI PC)', 
        'gpu-rtx-4060': 'RTX 4060',
        'usage-gaming': 'ゲーミング', 
        'usage-creative': 'クリエイター',
    };
    return mapping[slug] || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * 📈 SEOメタデータ生成
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const sParams = await searchParams;
    const decodedSlug = decodeURIComponent(slug);
    
    try {
        const makers = await fetchMakers();
        const makerObj = makers.find((m: any) => 
            m.slug === decodedSlug || m.maker?.toLowerCase() === decodedSlug.toLowerCase()
        );
        const brandName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
        const attrName = sParams.attribute ? getAttributeDisplayName(sParams.attribute as string) : "";
        const pageNum = sParams.page ? ` (${sParams.page}ページ目)` : "";
        
        return {
            title: `${brandName}${attrName ? ` × ${attrName}` : ""} 最新PC一覧${pageNum} | BICSTATION`,
            description: `${brandName}${attrName ? `の${attrName}搭載モデル` : 'の最新PC'}をスペック・価格で徹底比較。${pageNum}`,
        };
    } catch (e) {
        return { title: "ブランド製品一覧 | BICSTATION" };
    }
}

/**
 * 💡 ブランドページメインコンポーネント
 */
export default async function BrandPage({ params, searchParams }: PageProps) {
    // 1. パラメータの解決
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
    const attributeSlug = (resolvedSearchParams.attribute as string) || "";
    const limit = 12; 
    const offset = (currentPage - 1) * limit;

    // 2. データフェッチ
    // 引数の順序は fetchPCProducts(q, offset, limit, attribute, budget_max, budget_min, npu, gpu, sort)
    const [pcData, makersData] = await Promise.all([
        fetchPCProducts(decodedSlug, offset, limit, attributeSlug, "1000000", "0", false, false, "newest")
            .catch(() => ({ results: [], count: 0 })),
        fetchMakers().catch(() => []),
    ]);

    // 3. 表示名の決定
    const makerObj = makersData.find((m: any) => 
        m.slug === decodedSlug || m.maker?.toLowerCase() === decodedSlug.toLowerCase()
    );
    const brandDisplayName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
    const attrDisplayName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";
    
    const pageTitle = attrDisplayName 
        ? `${brandDisplayName} × ${attrDisplayName}` 
        : `${brandDisplayName} の最新PC一覧`;

    const totalCount = pcData?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

    // 4. 構造化データ (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": (pcData?.results || []).map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": offset + index + 1,
                "url": `https://bicstation.com/product/${product.unique_id}`,
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

            <header className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {pageTitle}
                    </h1>
                    <p className={styles.lead}>
                        {brandDisplayName} の最新ラインナップをスペックと価格で比較。
                        最適な1台を見つけるための技術ステーション。
                    </p>
                </div>
            </header>

            <div className={styles.wrapperSingle}>
                <main className={styles.mainFull}>
                    <section className={styles.productSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.productGridTitle}>
                                製品カタログ ({totalCount}件)
                            </h2>
                        </div>

                        {!pcData?.results || pcData.results.length === 0 ? (
                            <div className={styles.noDataLarge}>
                                <p>お探しの製品は見かりませんでした。</p>
                                <Link href={`/brand/${decodedSlug}`} className={styles.resetLink}>
                                    条件をリセットする
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((product: any) => (
                                        <ProductCard key={product.unique_id || product.id} product={product} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <nav className={styles.paginationWrapper}>
                                        <div className={styles.pagination}>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                <Link
                                                    key={p}
                                                    href={{
                                                        pathname: `/brand/${decodedSlug}`,
                                                        query: { 
                                                            ...(attributeSlug ? { attribute: attributeSlug } : {}),
                                                            page: p 
                                                        }
                                                    }}
                                                    className={p === currentPage ? styles.pageActive : styles.pageLink}
                                                >
                                                    {p}
                                                </Link>
                                            ))}
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