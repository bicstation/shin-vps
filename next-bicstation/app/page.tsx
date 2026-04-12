/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION TOP_NODE_V10.0 (Unified Intelligence Archive)
 * 🛡️ Maya's Logic: 物理構造 v3.2 / Zenith v10.0 同期版
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Activity, ShieldCheck, Zap, TrendingUp, BarChart3, Database } from 'lucide-react';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API (Zenith v10.0 仕様)
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 💡 負荷対策: 10分間はキャッシュを利用（SEOと負荷のバランス）

/**
 * 🛠️ 高精度 safeFetch (エラーハンドリングを強化)
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [SYSTEM_FETCH_ERROR]:`, e);
        return fallback;
    }
}

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name.toUpperCase()} | テクノロジー・ナレッジ・アーカイブ`,
        description: `${siteConfig.site_name}は、数千件の製品データとAI解析スコアを統合したタクティカル・アーカイブです。`,
        host: host 
    });
}

export default async function HomePageMain() {
    // --- 🎯 STEP 1: コンテキスト特定 ---
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 

    // --- 🎯 STEP 2: マルチ並列データフェッチ (負荷分散型) ---
    // ランキングと記事を一度に取得。Promise.all で CPU/ネットワーク効率を最大化。
    const [newsRes, scoreRank, popularityRank] = await Promise.all([
        safeFetch(fetchDjangoBridgeContent('posts', 6), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking('score', host), []),
        safeFetch(fetchPCProductRanking('popularity', host), [])
    ]);

    const recentPosts = newsRes?.results || [];
    const aiTop3 = scoreRank.slice(0, 3);
    const trendTop3 = popularityRank.slice(0, 3);
    const totalCount = newsRes?.count || "1,800+";

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー */}
            <header className={styles.systemStatus}>
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>CORE_CONNECTED</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>DATABASE_NODE_V10.0</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <Database className="inline w-3 h-3 mr-1" />
                        CAPACITY: <span className={styles.countNum}>{totalCount.toLocaleString()} DATA_POINTS</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <div className={styles.heroGlow}></div>
                <h1 className={styles.glitchTitle}>
                    {siteConfig.site_name.toUpperCase()}
                </h1>
                <p className={styles.subText}>
                    AI解析スコアと市場流動性を統合した、次世代ハードウェア・データベース。
                </p>
            </section>

            <div className={styles.contentContainer}>
                
                {/* 🏆 DOUBLE_RANKING_PANEL (AI & TREND) */}
                <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: AI ANALYSIS RANKING */}
                    <div className={styles.rankingPanel}>
                        <div className={styles.panelHeader}>
                            <BarChart3 className="text-blue-400 w-5 h-5" />
                            <h2 className={styles.panelTitle}>AI_ANALYSIS_TOP_3</h2>
                        </div>
                        <div className="space-y-4">
                            {aiTop3.map((product, i) => (
                                <Link href={`/product/${product.unique_id}`} key={product.id} className={styles.rankingRow}>
                                    <span className={styles.rankNum}>{i + 1}</span>
                                    <div className={styles.rankInfo}>
                                        <span className={styles.rankName}>{product.name}</span>
                                        <span className={styles.rankDetail}>SCORE: {product.score_total || '90+'}</span>
                                    </div>
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: MARKET TREND RANKING */}
                    <div className={styles.rankingPanel}>
                        <div className={styles.panelHeader}>
                            <TrendingUp className="text-orange-400 w-5 h-5" />
                            <h2 className={styles.panelTitle}>MARKET_TREND_TOP_3</h2>
                        </div>
                        <div className="space-y-4">
                            {trendTop3.map((product, i) => (
                                <Link href={`/product/${product.unique_id}`} key={product.id} className={styles.rankingRow}>
                                    <span className={`${styles.rankNum} ${styles.trendColor}`}>{i + 1}</span>
                                    <div className={styles.rankInfo}>
                                        <span className={styles.rankName}>{product.name}</span>
                                        <span className={styles.rankDetail}>{product.maker} / HOT_ACCESS</span>
                                    </div>
                                    <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 📰 LATEST_RECORDS (記事) */}
                <section className="mb-20">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>LATEST_RECORDS</h2>
                        <Link href="/post" className={styles.viewAll}>VIEW_ALL_REPORTS →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                data={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                </section>

                {/* ⚙️ HARDWARE_CATEGORIES */}
                <section className="mb-20">
                    <h2 className={styles.sectionTitle}>ANALYSIS_CATEGORIES</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['LAPTOP', 'GAMING', 'WORKSTATION', 'MOBILE'].map(cat => (
                            <Link href={`/catalog?q=${cat}`} key={cat} className={styles.categoryCard}>
                                <ShieldCheck className="w-4 h-4 mb-2 opacity-50" />
                                <span>{cat}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 🛡️ MISSION_STATEMENT */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <p className={styles.missionText}>
                            {siteConfig.site_name} は、技術情報の永続的な保存とAIによる客観的評価を目的としたインテリジェンス・アーカイブです。
                            ノイズを排除し、純粋なスペックと市場動向から最適な選択肢を提示します。
                        </p>
                    </div>
                </section>
            </div>

            {/* 👣 フッター */}
            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name.toUpperCase()} | PROTOCOL_STABLE_V10
                </p>
            </footer>
        </div>
    );
}