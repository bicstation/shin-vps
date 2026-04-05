/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getUnifiedProducts } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { UnifiedPost } from '@/shared/lib/api/types';

import styles from './page.module.css';

/**
 * 💡 レンダリングポリシー
 * 本番環境での確実なデータ更新を保証
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "avflash.xyz";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | AI解析・最新アダルトアーカイブ`,
        description: `${siteConfig.site_name}のAI解析に基づいた最新アーカイブ。`,
        host: host 
    });
}

/**
 * 🛡️ API通信の安全な実行
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        // 本番ではログのみに留め、UIを壊さない
        console.warn(`⚠️ [API_SKIP]:`, e.message);
        return fallback;
    }
}

export default async function Page() {
    // --- 🎯 STEP 1: サイトアイデンティティの特定 ---
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "avflash.xyz";
    const siteConfig = getSiteMetadata(host); 
    
    // サイトタグの正規化
    const siteTag = (siteConfig.site_tag || 'avflash').replace(/\/+$/, ''); 
    const ROUTE_BASE = "/post"; 

    // --- 🎯 STEP 2: 並列データ取得 ---
    const [postResponse, dugaRes] = await Promise.all([
        // 1. 最新分析記事 (Django API)
        safeFetch(
            fetchPostList(6, 0, host), 
            { results: [], count: 0 }
        ),
        // 2. DUGA アーカイブ
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 12, brand: 'DUGA', host: host }), 
            { results: [], count: 0 }
        ),
    ]);

    const latestPosts: UnifiedPost[] = postResponse?.results || [];
    const products = dugaRes?.results || [];
    const totalCount = dugaRes?.count || 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentStream}>
                
                {/* --- 🛸 ヒーローヘッダー [PROD_DESIGN] --- */}
                <header className={styles.heroHeader}>
                    <div className={styles.heroBadge}>AI ANALYSIS & ARCHIVE SYSTEM</div>
                    <h1 className={styles.heroTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.heroSubtitle}>
                        AI技術によって抽出された <span style={{ color: '#ffc107', fontWeight: 'bold' }}>DUGA</span> の最新トレンドと、独自視点のアーカイブ。
                    </p>
                    <div className={styles.statsInfo}>
                        <span className={styles.pulseDot}></span>
                        アーカイブ総数: <strong>{totalCount.toLocaleString()}</strong> アイテム
                    </div>
                </header>

                {/* --- 📰 LATEST ANALYSIS (最新記事) --- */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleWrapper}>
                            <h2 className={styles.sectionTitle}>LATEST REPORTS</h2>
                            <div className={styles.titleLine} />
                        </div>
                        <Link href={ROUTE_BASE} className={styles.viewAllLink}>
                            すべての記事を見る →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
                                <p className="text-slate-400">現在、最新の分析データを同期中です。</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 💎 NEW RELEASES (商品リスト) --- */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleWrapper}>
                            <h2 className={styles.sectionTitle}>NEW ARCHIVES</h2>
                            <div className={styles.titleLine} />
                        </div>
                        <Link href="/brand/duga" className={styles.viewAllLink}>
                            アーカイブ一覧 →
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {products.length > 0 ? (
                            products.map((item) => (
                                <UnifiedProductCard 
                                    key={item.id} 
                                    data={item} 
                                    siteConfig={siteConfig} 
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">
                                <div className="text-3xl mb-4">🛰️</div>
                                <h3 className="text-white font-medium">CONNECTING DATA STREAM</h3>
                                <p className="text-sm text-slate-500 mt-2">データベースから最新情報を取得しています...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 🛡️ サイト・インフォメーション [CREDIBILITY] --- */}
                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <h3 className="text-blue-500 font-bold mb-3">ABOUT AI ANALYSIS SYSTEM</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {siteConfig.site_name} は、日々更新される膨大なデジタルコンテンツをAIアルゴリズムによって解析。
                            独自の基準に基づき、データの傾向分析とアーカイブ化を行っています。
                            高度なフィルタリングにより、ユーザーに最適化されたインテリジェンスを提供することを目指しています。
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}