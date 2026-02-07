/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import AdultProductCard from "@shared/cards/AdultProductCard"; 
import Sidebar from "@shared/layout/Sidebar";
import Pagination from "@shared/common/Pagination"; 
// 💡 @shared/lib/api/django からアダルト製品取得用関数をインポート
import { getAdultProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
// 💡 共通の定数ファイルからCOLORSを取得
import { COLORS } from "@shared/styles/constants";
import styles from "./BrandPage.module.css";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ offset?: string; attribute?: string }>;
}

/**
 * 💡 属性名変換
 * スラグ（URL上の名称）を、ユーザーに読みやすい日本語の名称に変換します
 */
function getAttributeDisplayName(slug: string) {
    const mapping: { [key: string]: string } = {
        'vr-content': 'VR対応',
        '4k-ultra-hd': '4K超高画質',
        'exclusive': '独占配信',
        'rental-available': 'レンタル可能',
        'sale-item': 'セール中',
        'genre-amateur': '素人・個人撮影',
        'genre-high-res': '高画質配信',
        'genre-debut': '単体デビュー',
        'fanza-limited': 'FANZA限定',
        'duga-exclusive': 'DUGA独占',
    };
    if (mapping[slug]) return mapping[slug];
    // マッピングにない場合は、ハイフンをスペースに変えてキャピタライズ
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * 💡 HTMLデコード
 * APIから返ってくる特殊文字（&amp; 等）を正常な文字に戻します
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
 * 💡 メタデータ生成
 */
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ attribute?: string }> }) {
    try {
        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        const sParams = await searchParams;
        
        const makers = await fetchMakers();
        const normalizedSlug = ['duga', 'fanza'].includes(decodedSlug.toLowerCase()) ? decodedSlug.toUpperCase() : decodedSlug;
        
        const makerObj = Array.isArray(makers) 
            ? makers.find((m: any) => m.slug === decodedSlug || m.maker === decodedSlug || m.maker === normalizedSlug) 
            : null;
            
        const brandName = makerObj ? (makerObj.name || makerObj.maker) : normalizedSlug;
        const attrName = sParams.attribute ? getAttributeDisplayName(sParams.attribute) : "";
        
        return {
            title: `${brandName}${attrName ? ` × ${attrName}` : ''} 作品一覧 | TIPER`,
            description: `${brandName}の最新作品情報をリアルタイムで紹介。`,
        };
    } catch (e) {
        return { title: "作品一覧 | TIPER" };
    }
}

/**
 * 💡 メインページコンポーネント
 */
