/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import AdultProductCard from "@shared/cards/AdultProductCard"; 
import Sidebar from "@shared/layout/Sidebar";
import Pagination from "@shared/common/Pagination"; 
import { getAdultProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import { COLORS } from "@shared/styles/constants";
import styles from "./BrandPage.module.css";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ offset?: string; attribute?: string }>;
}

// 属性表示名のマッピング
function getAttributeDisplayName(slug: string) {
    const mapping: { [key: string]: string } = {
        'vr-content': 'VR対応',
        '4k-ultra-hd': '4K超高画質',
        'exclusive': '独占配信',
        'rental-available': 'レンタル可能',
        'sale-item': 'セール中',
    };
    return mapping[slug] || slug;
}

export default async function BrandPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const sParams = await searchParams;
    
    const currentOffset = Number(sParams.offset) || 0;
    const attributeSlug = sParams.attribute || "";
    const limit = 12; 

    let pcData: any = { results: [], count: 0 };
    let makersData: any[] = [];
    let wpData: any = { results: [] };
    const debugLogs: string[] = [];

    // 🚩 判定ロジックの強化
    const lowerSlug = decodedSlug.toLowerCase();
    // DMM / FANZA / DUGA のいずれかであればプラットフォームモード
    const isMainPlatform = ['duga', 'fanza', 'dmm'].includes(lowerSlug);
    
    // API送信用ソース名の正規化
    // ※DMMとFANZAをAPI側で区別している場合は注意が必要。一般的には 'FANZA' または 'DUGA'
    const apiSourceValue = lowerSlug === 'duga' ? 'DUGA' : 'FANZA'; 

    try {
        const [mRes, wRes] = await Promise.all([
            fetchMakers().catch(() => []),
            fetchPostList(5).catch(() => ({ results: [] }))
        ]);
        
        makersData = Array.isArray(mRes) ? mRes : (mRes as any).results || [];
        wpData = wRes || { results: [] };

        const apiParams: any = {
            offset: currentOffset,
            limit: limit,
            attribute: attributeSlug,
        };

        if (isMainPlatform) {
            // プラットフォーム全体の表示
            apiParams.api_source = apiSourceValue; 
            debugLogs.push(`Mode: Platform (${apiSourceValue})`);
        } else {
            // 特定メーカーの表示
            apiParams.maker = decodedSlug; 
            debugLogs.push(`Mode: Maker (${decodedSlug})`);
        }

        // APIリクエスト実行
        pcData = await getAdultProducts(apiParams);
        debugLogs.push(`Result: ${pcData?.count || 0} items found.`);

    } catch (e: any) {
        debugLogs.push(`Error: ${e.message}`);
    }

    const makerObj = makersData.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug);
    const brandDisplayName = makerObj ? (makerObj.name || makerObj.maker) : decodedSlug.toUpperCase();
    const primaryColor = COLORS?.SITE_COLOR || '#e94560';
    const totalCount = pcData?.count || 0;

    return (
        <div className={styles.pageContainer}>
            {/* デバッグ用（不要なら削除） */}
            <details style={{ background: '#000', color: '#0f0', fontSize: '10px', padding: '5px' }}>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify({ isMainPlatform, apiSourceValue, decodedSlug, totalCount }, null, 2)}</pre>
                <ul>{debugLogs.map((l, i) => <li key={i}>{l}</li>)}</ul>
            </details>

            <div className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {brandDisplayName} 最新作品一覧
                    </h1>
                    <span className={styles.countBadge}>{totalCount.toLocaleString()} items</span>
                </div>
            </div>

            <div className={styles.wrapper}>
                <aside className={styles.sidebar}>
                    <Sidebar makers={makersData} latestPosts={wpData?.results || []} />
                </aside>

                <main className={styles.main}>
                    <section className={styles.productSection}>
                        {(!pcData?.results || pcData.results.length === 0) ? (
                            <div className={styles.noDataLarge}>
                                <p>作品が見つかりませんでした。</p>
                                <Link href="/">トップへ戻る</Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((item: any) => (
                                        <AdultProductCard 
                                            key={item.id} 
                                            product={{
                                                ...item,
                                                // 💡 ここが重要：Card内でテーマ分岐ができるように情報を補完
                                                api_source: item.api_source || apiSourceValue, 
                                                title: item.title || item.name,
                                                thumbnail: item.image_url || (item.image_url_list?.[0])
                                            }} 
                                        />
                                    ))}
                                </div>

                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={totalCount}
                                    basePath={`/brand/${decodedSlug}`}
                                />
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}