export default async function BrandPage({ params, searchParams }: PageProps) {
    // 1. URLパラメータと検索クエリの解決
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const sParams = await searchParams;
    
    const currentOffset = Number(sParams.offset) || 0;
    const attributeSlug = sParams.attribute || "";
    const limit = 12; 

    // 2. ページの状態管理用変数
    let pcData: any = { results: [], count: 0 };
    let makersData: any[] = [];
    let wpData: any = { results: [] };
    const debugLogs: string[] = [];

    // 🚩 プラットフォーム判定（FANZA/DUGAかどうか）
    const lowerSlug = decodedSlug.toLowerCase();
    const isMainPlatform = ['duga', 'fanza'].includes(lowerSlug);
    const searchKey = isMainPlatform ? decodedSlug.toUpperCase() : decodedSlug;

    // 3. 非同期データ取得の実行
    try {
        debugLogs.push(`Step 1: Fetching Sidebar & News...`);
        
        const [mRes, wRes] = await Promise.all([
            fetchMakers().catch(e => { debugLogs.push(`❌ Makers Error: ${e.message}`); return []; }),
            fetchPostList(5).catch(e => { debugLogs.push(`❌ WP Error: ${e.message}`); return { results: [] }; })
        ]);
        
        makersData = Array.isArray(mRes) ? mRes : (mRes as any).results || [];
        wpData = wRes || { results: [] };

        const apiParams: any = {
            offset: currentOffset,
            limit: limit,
            attribute: attributeSlug,
        };

        if (isMainPlatform) {
            apiParams.api_source = searchKey; 
            debugLogs.push(`Step 2: Requesting api_source=${searchKey}...`);
        } else {
            apiParams.maker = searchKey; 
            debugLogs.push(`Step 2: Requesting maker=${searchKey}...`);
        }

        // 🚀 getAdultProducts を使用してデータを取得
        pcData = await getAdultProducts(apiParams);
        debugLogs.push(`Step 2 Result: ${pcData?.count || 0} items found.`);

    } catch (globalError: any) {
        debugLogs.push(`🚨 Global Error: ${globalError.message}`);
    }

    // 4. 表示用テキストの整形
    const makerObj = makersData.find((m: any) => 
        m.slug === decodedSlug || m.maker === decodedSlug || m.name === searchKey
    );
    
    const brandDisplayName = makerObj ? (makerObj.name || makerObj.maker) : searchKey;
    const attrDisplayName = attributeSlug ? getAttributeDisplayName(attributeSlug) : "";
    const pageTitle = attrDisplayName ? `${brandDisplayName} 【${attrDisplayName}】 特集` : `${brandDisplayName} の最新作品一覧`;
    const primaryColor = COLORS?.SITE_COLOR || '#e91e63';
    const totalCount = pcData?.count || 0;

    return (
        <div className={styles.pageContainer}>
            {/* システムデバッグコンソール */}
            <div style={{ position: 'relative', zIndex: 10000, background: '#000', color: '#0f0', padding: '10px', borderBottom: '2px solid #0f0', fontFamily: 'monospace', fontSize: '12px' }}>
                <details>
                    <summary style={{ cursor: 'pointer' }}>📂 DEBUG CONSOLE: {decodedSlug} ({totalCount} items)</summary>
                    <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <strong>[Server Info]</strong><br/>
                            Slug: {decodedSlug}<br/>
                            Platform: {isMainPlatform ? 'YES' : 'NO'}<br/>
                            SearchKey: {searchKey}
                        </div>
                        <div>
                            <strong>[Execution Logs]</strong>
                            <ul style={{ margin: 0, paddingLeft: '15px' }}>
                                {debugLogs.map((log, i) => <li key={i}>{log}</li>)}
                            </ul>
                        </div>
                    </div>
                </details>
            </div>

            <div className={styles.fullWidthHeader}>
                <div className={styles.headerInner}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIndicator} style={{ backgroundColor: primaryColor }}></span>
                        {pageTitle}
                    </h1>
                    <div className={styles.statsRow}>
                        <span className={styles.countBadge} style={{ borderLeft: `4px solid ${primaryColor}` }}>
                            {totalCount.toLocaleString()} items found
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.wrapper}>
                <aside className={styles.sidebar}>
                    <Sidebar 
                        makers={makersData} 
                        latestPosts={wpData?.results || []}
                    />
                </aside>

                <main className={styles.main}>
                    <div className={styles.filterBar}>
                        <span className={styles.activeFilter}>最新順</span>
                        <span>人気順</span>
                        <span>価格安い順</span>
                    </div>

                    <section className={styles.productSection}>
                        {(!pcData?.results || pcData.results.length === 0) ? (
                            <div className={styles.noDataLarge}>
                                <div className={styles.noDataIcon}>🚫</div>
                                <p className={styles.noDataText}>該当する作品が見つかりませんでした。</p>
                                <Link href="/" className={styles.resetLink} style={{ backgroundColor: primaryColor }}>
                                    ← トップページに戻る
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.productGrid}>
                                    {pcData.results.map((item: any) => (
                                        <AdultProductCard 
                                            key={item.id} 
                                            product={{
                                                ...item,
                                                name: item.title || item.name || "タイトル不明",
                                                thumbnail: item.image_url || (item.image_url_list && item.image_url_list.length > 0 ? item.image_url_list[0] : null)
                                            }} 
                                        />
                                    ))}
                                </div>

                                <div className={styles.paginationWrapper}>
                                    <Pagination 
                                        currentOffset={currentOffset}
                                        limit={limit}
                                        totalCount={totalCount}
                                        basePath={`/brand/${decodedSlug}`}
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